<script lang="ts">
    import type { Snippet } from 'svelte';

    let {
        cols = 1,
        colsMd,
        colsSm,
        rows,
        gap = 'var(--spacing-4)',
        children,
        class: className = ''
    } = $props<{
        cols?: number | string;
        colsMd?: number | string;
        colsSm?: number | string;
        rows?: number | string;
        gap?: string;
        children: Snippet;
        class?: string;
    }>();

    function formatGrid(val: number | string | undefined, defaultVal?: number | string): string {
        const v = val ?? defaultVal;
        if (v === undefined) return 'none';
        return typeof v === 'number' ? `repeat(${v}, 1fr)` : v as string;
    }

    let gridColsLg = $derived(formatGrid(cols));
    let gridColsMd = $derived(formatGrid(colsMd, cols)); // Fallback a lg
    let gridColsSm = $derived(formatGrid(colsSm, colsMd ?? cols)); // Fallback a md o lg
    
    let gridRows = $derived(formatGrid(rows));
</script>

<div 
    class="ui-grid {className}" 
    style="
        --grid-cols-lg: {gridColsLg}; 
        --grid-cols-md: {gridColsMd}; 
        --grid-cols-sm: {gridColsSm}; 
        --grid-rows: {gridRows};
        --grid-gap: {gap};
    "
>
    {@render children()}
</div>

<style>
    .ui-grid {
        display: grid;
        grid-template-columns: var(--grid-cols-lg);
        grid-template-rows: var(--grid-rows);
        gap: var(--grid-gap);
        width: 100%;
    }

    @media (max-width: 900px) {
        .ui-grid {
            grid-template-columns: var(--grid-cols-md);
        }
    }

    @media (max-width: 600px) {
        .ui-grid {
            grid-template-columns: var(--grid-cols-sm);
        }
    }
</style>


