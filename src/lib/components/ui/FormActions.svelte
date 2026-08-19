<script lang="ts">
    import type { Snippet } from 'svelte';
    let { children, class: className = '' }: { children: Snippet, class?: string } = $props();
</script>

<div class="ui-form-actions {className}">
    {@render children()}
</div>

<style>
    .ui-form-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--spacing-3);
        margin-top: var(--spacing-8);
        padding-top: var(--spacing-6);
        border-top: 1px solid var(--gray-200);
        width: 100%;
    }
</style>
