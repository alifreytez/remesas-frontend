<script lang="ts">
    import { page } from '$app/state';
    import { auth } from '$lib/stores/auth.svelte';
    import { USER_TYPES } from '$lib/constants/auth';
    import { Home, List, User, Plus, FileText } from 'lucide-svelte';

    let currentPath = $derived(page.url.pathname);
    let userType = $derived(auth.user?.userType || USER_TYPES.CLIENT);

    const adminNav = [
        { path: '/admin/home', label: 'Inicio', icon: Home },
        { path: '/admin/remittances', label: 'Remesas', icon: FileText },
        { path: '/users/me/profile', label: 'Perfil', icon: User }
    ];

    const clientNav = [
        { path: '/client/home', label: 'Inicio', icon: Home },
        { path: '/client/new', label: 'Nueva', icon: Plus },
        { path: '/client/history', label: 'Historial', icon: List },
        { path: '/users/me/profile', label: 'Perfil', icon: User }
    ];

    let activeNav = $derived(userType === USER_TYPES.ADMIN ? adminNav : clientNav);
</script>

<div class="bottom-nav-container">
    <div class="bottom-nav">
        {#each activeNav as item}
            <a 
                href={item.path} 
                class="nav-item {currentPath === item.path ? 'active' : ''}"
            >
                <!-- Renderiza dinámicamente el componente de Lucide -->
                <svelte:component this={item.icon} size={18} />
                
                {#if item.label}
                    <span>{item.label}</span>
                {/if}
            </a>
        {/each}
    </div>
</div>

<style>
    .bottom-nav-container {
        position: fixed;
        bottom: 10px; /* Margen vertical respecto al borde de la pantalla */
        left: var(--spacing-4); /* Igual que el padding del page-content */
        right: var(--spacing-4); /* Igual que el padding del page-content */
        z-index: 100;
        background-color: var(--bg-inverted);
        box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        border-radius: 9999px; /* Bordes redondeados porque es flotante */
    }

    .bottom-nav {
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: 8px 12px;
    }

    .nav-item {
        display: flex;
        align-items: center;
        gap: 6px;
        color: white;
        padding: 8px 12px;
        border-radius: 9999px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        text-decoration: none;
        transition: background-color 0.2s;
    }

    .nav-item :global(svg) {
        stroke: white;
    }

    .nav-item.active {
        background-color: rgba(255, 255, 255, 0.15);
    }

    @media (max-width: 480px) {
        .nav-item span {
            display: none;
        }
    }
</style>
