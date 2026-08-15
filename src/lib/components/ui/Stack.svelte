<script lang="ts">
    let {
        gap = 'var(--spacing-4)',
        children,
        class: className = ''
    } = $props();
</script>

<div class="ui-stack {className}" style="--stack-gap: {gap};">
    {@render children()}
</div>

<style>
    .ui-stack {
        display: flex;
        flex-direction: column;
        gap: var(--stack-gap);
        width: 100%;
    }
</style>
