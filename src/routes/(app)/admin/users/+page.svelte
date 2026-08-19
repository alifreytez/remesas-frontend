<script lang="ts">
    import { setHeader } from '$lib/stores/header.svelte';
    import PermissionGuard from '$lib/components/auth/PermissionGuard.svelte';
    import { auth } from '$lib/stores/auth.svelte';
    import { api } from '$lib/utils/api';
    import Table from '$lib/components/ui/Table.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Section from '$lib/components/layout/Section.svelte';
    import SectionTitle from '$lib/components/layout/SectionTitle.svelte';
    import Stack from '$lib/components/ui/Stack.svelte';
    import { UserPlus, Edit2, Trash2 } from 'lucide-svelte';
    import { fly } from 'svelte/transition';
    import UserForm from '$lib/components/admin/UserForm.svelte';
    import { confirm, alertMsg } from '$lib/stores/confirm.svelte';
    
    let users = $state<any[]>([]);
    let loading = $state(true);
    let error = $state<string | null>(null);

    // Slide View State
    let currentView = $state<'list' | 'form'>('list');
    let selectedUserId = $state<string | number | null>(null);

    $effect(() => {
        setHeader('Directorio de Usuarios', false, '', null);
        return () => {
            setHeader('', false, '', null);
        };
    });

    $effect(() => {
        if (currentView === 'list' && auth.hasPermission('UI:VIEW:USERS')) {
            fetchUsers();
        }
    });

    async function fetchUsers() {
        try {
            loading = true;
            const response = await api.get<{ data: { rows: any[] } }>('/users');
            users = response.data.rows || [];
        } catch (err: any) {
            error = err.message || 'Error al cargar usuarios';
        } finally {
            loading = false;
        }
    }

    function openForm(userId: string | number | null = null) {
        selectedUserId = userId;
        currentView = 'form';
    }

    function closeForm() {
        currentView = 'list';
        selectedUserId = null;
    }

    async function handleDelete(userId: string | number) {
        const confirmed = await confirm({
            title: 'Eliminar Usuario',
            message: '¿Estás seguro de que deseas eliminar este usuario?',
            type: 'danger',
            confirmText: 'Sí, eliminar'
        });
        if (confirmed) {
            try {
                await api.delete(`/users/${userId}`);
                await fetchUsers();
                alertMsg('Usuario eliminado exitosamente', 'success');
            } catch (err: any) {
                alertMsg(err.message || 'Error al eliminar usuario', 'danger');
            }
        }
    }

    // Configuración de la tabla
    const columns = [
        { key: 'username', label: 'Usuario', filterType: 'text' as const },
        { key: 'email', label: 'Correo', filterType: 'text' as const },
        { key: 'document_number', label: 'Cédula', filterType: 'text' as const },
        { key: 'roles', label: 'Roles', filterType: 'text' as const },
        { key: 'status', label: 'Estado', format: 'badge' as const, badgeMap: { 'Activo': 'success', 'Inactivo': 'danger' }, width: '1%' }
    ];

    // Formatear los datos para la tabla
    let tableData = $derived(users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        document_number: u._Person?.documentNumber || 'N/A',
        status: (u.deletedAt || u.deleted_at) ? 'Inactivo' : 'Activo',
        roles: (u._Roles || []).map((r: any) => r.code).join(', ')
    })));
</script>

<PermissionGuard permission="UI:VIEW:USERS">
    <div class="users-page">
        <Section>
            <SectionTitle 
                title={currentView === 'form' ? (selectedUserId ? 'Editar Usuario' : 'Nuevo Usuario') : 'Gestión de Accesos'}
                subtitle={currentView === 'form' ? 'Modifica los datos del usuario y sus permisos.' : 'Administra los accesos, roles y datos personales de los miembros de la plataforma.'}
                onBack={currentView === 'form' ? closeForm : undefined}
            >
                {#snippet action()}
                    {#if currentView === 'list'}
                        <PermissionGuard permission="UI:CREATE:USERS">
                            <Button variant="primary" onclick={() => openForm(null)}>
                                <UserPlus size={18} />
                                Nuevo Usuario
                            </Button>
                        </PermissionGuard>
                    {/if}
                {/snippet}
            </SectionTitle>

            <div class="view-slider-container">
                {#if currentView === 'form'}
                    <div class="slide-view" in:fly={{ x: 50, duration: 300 }} out:fly={{ x: 50, duration: 300 }}>
                        <UserForm 
                            recordId={selectedUserId} 
                            onSuccess={closeForm} 
                            onCancel={closeForm} 
                        />
                    </div>
                {:else}
                    <div class="slide-view" in:fly={{ x: -50, duration: 300 }} out:fly={{ x: -50, duration: 300 }}>
                        {#if loading}
                            <div class="loading-state">Cargando usuarios...</div>
                        {:else if error}
                            <div class="error-state">{error}</div>
                        {:else}
                            <Table 
                                {columns} 
                                data={tableData}
                                variant="v2"
                                paginated={true}
                                hasActions={auth.hasPermission('UI:UPDATE:USERS') || auth.hasPermission('UI:DELETE:USERS')}
                            >
                                {#snippet actions(row)}
                                    <div class="actions-group">
                                        {#if row.status === 'Activo'}
                                            <PermissionGuard permission="UI:UPDATE:USERS">
                                                <button class="action-icon-btn edit" title="Editar" onclick={() => openForm(row.id)}>
                                                    <Edit2 size={16} />
                                                </button>
                                            </PermissionGuard>
                                            <PermissionGuard permission="UI:DELETE:USERS">
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
    .users-page {
        width: 100%;
        min-width: 0;
        padding: 0;
    }

    .view-slider-container {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
    }

    .slide-view {
        grid-area: 1 / 1;
        width: 100%;
        min-width: 0;
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
