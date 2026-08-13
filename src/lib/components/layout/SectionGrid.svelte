<script lang="ts">
    import type { Snippet } from 'svelte';
    
    // cols can be '1', '2', '3', '4', or custom grid template like '2fr 1fr', '1fr 2fr 1fr'
    let { children, cols = '1', gap = '24px' }: { children: Snippet, cols?: string, gap?: string } = $props();

    // Determine gridTemplateColumns style based on cols
    let gridTemplateColumns = $derived(
        cols.includes('fr') || cols.includes('px') || cols.includes('%') 
            ? cols 
            : `repeat(${cols}, 1fr)`
    );
</script>

<div class="section-grid" style="--grid-cols: {gridTemplateColumns}; --grid-gap: {gap};">
    {@render children()}
</div>

<style>
    .section-grid {
        display: grid;
        grid-template-columns: var(--grid-cols);
        gap: var(--grid-gap);
        width: 100%;
    }

    /* Standard responsive breakpoints */
    @media (max-width: 1200px) {
        .section-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
