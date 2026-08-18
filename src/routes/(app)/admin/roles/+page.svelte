<script lang="ts">
    import { setHeader } from '$lib/stores/header.svelte';
    import PermissionGuard from '$lib/components/auth/PermissionGuard.svelte';
    import { auth } from '$lib/stores/auth.svelte';
    import { api } from '$lib/utils/api';
    import Table from '$lib/components/ui/Table.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Section from '$lib/components/layout/Section.svelte';
    import SectionTitle from '$lib/components/layout/SectionTitle.svelte';
    import { ShieldPlus, Edit2, Trash2 } from 'lucide-svelte';
    import { fly } from 'svelte/transition';
    import RoleForm from '$lib/components/admin/RoleForm.svelte';
    import { confirm, alertMsg } from '$lib/stores/confirm.svelte';
    
    let roles = $state<any[]>([]);
    let loading = $state(true);
    let error = $state<string | null>(null);

    // Slide View State
    let currentView = $state<'list' | 'form'>('list');
    let selectedRoleId = $state<string | number | null>(null);

    $effect(() => {
        setHeader('Directorio de Roles y Permisos', false, '', null);
        return () => {
            setHeader('', false, '', null);
        };
    });

    $effect(() => {
        if (currentView === 'list' && auth.hasPermission('UI:VIEW:ROLES')) {
            fetchRoles();
        }
    });

    async function fetchRoles() {
        try {
            loading = true;
            const response = await api.get<{ data: { rows: any[] } }>('/roles?limit=500');
            roles = response.data?.rows || response.data || [];
        } catch (err: any) {
            error = err.message || 'Error al cargar roles';
        } finally {
            loading = false;
        }
    }

    function openForm(roleId: string | number | null = null) {
        selectedRoleId = roleId;
        currentView = 'form';
    }

    function closeForm() {
        currentView = 'list';
        selectedRoleId = null;
    }

    async function handleDelete(roleId: string | number) {
        const confirmed = await confirm({
            title: 'Eliminar Rol',
            message: '¿Estás seguro de que deseas eliminar este rol? Esta acción puede afectar a todos los usuarios que lo tengan asignado.',
            type: 'danger',
            confirmText: 'Sí, eliminar'
        });
        if (confirmed) {
            try {
                await api.delete(`/roles/${roleId}`);
                await fetchRoles();
                alertMsg('Rol eliminado exitosamente', 'success');
            } catch (err: any) {
                alertMsg(err.message || 'Error al eliminar rol', 'danger');
            }
        }
    }

    // Configuración de la tabla
    const columns = [
        { key: 'code', label: 'Código', filterType: 'text' as const },
        { key: 'description', label: 'Descripción', filterType: 'text' as const },
        { key: 'parent_roles', label: 'Hereda de', filterType: 'text' as const },
        { key: 'status', label: 'Estado', format: 'badge' as const, badgeMap: { 'Activo': 'success', 'Inactivo': 'danger' }, width: '1%' }
    ];

    // Formatear los datos para la tabla
    let tableData = $derived(roles.map(r => ({
        id: r.id,
        code: r.code,
        description: r.description || 'Sin descripción',
        parent_roles: r.parentRoles && r.parentRoles.length > 0 ? r.parentRoles.map((pr: any) => pr.code || pr.name).join(', ') : 'Ninguno',
        status: (r.deletedAt || r.deleted_at) ? 'Inactivo' : 'Activo'
    })));
</script>

<PermissionGuard permission="UI:VIEW:ROLES">
    <div class="roles-page">
        <Section>
            <SectionTitle 
                title={currentView === 'form' ? (selectedRoleId ? 'Editar Rol' : 'Nuevo Rol') : 'Gestión de Seguridad y Accesos'}
                subtitle={currentView === 'form' ? 'Modifica los datos del rol, sus permisos y herencias.' : 'Administra los roles del sistema, sus jerarquías y políticas de acceso.'}
                onBack={currentView === 'form' ? closeForm : undefined}
            >
                {#snippet action()}
                    {#if currentView === 'list'}
                        <PermissionGuard permission="UI:CREATE:ROLES">
                            <Button variant="primary" onclick={() => openForm(null)}>
                                <ShieldPlus size={18} />
                                Nuevo Rol
                            </Button>
                        </PermissionGuard>
                    {/if}
                {/snippet}
            </SectionTitle>

            <div class="view-slider-container">
                {#if currentView === 'form'}
                    <div class="slide-view" in:fly={{ x: 50, duration: 300 }} out:fly={{ x: 50, duration: 300 }}>
                        <RoleForm 
                            recordId={selectedRoleId} 
                            onSuccess={closeForm} 
                        />
                    </div>
                {:else}
                    <div class="slide-view" in:fly={{ x: -50, duration: 300 }} out:fly={{ x: -50, duration: 300 }}>
                        {#if loading}
                            <div class="loading-state">Cargando roles...</div>
                        {:else if error}
                            <div class="error-state">{error}</div>
                        {:else}
                            <Table 
                                {columns} 
                                data={tableData}
                                variant="v2"
                                paginated={true}
                                hasActions={auth.hasPermission('UI:UPDATE:ROLES') || auth.hasPermission('UI:DELETE:ROLES')}
                            >
                                {#snippet actions(row)}
                                    <div class="actions-group">
                                        {#if row.status === 'Activo'}
                                            <PermissionGuard permission="UI:UPDATE:ROLES">
                                                <button class="action-icon-btn edit" title="Editar" onclick={() => openForm(row.id)}>
                                                    <Edit2 size={16} />
                                                </button>
                                            </PermissionGuard>
                                            <PermissionGuard permission="UI:DELETE:ROLES">
                                                <button class="action-icon-btn delete" title="Eliminar" onclick={() => handleDelete(row.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </PermissionGuard>
                                        {/if}
                                    </div>
                                {/snippet}
                            </Table>
                        {/if}
                    </div>
                {/if}
            </div>
        </Section>
    </div>
</PermissionGuard>

<style>
    .roles-page {
        padding: 0;
    }

    .view-slider-container {
        display: grid;
        overflow-x: hidden;
    }

    .slide-view {
        grid-area: 1 / 1;
        width: 100%;
    }

    .loading-state, .error-state {
        padding: var(--spacing-8);
        text-align: center;
        color: var(--neutral-500);
    }

    .error-state {
        color: var(--danger-600);
    }

    .actions-group {
        display: flex;
        gap: var(--spacing-2);
        justify-content: center;
        width: 100%;
    }

    .action-icon-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: var(--spacing-2);
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        color: var(--neutral-500);
    }

    .action-icon-btn.edit:hover {
        background: var(--primary-50);
        color: var(--primary-600);
    }

    .action-icon-btn.delete:hover {
        background: #fef2f2;
        color: var(--danger-600);
    }
</style>
