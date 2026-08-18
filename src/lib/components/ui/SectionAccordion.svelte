<script lang="ts">
    import { slide } from 'svelte/transition';

    let {
        title = '',
        open = $bindable(true),
        children
    } = $props();

    function toggle() {
        open = !open;
    }
</script>

<div class="accordion-wrapper">
    <button type="button" class="accordion-header" onclick={toggle}>
        <h3 class="title">{title}</h3>
        <div class="line"></div>
        <div class="icon" class:open>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m6 9 6 6 6-6"/>
            </svg>
        </div>
    </button>

    {#if open}
        <div class="accordion-content" transition:slide={{ duration: 200 }}>
            {@render children()}
        </div>
    {/if}
</div>

<style>
    .accordion-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
        width: 100%;
        min-width: 0;
    }

    .accordion-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
        width: 100%;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        outline: none;
    }

    .title {
        font-size: 16px;
        font-weight: 600;
        color: var(--gray-900);
        margin: 0;
        white-space: nowrap;
        flex-shrink: 0;
    }

    .line {
        flex: 1;
        height: 1px;
        background-color: var(--gray-300);
    }

    .icon {
        color: var(--gray-500);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
        flex-shrink: 0;
    }

    .icon.open {
        transform: rotate(180deg);
    }

    .accordion-content {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
        width: 100%;
        min-width: 0;
    }
</style>
