<script lang="ts">
    let {
        text = '',
        children,
        class: className = ''
    } = $props();
</script>

<p class="ui-hint-text {className}">
    {#if text}
        {text}
    {:else}
        {@render children?.()}
    {/if}
</p>

<style>
    .ui-hint-text {
        font-size: 14px;
        color: var(--gray-500);
        font-style: italic;
        margin: 0;
        padding-top: var(--spacing-2);
        line-height: 1.5;
    }
</style>
