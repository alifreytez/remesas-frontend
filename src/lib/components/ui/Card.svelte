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
        border-radius: 24px;
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        width: 100%;
    }
</style>
