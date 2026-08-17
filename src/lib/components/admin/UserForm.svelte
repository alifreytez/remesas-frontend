<script lang="ts">
    import { api } from '$lib/utils/api';
    import Input from '$lib/components/ui/Input.svelte';
    import Select from '$lib/components/ui/Select.svelte';
    import Switch from '$lib/components/ui/Switch.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Grid from '$lib/components/ui/Grid.svelte';
    import Stack from '$lib/components/ui/Stack.svelte';
    import SectionAccordion from '$lib/components/ui/SectionAccordion.svelte';
    import { Save, X } from 'lucide-svelte';

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
    let selectedRoles = $state<number[]>([]);
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
                api.get<any>('/roles?limit=100'),
                api.get<any>('/permissions?limit=500')
            ]);

            availableRoles = rolesRes?.data?.rows || [];
            availablePermissions = permsRes?.data?.rows || [];

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

                    if (user._Roles) {
                        selectedRoles = user._Roles.map((r: any) => r.id || r.roleId || r.role);
                    }

                    if (user._Permissions) {
                        selectedPermissions = user._Permissions.map((p: any) => p.id || p.permissionId || p.permission);
                    }
                }
            } else {
                // Reset form for creation
                firstName = ''; lastName = ''; documentNumber = ''; phone = '';
                username = ''; email = ''; password = '';
                selectedRoles = []; selectedPermissions = [];
            }

        } catch (err: any) {
            error = err.message || 'Error al cargar los datos';
        } finally {
            loading = false;
        }
    }

    function toggleRole(id: number, checked: boolean) {
        if (checked) {
            if (!selectedRoles.includes(id)) selectedRoles = [...selectedRoles, id];
        } else {
            selectedRoles = selectedRoles.filter(r => r !== id);
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
                roles: selectedRoles,
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

            <SectionAccordion title="Datos de la Cuenta" open={true}>
                <Grid cols={2} gap="var(--spacing-4)">
                    <Input label="Usuario" bind:value={username} required placeholder="Ej: jperez" />
                    <Input 
                        label="Contraseña" 
                        bind:value={password} 
                        type="password" 
                        required={!recordId} 
                        placeholder={recordId ? 'Dejar en blanco para no cambiar' : '........'} 
                    />
                </Grid>
                <div style="margin-top: var(--spacing-4);">
                    <Input label="Correo Electrónico" bind:value={email} type="email" placeholder="ejemplo@correo.com" required />
                </div>
            </SectionAccordion>

            <SectionAccordion title="Asignación de Roles" open={false}>
                <div class="roles-grid">
                    {#each availableRoles as role}
                        <div class="switch-item">
                            <Switch 
                                checked={selectedRoles.includes(role.id)} 
                                onchange={(checked) => toggleRole(role.id, checked)}
                            />
                            <div class="switch-info">
                                <span class="item-name">{role.name}</span>
                                <span class="item-code">{role.code}</span>
                            </div>
                        </div>
                    {/each}
                </div>
            </SectionAccordion>

            <SectionAccordion title="Permisos Granulares Adicionales" open={false}>
                <div class="permissions-grid">
                    {#each availablePermissions as perm}
                        <div class="switch-item">
                            <Switch 
                                checked={selectedPermissions.includes(perm.id)} 
                                onchange={(checked) => togglePermission(perm.id, checked)}
                            />
                            <div class="switch-info">
                                <span class="item-name">{perm.name}</span>
                                <span class="item-code">{perm.code}</span>
                            </div>
                        </div>
                    {/each}
                </div>
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

    .roles-grid, .permissions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: var(--spacing-4);
        background: var(--neutral-50);
        padding: var(--spacing-4);
        border-radius: var(--radius-lg);
        border: 1px solid var(--neutral-200);
    }

    .switch-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
    }

    .switch-info {
        display: flex;
        flex-direction: column;
    }

    .item-name {
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--neutral-900);
    }

    .item-code {
        font-size: 12px;
        color: var(--neutral-500);
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
