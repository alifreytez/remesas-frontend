<script lang="ts">
    import '../app.css';
    import { onMount } from 'svelte';
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

{@render children()}
