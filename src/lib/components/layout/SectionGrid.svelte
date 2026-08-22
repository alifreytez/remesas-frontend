<script lang="ts">
    import type { Snippet } from 'svelte';
    
    // cols can be '1', '2', '3', '4', or custom grid template like '2fr 1fr', '1fr 2fr 1fr'
    let { 
        children, 
        cols = '1', 
        colsMd = null,
        colsSm = null,
        gap = '24px' 
    }: { 
        children: Snippet, 
        cols?: string | number, 
        colsMd?: string | number | null,
        colsSm?: string | number | null,
        gap?: string 
    } = $props();

    function parseCols(c: string | number | null | undefined): string {
        if (!c) return '1fr';
        const str = String(c);
        if (str.includes('fr') || str.includes('px') || str.includes('%')) {
            return str;
        }
        return `repeat(${str}, 1fr)`;
    }

    // Determine gridTemplateColumns style based on cols
    let gridTemplateColumns = $derived(parseCols(cols));
    let gridTemplateColumnsMd = $derived(colsMd ? parseCols(colsMd) : '1fr');
    let gridTemplateColumnsSm = $derived(colsSm ? parseCols(colsSm) : '1fr');

</script>

<div 
    class="section-grid" 
    style="--grid-cols: {gridTemplateColumns}; --grid-cols-md: {gridTemplateColumnsMd}; --grid-cols-sm: {gridTemplateColumnsSm}; --grid-gap: {gap};"
>
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
            grid-template-columns: var(--grid-cols-md, 1fr);
        }
    }
    
    @media (max-width: 768px) {
        .section-grid {
            grid-template-columns: var(--grid-cols-sm, 1fr);
        }
    }
</style>
