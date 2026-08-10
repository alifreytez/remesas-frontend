<script lang="ts">
    import { page } from '$app/state';
    import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-svelte';

    let currentPath = $derived(page.url.pathname);

    const adminMenu = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/remittances', label: 'Remesas', icon: FileText },
        { path: '/admin/users', label: 'Usuarios', icon: Users },
        { path: '/admin/configs', label: 'Configuración', icon: Settings },
    ];
</script>

<aside class="sidebar">
    <div class="sidebar-header">
        <div class="logo">RemesasAdmin</div>
    </div>
    
    <nav class="sidebar-nav">
        {#each adminMenu as item}
            <a href={item.path} class="nav-link {currentPath === item.path ? 'active' : ''}">
                <svelte:component this={item.icon} size={20} />
                <span>{item.label}</span>
            </a>
        {/each}
    </nav>

    <div class="sidebar-footer">
        <button class="logout-btn">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
        </button>
    </div>
</aside>

<style>
    .sidebar {
        width: 250px;
        height: 100vh;
        background-color: var(--bg-primary);
        border-right: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        position: sticky;
        top: 0;
    }

    .sidebar-header {
        padding: 24px;
        border-bottom: 1px solid var(--border-color);
    }

    .logo {
        font-size: 20px;
        font-weight: 800;
        color: var(--accent-purple);
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
        color: var(--text-muted);
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.2s;
    }

    .nav-link:hover {
        background-color: var(--bg-secondary);
        color: var(--text-main);
    }

    .nav-link.active {
        background-color: var(--accent-purple);
        color: white;
    }

    .sidebar-footer {
        padding: 24px 16px;
        border-top: 1px solid var(--border-color);
    }

    .logout-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px 16px;
        background: transparent;
        border: none;
        color: var(--text-main);
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        border-radius: 8px;
        transition: background-color 0.2s;
        font-family: inherit;
    }

    .logout-btn:hover {
        background-color: #fee2e2;
        color: #b91c1c;
    }
</style>
