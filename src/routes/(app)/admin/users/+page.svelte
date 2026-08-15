<script lang="ts">
    import { setHeader } from '$lib/stores/header.svelte';
    import PermissionGuard from '$lib/components/auth/PermissionGuard.svelte';
    import { auth } from '$lib/stores/auth.svelte';
    import { api } from '$lib/utils/api';
    import Table from '$lib/components/ui/Table.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Section from '$lib/components/layout/Section.svelte';
    import Stack from '$lib/components/ui/Stack.svelte';
    import { Plus, UserPlus } from 'lucide-svelte';
    
    let users = $state<any[]>([]);
    let loading = $state(true);
    let error = $state<string | null>(null);

    $effect(() => {
        setHeader('Gestión de Usuarios', false, '', null);
        return () => {
            setHeader('', false, '', null);
        };
    });

    $effect(() => {
        const fetchUsers = async () => {
            try {
                loading = true;
                const response = await api.get<{ data: { rows: any[] } }>('/users');
                users = response.data.rows || [];
            } catch (err: any) {
                error = err.message || 'Error al cargar usuarios';
            } finally {
                loading = false;
            }
        };

        if (auth.hasPermission('UI:VIEW:USERS')) {
            fetchUsers();
        }
    });

    // Configuración de la tabla
    const columns = [
        { key: 'username', label: 'Usuario', filterType: 'text' as const },
        { key: 'email', label: 'Correo', filterType: 'text' as const },
        { key: 'document_number', label: 'Cédula', filterType: 'text' as const },
        { key: 'status', label: 'Estado', format: 'badge' as const, badgeMap: { 'ACTIVE': 'success', 'INACTIVE': 'danger' } }
    ];

    // Formatear los datos para la tabla
    let tableData = $derived(users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        document_number: u._People?.document_number || 'N/A',
        status: u.deletedAt ? 'INACTIVE' : 'ACTIVE',
        roles: (u._Roles || []).map((r: any) => r.code).join(', ')
    })));
</script>

<PermissionGuard permission="UI:VIEW:USERS">
    <div class="users-page">
        <Stack gap="var(--spacing-6)">
            
            <div class="page-header">
                <div class="header-content">
                    <h2>Directorio de Usuarios</h2>
                    <p>Administra los accesos, roles y datos personales de los miembros de la plataforma.</p>
                </div>
                
                <PermissionGuard permission="UI:CREATE:USERS">
                    <Button variant="primary">
                        <UserPlus size={18} />
                        Nuevo Usuario
                    </Button>
                </PermissionGuard>
            </div>

            {#if loading}
                <div class="loading-state">Cargando usuarios...</div>
            {:else if error}
                <div class="error-state">{error}</div>
            {:else}
                <Section noPadding={true}>
                    <Table 
                        {columns} 
                        data={tableData}
                        variant="v2"
                        paginated={true}
                        hasActions={auth.hasPermission('UI:UPDATE:USERS') || auth.hasPermission('UI:DELETE:USERS')}
                    >
                        {#snippet actions(row)}
                            <div class="actions-group">
                                <PermissionGuard permission="UI:UPDATE:USERS">
                                    <button class="action-btn edit">Editar</button>
                                </PermissionGuard>
                                <PermissionGuard permission="UI:DELETE:USERS">
                                    <button class="action-btn delete">Eliminar</button>
                                </PermissionGuard>
                            </div>
                        {/snippet}
                    </Table>
                </Section>
            {/if}
            
        </Stack>
    </div>
</PermissionGuard>

<style>
    .users-page {
        padding: var(--spacing-4) 0;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--white);
        padding: 24px;
        border-radius: 12px;
        border: 1px solid var(--border-color);
    }

    .header-content h2 {
        font-size: 20px;
        font-weight: 700;
        color: var(--gray-900);
        margin: 0 0 4px 0;
    }

    .header-content p {
        color: var(--gray-500);
        margin: 0;
        font-size: 14px;
    }

    .loading-state, .error-state {
        padding: 40px;
        text-align: center;
        background: var(--white);
        border-radius: 12px;
        border: 1px solid var(--border-color);
    }

    .error-state {
        color: var(--danger);
    }

    .actions-group {
        display: flex;
        gap: 8px;
        justify-content: center;
    }

    .action-btn {
        background: none;
        border: none;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
    }

    .action-btn.edit {
        color: var(--primary-600);
    }
    
    .action-btn.edit:hover {
        background: var(--primary-50);
    }

    .action-btn.delete {
        color: var(--danger);
    }

    .action-btn.delete:hover {
        background: #fef2f2;
    }
</style>
