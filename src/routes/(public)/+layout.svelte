<script lang="ts">
    import { onMount } from 'svelte';
    import { auth } from '$lib/stores/auth.svelte';
    import { goto } from '$app/navigation';

    let { children } = $props();
    let mounted = $state(false);

    onMount(() => {
        mounted = true;
        // Si el usuario entra a una ruta pública (ej. /login) estando ya logueado, redirigir
        if (auth.isAuthenticated) {
            goto(auth.user?.role === 'ADMIN' ? '/admin/home' : '/client/home');
        }
    });
</script>

{#if mounted && !auth.isAuthenticated}
    <div class="public-layout">
        <div class="content-wrapper">
            {@render children()}
        </div>
    </div>
{/if}

<style>
    .public-layout {
        min-height: 100dvh;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--white);
        padding: var(--spacing-4);
        box-sizing: border-box;
    }

    .content-wrapper {
        width: 100%;
        max-width: 480px; /* Ancho incrementado de 420px a 480px */
        background: transparent;
        padding: var(--spacing-8);
        animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 400px) {
        .public-layout {
            padding: var(--spacing-2);
        }
        .content-wrapper {
            padding: var(--spacing-4);
        }
    }
</style>
