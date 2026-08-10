<script lang="ts">
    // In a real scenario, this would come from the store / API
    let { 
        userName = 'Usuario', 
        subtitle = 'Gestiona tus remesas internacionales.' 
    } = $props();
</script>

<header class="app-header">
    <h1>Hola, {userName} 👋</h1>
    <p class="subtitle">{subtitle}</p>
</header>

<style>
    .app-header {
        padding: 32px 24px 24px 24px;
    }
    
    .subtitle {
        font-size: 15px;
        color: var(--text-muted);
    }
</style>
