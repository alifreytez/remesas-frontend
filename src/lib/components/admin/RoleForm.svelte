<script lang="ts">
    import { api } from '$lib/utils/api';
    import Input from '$lib/components/ui/Input.svelte';
    import Switch from '$lib/components/ui/Switch.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Grid from '$lib/components/ui/Grid.svelte';
    import Stack from '$lib/components/ui/Stack.svelte';
    import SectionAccordion from '$lib/components/ui/SectionAccordion.svelte';
    import DataGrid from '$lib/components/ui/DataGrid.svelte';
    import { untrack } from 'svelte';
    import { alertMsg } from '$lib/stores/confirm.svelte';

    let { recordId = null, onSuccess } = $props<{
        recordId?: string | number | null;
        onSuccess: () => void;
    }>();

    let currentRoleId = $state(recordId);

    let loading = $state(true);
    let saving = $state(false);
    let error = $state<string | null>(null);

    // Form data
    let code = $state('');
    let description = $state('');
    let hierarchy = $state(100);
    
    // Original State for dirty-checking
    let originalPermissions = $state<number[]>([]);
    let originalInheritances = $state<number[]>([]);

    // Current State for multiple selection
    let selectedPermissions = $state<number[]>([]);
    let selectedInheritances = $state<number[]>([]);

    // Catalogs
    let availableRoles = $state<any[]>([]);
    let availablePermissions = $state<any[]>([]);

    $effect(() => {
        untrack(() => {
            loadData();
        });
    });

    async function loadData() {
        try {
            loading = true;
            error = null;

            // Load catalogs
            const [rolesRes, permsRes] = await Promise.all([
                api.get<any>('/roles?limit=500'),
                api.get<any>('/permissions?limit=1000&include=true')
            ]);

            const allRoles = rolesRes?.data?.rows || rolesRes?.data || [];
            availablePermissions = permsRes?.data?.rows || permsRes?.data || [];
                        availableRoles = recordId ? allRoles.filter((r: any) => r.id != recordId) : allRoles;

            // If editing, load role
            if (recordId) {
                const roleRes = await api.get<any>(`/roles/${recordId}`);
                const role = roleRes?.data;
                
                if (role) {
                    code = role.code || '';
                    description = role.description || '';
                    hierarchy = role.hierarchy ?? 100;

                    // Load Inheritances (Parent Roles)
                    if (role.parentRoles && Array.isArray(role.parentRoles)) {
                        selectedInheritances = role.parentRoles.map((r: any) => r.parentRole || r.role || r.id);
                    } else if (role._ParentRoles && Array.isArray(role._ParentRoles)) {
                        selectedInheritances = role._ParentRoles.map((r: any) => r.parentRole || r.role || r.id);
                    }
                    
                    // Load Permissions
                    if (role.permissions && Array.isArray(role.permissions)) {
                        selectedPermissions = role.permissions.map((p: any) => p.permission || p.permissionId || p.id);
                    } else if (role._Permissions && Array.isArray(role._Permissions)) {
                        selectedPermissions = role._Permissions.map((p: any) => p.permission || p.permissionId || p.id);
                    }
                }
            } else {
                code = ''; description = ''; hierarchy = 100;
                selectedPermissions = []; selectedInheritances = [];
            }

            originalPermissions = [...selectedPermissions];
            originalInheritances = [...selectedInheritances];

        } catch (err: any) {
            error = err.message || 'Error al cargar los datos';
        } finally {
            loading = false;
        }
    }

    function toggleInheritance(id: number, checked: boolean) {
        if (checked) {
            if (!selectedInheritances.includes(id)) selectedInheritances = [...selectedInheritances, id];
        } else {
            selectedInheritances = selectedInheritances.filter(r => r !== id);
        }
    }

    function togglePermission(id: number, checked: boolean) {
        if (checked) {
            if (!selectedPermissions.includes(id)) selectedPermissions = [...selectedPermissions, id];
        } else {
            selectedPermissions = selectedPermissions.filter(p => p !== id);
        }
    }

    let columnCheckState = $derived.by(() => {
        const state: Record<string, boolean> = {};
        permissionMatrixCols.forEach(col => {
            if (col.key === '_resource_name') return;
            let allIdsForAction: number[] = [];
            availablePermissions.forEach(p => {
                if (p._Actions?.code === col.key) {
                    allIdsForAction.push(p.id);
                }
            });
            if (allIdsForAction.length === 0) {
                state[col.key] = false;
            } else {
                state[col.key] = allIdsForAction.every(id => selectedPermissions.includes(id));
            }
        });
        return state;
    });

    function toggleAll(action: string, checked: boolean) {
        let allIdsForAction: number[] = [];
        availablePermissions.forEach(p => {
            if (p._Actions?.code === action) {
                allIdsForAction.push(p.id);
            }
        });
        
        if (checked) {
            const newIds = allIdsForAction.filter(id => !selectedPermissions.includes(id));
            selectedPermissions = [...selectedPermissions, ...newIds];
        } else {
            selectedPermissions = selectedPermissions.filter(id => !allIdsForAction.includes(id));
        }
    }

    async function save() {
        if (!code) {
            error = 'Por favor completa el campo obligatorio (Código).';
            return;
        }

        try {
            saving = true;
            error = null;

            const addedPermissions = selectedPermissions.filter(id => !originalPermissions.includes(id));
            const removedPermissions = originalPermissions.filter(id => !selectedPermissions.includes(id));

            const addedInheritances = selectedInheritances.filter(id => !originalInheritances.includes(id));
            const removedInheritances = originalInheritances.filter(id => !selectedInheritances.includes(id));

            const payload = {
                body: {
                    code: code.toUpperCase(),
                    description,
                    hierarchy
                },
                permissions: addedPermissions,
                permissionsToRemove: removedPermissions
            };

            if (currentRoleId) {
                await api.patch(`/roles/${currentRoleId}`, payload);
            } else {
                const response = await api.post<{data: any}>(`/roles`, payload);
                currentRoleId = response.data?.id || response.data?.data?.id;
            }

            // Step 2: Manage Inheritances
            if (currentRoleId) {
                if (addedInheritances.length > 0) {
                    await api.post(`/roles/${currentRoleId}/inheritances`, addedInheritances);
                }
                
                if (removedInheritances.length > 0) {
                    await api.patch(`/roles/${currentRoleId}/inheritances/uninheritances`, removedInheritances);
                }
            }

            originalPermissions = [...selectedPermissions];
            originalInheritances = [...selectedInheritances];
            alertMsg('Los datos del registro han sido guardados exitosamente.', 'success', 'Registro Actualizado');
        } catch (err: any) {
            error = err.response?.data?.message || err.message || 'Error al guardar el rol';
        } finally {
            saving = false;
        }
    }

    // --- Configuración DataGrid Herencias ---
    let inheritanceCols = $derived.by(() => {
        const validRoles = availableRoles.filter(r => r.hierarchy >= hierarchy);
        const isAllChecked = validRoles.length > 0 && validRoles.every(r => selectedInheritances.includes(r.id));
        return [
            { key: 'description', label: 'Rol' },
            { 
                key: 'assign', 
                label: 'Heredar', 
                align: 'center' as const, 
                width: '120px',
                type: 'switch',
                isAllChecked,
                onToggleAll: (checked: boolean) => {
                    if (checked) {
                        const validRoles = availableRoles.filter(r => r.hierarchy >= hierarchy);
                        const newIds = validRoles.map(r => r.id).filter(id => !selectedInheritances.includes(id));
                        selectedInheritances = [...selectedInheritances, ...newIds];
                    } else {
                        const roleIds = availableRoles.map(r => r.id);
                        selectedInheritances = selectedInheritances.filter(id => !roleIds.includes(id));
                    }
                }
            }
        ];
    });

    // --- Configuración Matriz de Permisos ---
    let permissionMatrixCols = $derived.by(() => {
        const actionSet = new Set<string>();
        availablePermissions.forEach(p => {
            const actionCode = p._Actions?.code;
            if (actionCode) actionSet.add(actionCode);
        });
        
        const cols: any[] = [{ key: '_resource_name', label: 'Recurso' }];
        Array.from(actionSet).sort().forEach(action => {
            const colPerms = permissionMatrixData.filter(row => row._perms && row._perms[action]).map(row => row._perms[action].id);
            const isAllChecked = colPerms.length > 0 && colPerms.every(id => selectedPermissions.includes(id));
            
            cols.push({ 
                key: action, 
                label: action, 
                align: 'center' as const,
                type: 'switch',
                isAllChecked,
                onToggleAll: (checked: boolean) => toggleAll(action, checked)
            });
        });
        return cols;
    });

    let permissionMatrixData = $derived.by(() => {
        const resourceMap = new Map<string, any>();
        
        availablePermissions.forEach(p => {
            const resourceCode = p._Resources?.code || 'GENERAL';
            const resourceDesc = p._Resources?.description || resourceCode;
            const actionCode = p._Actions?.code;
            
            if (!resourceMap.has(resourceCode)) {
                resourceMap.set(resourceCode, { _resource_name: resourceDesc, _perms: {} });
            }
            
            if (actionCode) {
                const row = resourceMap.get(resourceCode);
                row._perms[actionCode] = p;
            }
        });
        
        return Array.from(resourceMap.values());
    });
</script>

<div class="role-form">
    {#if loading}
        <div class="loading-state">Cargando formulario...</div>
    {:else}
        <Stack gap="var(--spacing-6)">
            {#if error}
                <div class="error-alert">{error}</div>
            {/if}

            <SectionAccordion title="Datos del Rol" open={true}>
                <Grid cols={3} gap="var(--spacing-4)">
                    <Input label="Código" bind:value={code} placeholder="Ej: ADMIN" required />
                    <Input label="Descripción" bind:value={description} placeholder="Breve descripción..." />
                    <Input type="number" label="Jerarquía (1=Mayor)" bind:value={hierarchy} placeholder="Ej: 100" required />
                </Grid>
            </SectionAccordion>

            <SectionAccordion title="Herencia de Roles" open={false}>
                <p class="section-desc">Selecciona de qué otros roles heredará permisos automáticamente.</p>
                <DataGrid columns={inheritanceCols} data={availableRoles}>
                    {#snippet cell(row, colKey)}
                        {#if colKey === 'description'}
                            <div class="switch-info">
                                <span class="item-name">{row.code}</span>
                                <span class="item-desc">{row.description || 'Sin descripción'} (Jerarquía: {row.hierarchy})</span>
                            </div>
                        {:else if colKey === 'assign'}
                            <div class="center-switch">
                                <Switch 
                                    checked={selectedInheritances.includes(row.id)} 
                                    disabled={row.hierarchy < hierarchy}
                                    title={row.hierarchy < hierarchy ? 'No puede heredar de un rol con mayor jerarquía' : ''}
                                    onchange={(checked) => toggleInheritance(row.id, checked)}
                                />
                            </div>
                        {/if}
                    {/snippet}
                </DataGrid>
            </SectionAccordion>

            <SectionAccordion title="Permisos Granulares Directos" open={false}>
                <p class="section-desc">Matriz de permisos explícitos asignados directamente a este rol.</p>
                <DataGrid columns={permissionMatrixCols} data={permissionMatrixData}>
                    {#snippet cell(row, colKey)}
                        {#if colKey === '_resource_name'}
                            <strong>{row._resource_name}</strong>
                        {:else}
                            {#if row._perms[colKey]}
                                <div class="center-switch">
                                    <Switch 
                                        checked={selectedPermissions.includes(row._perms[colKey].id)} 
                                        onchange={(checked) => togglePermission(row._perms[colKey].id, checked)}
                                    />
                                </div>
                            {:else}
                                <span class="no-perm">-</span>
                            {/if}
                        {/if}
                    {/snippet}
                </DataGrid>
            </SectionAccordion>

            <div class="form-actions">
                <Button variant="primary" onclick={save} disabled={saving}>
                    {saving ? 'Guardando...' : (currentRoleId ? 'Actualizar Rol' : 'Crear Rol')}
                </Button>
            </div>
        </Stack>
    {/if}
</div>

<style>
    .role-form {
        width: 100%;
        max-width: 100%;
        min-width: 0;
    }

    .loading-state {
        text-align: center;
        padding: var(--spacing-8);
        color: var(--gray-500);
    }

    .error-alert {
        background: #fef2f2;
        color: var(--danger-600);
        padding: var(--spacing-3) var(--spacing-4);
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        border: 1px solid #fecaca;
    }

    .section-desc {
        font-size: var(--text-sm);
        color: var(--gray-500);
        margin-bottom: var(--spacing-4);
    }

    .switch-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .item-name {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--gray-900);
    }

    .item-code {
        font-size: 12px;
        color: var(--gray-500);
    }

    .center-switch {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .no-perm {
        color: var(--gray-300);
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: var(--spacing-8);
        padding-top: var(--spacing-6);
        border-top: 1px solid var(--gray-200);
    }
</style>
