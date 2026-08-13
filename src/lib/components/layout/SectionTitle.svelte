<script lang="ts">
    import type { Snippet } from 'svelte';
    
    let { title = '', subtitle = '', action }: { title: string, subtitle?: string, action?: Snippet } = $props();
</script>

<div class="panel-header">
    <div class="title-group">
        <h3 class="panel-title {subtitle ? 'has-subtitle' : ''}">{title}</h3>
        {#if subtitle}
            <p class="panel-subtitle">{subtitle}</p>
        {/if}
    </div>
    {#if action}
        <div class="panel-action">
            {@render action()}
        </div>
    {/if}
</div>

<style>
    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--section-gap);
        min-height: 36px;
        gap: 16px;
    }

    .title-group {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 36px;
    }

    .panel-title {
        font-size: 20px;
        font-weight: 600;
        color: var(--gray-900);
        margin: 0;
        
        /* Limitar a máximo 2 líneas sin necesidad de span interno */
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        
        line-height: 1.2;
    }
    
    .panel-title:not(.has-subtitle) {
        align-content: center;
        min-height: 36px;
    }

    .panel-subtitle {
        color: var(--gray-500);
        font-size: 14px;
        margin: 4px 0 0 0;
    }

    .panel-action {
        display: flex;
        align-items: center;
        min-height: 36px;
    }
</style>
