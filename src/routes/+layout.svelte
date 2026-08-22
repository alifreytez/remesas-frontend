<script lang="ts">
    import '../app.css';
    import { onMount } from 'svelte';
    import { PUBLIC_APP_NAME } from '$env/static/public';
    import ConfirmModal from '$lib/components/ui/ConfirmModal.svelte';

    let loaded = $state(false);
    
    // Simular carga de fuente para evitar Flash of Unstyled Text
    onMount(() => {
        // En un caso real se usa preconnect en index.html (app.html)
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        loaded = true;
    });

    let { children } = $props();
</script>

<svelte:head>
    <title>{PUBLIC_APP_NAME || 'Remesas'}</title>
</svelte:head>

{@render children()}

<ConfirmModal />

