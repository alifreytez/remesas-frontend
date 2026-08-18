<script lang="ts">
    import { api } from '$lib/utils/api';
    import Input from '$lib/components/ui/Input.svelte';
    import Select from '$lib/components/ui/Select.svelte';
    import Switch from '$lib/components/ui/Switch.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Grid from '$lib/components/ui/Grid.svelte';
    import Stack from '$lib/components/ui/Stack.svelte';
    import SectionAccordion from '$lib/components/ui/SectionAccordion.svelte';
    import DataGrid from '$lib/components/ui/DataGrid.svelte';
    import { Save, X } from 'lucide-svelte';
    import { untrack } from 'svelte';

    let { recordId = null, onSuccess, onCancel } = $props<{
        recordId?: string | number | null;
        onSuccess: () => void;
        onCancel: () => void;
    }>();

    let loading = $state(false);
    let saving = $state(false);
    let error = $state<string | null>(null);

    // Form data
    let firstName = $state('');
    let lastName = $state('');
    let documentNumber = $state('');
    let phone = $state('');
    let username = $state('');
    let email = $state('');
    let password = $state('');
    
    // Arrays for multiple selection
    let selectedRoleId = $state<string | number | null>('');
    let selectedPermissions = $state<number[]>([]);

    // Catalogs
    let availableRoles = $state<any[]>([]);
    let availablePermissions = $state<any[]>([]);

    $effect(() => {
        loadData();
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

            availableRoles = rolesRes?.data?.rows || rolesRes?.data || rolesRes?.rows || [];
            availablePermissions = permsRes?.data?.rows || permsRes?.data || permsRes?.rows || [];

            // If editing, load user
            if (recordId) {
                const userRes = await api.get<any>(`/users/${recordId}`);
                const user = userRes?.data;
                
                if (user) {
                    username = user.username || '';
                    email = user.email || '';
                    
                    if (user._Person) {
                        firstName = user._Person.firstName || '';
                        lastName = user._Person.lastName || '';
                        documentNumber = user._Person.documentNumber || '';
                        phone = user._Person.phone || '';
                    }

                    if (user._Roles && user._Roles.length > 0) {
                        const firstRole = user._Roles[0];
                        selectedRoleId = firstRole.id || firstRole.roleId || firstRole.role;
                    }

                    if (user._Permissions) {
                        selectedPermissions = user._Permissions.map((p: any) => p.id || p.permissionId || p.permission);
                    }
                }
            } else {
                // Reset form for creation
                firstName = ''; lastName = ''; documentNumber = ''; phone = '';
                username = ''; email = ''; password = '';
                selectedRoleId = ''; selectedPermissions = [];
            }

        } catch (err: any) {
            error = err.message || 'Error al cargar los datos';
        } finally {
            loading = false;
        }
    }



    function togglePermission(id: number, checked: boolean) {
        if (checked) {
            if (!selectedPermissions.includes(id)) selectedPermissions = [...selectedPermissions, id];
        } else {
            selectedPermissions = selectedPermissions.filter(p => p !== id);
        }
    }

    async function save() {
        if (!username || (!recordId && !password)) {
            error = 'Por favor completa los campos obligatorios del usuario.';
            return;
        }

        try {
            saving = true;
            error = null;

            const payload = {
                body: {
                    firstName,
                    lastName,
                    documentNumber,
                    phone,
                    username,
                    email,
                    ...(password ? { password } : {})
                },
                roles: selectedRoleId ? [selectedRoleId] : [],
                permissions: selectedPermissions
            };

            if (recordId) {
                await api.put(`/users/${recordId}`, payload);
            } else {
                await api.post(`/users`, payload);
            }

            onSuccess();
        } catch (err: any) {
            error = err.message || 'Error al guardar el usuario';
        } finally {
            saving = false;
        }
    }

    // --- Configuración Matriz de Permisos ---
    let permissionMatrixCols = $derived.by(() => {
        const actionSet = new Set<string>();
        availablePermissions.forEach(p => {
            const actionCode = p._Actions?.code;
            if (actionCode) actionSet.add(actionCode);
        });
        
        const cols = [{ key: '_resource_name', label: 'Recurso' }];
        Array.from(actionSet).sort().forEach(action => {
            cols.push({ key: action, label: action, align: 'center' as const });
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

<div class="user-form">
    {#if loading}
        <div class="loading-state">Cargando formulario...</div>
    {:else}
        <Stack gap="var(--spacing-6)">
            {#if error}
                <div class="error-alert">{error}</div>
            {/if}

            <SectionAccordion title="Datos de la Persona" open={true}>
                <Grid cols={2} gap="var(--spacing-4)">
                    <Input label="Nombres" bind:value={firstName} placeholder="Ej: Juan Pablo" required />
                    <Input label="Apellidos" bind:value={lastName} placeholder="Ej: Pérez Gómez" required />
                    <Input label="Nro. Documento" bind:value={documentNumber} placeholder="Ej: 12345678" required />
                    <Input label="Teléfono" bind:value={phone} placeholder="Ej: +58 412 1234567" />
                </Grid>
            </SectionAccordion>

            <SectionAccordion title="Datos de la Cuenta y Seguridad" open={true}>
                <Grid cols={2} gap="var(--spacing-4)">
                    <Input label="Usuario" bind:value={username} required placeholder="Ej: jperez" />
                    <Select 
                        label="Rol del Usuario" 
                        options={availableRoles.map(r => ({ value: r.id, label: r.name || r.code }))}
                        bind:value={selectedRoleId}
                    />
                </Grid>
                <div style="margin-top: var(--spacing-4);">
                    <Grid cols={2} gap="var(--spacing-4)">
                        <Input 
                            label="Contraseña" 
                            bind:value={password} 
                            type="password" 
                            required={!recordId} 
                            placeholder={recordId ? 'Dejar en blanco para no cambiar' : '........'} 
                        />
                        <Input label="Correo Electrónico" bind:value={email} type="email" placeholder="ejemplo@correo.com" required />
                    </Grid>
                </div>
            </SectionAccordion>

            <SectionAccordion title="Permisos Granulares Adicionales" open={true}>
                <p class="section-desc">Asigna permisos específicos a este usuario más allá de su rol (opcional).</p>
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
                    {saving ? 'Guardando...' : (recordId ? 'Actualizar Usuario' : 'Crear Usuario')}
                </Button>
            </div>
        </Stack>
    {/if}
</div>

<style>
    .user-form {
        width: 100%;
    }

    .loading-state {
        text-align: center;
        padding: var(--spacing-8);
        color: var(--neutral-500);
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
        gap: var(--spacing-3);
        margin-top: var(--spacing-8);
        padding-top: var(--spacing-6);
        border-top: 1px solid var(--gray-200);
    }
</style>
