<script lang="ts">
    let { children } = $props();
</script>

<div class="admin-module-container">
    {@render children?.()}
</div>

<style>
    .admin-module-container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
</style>
