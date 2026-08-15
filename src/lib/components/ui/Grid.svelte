<script lang="ts">
    let {
        cols = 1,
        gap = 'var(--spacing-4)',
        children,
        class: className = ''
    } = $props();

    let gridCols = $derived(
        typeof cols === 'number' 
            ? `repeat(${cols}, 1fr)` 
            : cols
    );
</script>

<div class="ui-grid {className}" style="--grid-cols: {gridCols}; --grid-gap: {gap};">
    {@render children()}
</div>

<style>
    .ui-grid {
        display: grid;
        grid-template-columns: 1fr; /* Mobile first */
        gap: var(--grid-gap);
        width: 100%;
    }

    /* On screens larger than mobile, use the specified columns */
    @media (min-width: 600px) {
        .ui-grid {
            grid-template-columns: var(--grid-cols);
        }
    }
</style>
