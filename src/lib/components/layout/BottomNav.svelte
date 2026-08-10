<script lang="ts">
    import { page } from '$app/state';
    import { Home, List, User } from 'lucide-svelte';

    const navItems = [
        {
            path: '/app/dashboard',
            label: 'HOME',
            icon: Home
        },
        {
            path: '/app/remittances',
            label: 'HISTORIAL',
            icon: List
        },
        {
            path: '/users/me/profile',
            label: '',
            icon: User
        }
    ];

    let currentPath = $derived(page.url.pathname);
</script>

<div class="bottom-nav-container">
    <div class="bottom-nav">
        {#each navItems as item}
            <a 
                href={item.path} 
                class="nav-item {currentPath === item.path ? 'active' : ''}"
            >
                <!-- Renderiza dinámicamente el componente de Lucide -->
                <svelte:component this={item.icon} size={20} color="white" />
                
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
        bottom: 24px;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        z-index: 100;
        pointer-events: none; /* Let clicks pass through if not on the nav itself */
    }

    .bottom-nav {
        pointer-events: auto;
        background-color: var(--bg-inverted);
        border-radius: 9999px;
        display: flex;
        padding: 8px 12px;
        gap: 8px;
        align-items: center;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }

    .nav-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: white;
        padding: 12px 16px;
        border-radius: 9999px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
        transition: background-color 0.2s;
    }

    .nav-item.active {
        background-color: rgba(255, 255, 255, 0.15);
    }
</style>
