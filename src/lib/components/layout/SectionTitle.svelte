<script lang="ts">
    import type { Snippet } from 'svelte';
    import { ArrowLeft } from 'lucide-svelte';
    
    let { title = '', subtitle = '', action, onBack }: { title: string, subtitle?: string, action?: Snippet, onBack?: () => void } = $props();
</script>

<div class="panel-header">
    <div class="title-group">
        <div class="title-row">
            {#if onBack}
                <button class="back-button" onclick={onBack} aria-label="Volver">
                    <ArrowLeft size={20} strokeWidth={2.5} />
                </button>
            {/if}
            <h3 class="panel-title {subtitle ? 'has-subtitle' : ''}">{title}</h3>
        </div>
        {#if subtitle}
            <p class="panel-subtitle {onBack ? 'with-back' : ''}">{subtitle}</p>
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
        margin-bottom: 24px;
        min-height: 40px;
        gap: 16px;
    }

    .title-group {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 40px;
    }

    .title-row {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .back-button {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--gray-100);
        border: 1px solid var(--gray-200);
        color: var(--gray-700);
        cursor: pointer;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        transition: all 0.2s;
    }

    .back-button:hover {
        background-color: var(--gray-200);
        color: var(--gray-900);
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
        min-height: 40px;
    }

    .panel-subtitle {
        color: var(--gray-500);
        font-size: 14px;
        margin: 4px 0 0 0;
    }

    .panel-subtitle.with-back {
        margin-left: 42px; /* 32px button width + 10px gap */
    }

    .panel-action {
        display: flex;
        align-items: center;
        gap: 16px;
        min-height: 40px;
    }
</style>

