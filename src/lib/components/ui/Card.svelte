<script lang="ts">
    import type { Snippet } from 'svelte';

    let {
        children,
        class: className = '',
        padding = '24px'
    }: {
        children?: Snippet;
        class?: string;
        padding?: string;
    } = $props();
</script>

<div class="card {className}" style="padding: {padding}">
    {@render children?.()}
</div>

<style>
    .card {
        background-color: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 16px; /* Reduced from 24px */
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        width: 100%;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        transition: box-shadow 0.2s;
    }

    .card:hover {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
</style>
