<script lang="ts">
    import PageTitle from './PageTitle.svelte';
    let { title = 'Inicio' } = $props();
</script>

<header class="app-header">
    <PageTitle {title} />
</header>

<style>
    .app-header {
        height: 76px;
        padding: 0 24px;
        display: flex;
        align-items: center;
    }
</style>
