<script lang="ts">
    import { auth } from '$lib/stores/auth.svelte';
    import Sidebar from '$lib/components/layout/Sidebar.svelte';
    import Header from '$lib/components/layout/Header.svelte';
    import BottomNav from '$lib/components/layout/BottomNav.svelte';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';

    let mounted = $state(false);

    onMount(() => {
        mounted = true;
    });
    
    let { children } = $props();

    let currentPath = $derived(page.url.pathname);
    let pageTitle = $derived(
        currentPath.includes('/home') ? 'Inicio' :
        currentPath.includes('/agenda/new') ? 'Nuevo Contacto' :
        (currentPath.includes('/agenda/') && !currentPath.endsWith('/agenda')) ? 'Editar Contacto' :
        currentPath.includes('/agenda') ? 'Contactos' :
        currentPath.includes('/history') ? 'Historial de Operaciones' :
        currentPath.includes('/client/new') ? 'Nueva Remesa' :
        'Dashboard'
    );
</script>

{#if mounted && auth.isAuthenticated}
    <div class="app-layout">
        <!-- Sidebar (Desktop) -->
        <Sidebar />

        <div class="main-content">
            <Header title={pageTitle} />
            
            <main class="page-content">
                {@render children()}
            </main>
            
            <!-- BottomNav (Mobile) -->
            <BottomNav />
        </div>
    </div>
{/if}

<style>
    .app-layout {
        display: flex;
        min-height: 100dvh;
        width: 100%;
        background-color: var(--gray-50);
    }

    .main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow-x: hidden;
    }

    .page-content {
        flex: 1;
        padding: 0 var(--spacing-6) var(--spacing-6) var(--spacing-6);
    }
    
    @media (max-width: 768px) {
        .app-layout :global(.sidebar) {
            display: none !important;
        }
        
        .page-content {
            padding: 0 var(--spacing-4) 76px var(--spacing-4); /* (60px menu area + 16px gap) */
        }
    }
    
    @media (min-width: 769px) {
        .app-layout :global(.bottom-nav) {
            display: none !important;
        }
    }
</style>
