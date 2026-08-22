<script lang="ts">
    import { page } from '$app/state';
    import { auth } from '$lib/stores/auth.svelte';
    import { USER_TYPES } from '$lib/constants/auth';
    import { goto } from '$app/navigation';
    import { LayoutDashboard, Users, FileText, Settings, LogOut, Send, History, Contact, Shield } from 'lucide-svelte';


    let currentPath = $derived(page.url.pathname);
    let isAdmin = $derived(auth.user?.userType === USER_TYPES.ADMIN);

    let adminMenu = $derived.by(() => {
        const menu = [
            // El inicio del admin se asume siempre visible para cualquiera que tenga rol ADMIN
            { path: '/admin/home', label: 'Dashboard', icon: LayoutDashboard }
        ];

        if (auth.hasPermission('UI:VIEW:REMITTANCES')) {
            menu.push({ path: '/admin/remittances', label: 'Remesas', icon: FileText });
        }
        
        if (auth.hasPermission('UI:VIEW:USERS')) {
            menu.push({ path: '/admin/users', label: 'Usuarios', icon: Users });
        }
        
        if (auth.hasPermission('UI:VIEW:ROLES')) {
            menu.push({ path: '/admin/roles', label: 'Roles y Permisos', icon: Shield });
        }
        
        if (auth.hasPermission('UI:VIEW:CONFIGS')) {
            menu.push({ path: '/admin/configs', label: 'Configuración', icon: Settings });
        }
        
        return menu;
    });

    const clientMenu = [
        { path: '/client/home', label: 'Inicio', icon: LayoutDashboard },
        { path: '/client/new', label: 'Nueva Remesa', icon: Send },
        { path: '/client/history', label: 'Historial', icon: History },
        { path: '/client/agenda', label: 'Contactos', icon: Contact },
    ];

    let activeMenu = $derived(isAdmin ? adminMenu : clientMenu);

    function handleLogout() {
        auth.logout();
        goto('/login');
    }
</script>

<aside class="sidebar">
    <div class="sidebar-header">
        <div class="logo">Remesas{isAdmin ? 'Admin' : ''}</div>
    </div>
    
    <nav class="sidebar-nav">
        {#each activeMenu as item}
            <a href={item.path} class="nav-link {currentPath === item.path || currentPath.startsWith(item.path + '/') ? 'active' : ''}">
                <svelte:component this={item.icon} size={20} />
                <span>{item.label}</span>
            </a>
        {/each}
    </nav>

    <div class="sidebar-footer">
        <button class="user-profile-btn" onclick={() => goto('/client/profile')}>
            <div class="user-avatar">{auth.user?.firstName?.[0] || 'U'}</div>
            <div class="user-details">
                <span class="user-name">{auth.user?.firstName || 'Usuario'}</span>
                <span class="user-id">{auth.user?.username || ''}</span>
            </div>
        </button>
        <button class="logout-btn" onclick={handleLogout}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
        </button>
    </div>
</aside>

<style>
    .sidebar {
        width: 250px;
        height: 100dvh;
        background-color: var(--white);
        border-right: 1px solid var(--gray-200);
        display: flex;
        flex-direction: column;
        position: sticky;
        top: 0;
    }

    .sidebar-header {
        height: 76px;
        padding: 0 24px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid var(--gray-200);
    }

    .logo {
        font-size: 20px;
        font-weight: 800;
        color: var(--primary-600);
        letter-spacing: -0.5px;
    }

    .sidebar-nav {
        flex: 1;
        padding: 24px 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        overflow-y: auto;
    }

    .nav-link {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        text-decoration: none;
        color: var(--gray-600);
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.2s;
    }

    .nav-link:hover {
        background-color: var(--gray-100);
        color: var(--gray-900);
    }

    .nav-link.active {
        background-color: var(--primary-600);
        color: white;
    }

    .sidebar-footer {
        padding: 16px;
        border-top: 1px solid var(--gray-200);
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .user-profile-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px;
        background: transparent;
        border: none;
        cursor: pointer;
        border-radius: 8px;
        transition: background-color 0.2s;
        text-align: left;
    }

    .user-profile-btn:hover {
        background-color: var(--gray-50);
    }

    .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: var(--primary-100);
        color: var(--primary-700);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 16px;
        flex-shrink: 0;
    }

    .user-details {
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .user-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--gray-900);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .user-id {
        font-size: 12px;
        color: var(--gray-500);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .logout-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px 16px;
        background: transparent;
        border: none;
        color: var(--gray-700);
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        border-radius: 8px;
        transition: background-color 0.2s;
        font-family: inherit;
    }

    .logout-btn:hover {
        background-color: var(--danger-50);
        color: var(--danger-600);
    }
</style>

