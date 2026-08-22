<script lang="ts">
    import type { Snippet } from 'svelte';
    
    let { children, class: className = '' }: { children: Snippet, class?: string } = $props();
</script>

<div class="panel-section {className}">
    {@render children()}
</div>

<style>
    .panel-section {
        background-color: var(--white);
        border-radius: 24px;
        padding: var(--section-padding);
        border: 1px solid var(--gray-200);
        display: flex;
        flex-direction: column;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        container-type: inline-size;
        container-name: section;
        width: 100%;
        min-width: 0;
    }
</style>

