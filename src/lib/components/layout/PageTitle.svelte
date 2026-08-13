<script lang="ts">
    import { headerState } from '$lib/stores/header.svelte';
    import { ArrowLeft } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    
    let { title = '' } = $props();

    function handleBack() {
        if (headerState.onBack) {
            headerState.onBack();
        } else if (headerState.backUrl) {
            goto(headerState.backUrl);
        }
    }
</script>

<div class="page-title-container">
    {#if headerState.showBack}
        <button class="back-button" onclick={handleBack} aria-label="Volver">
            <ArrowLeft size={24} />
        </button>
    {/if}
    <h1 class="page-title">{title}</h1>
</div>

<style>
    .page-title-container {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .back-button {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: var(--gray-500);
        cursor: pointer;
        padding: 6px;
        margin-left: -6px; /* Para alinear visualmente con el texto si es necesario */
        border-radius: 8px;
        transition: all 0.2s;
    }

    .back-button:hover {
        background-color: var(--gray-100);
        color: var(--gray-900);
    }

    .page-title {
        font-size: 28px;
        font-weight: 800;
        color: var(--gray-900);
        margin: 0;
        letter-spacing: -0.5px;
    }
</style>
