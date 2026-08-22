<script lang="ts">
    import { fade, scale } from 'svelte/transition';
    import { confirmStore } from '$lib/stores/confirm.svelte';
    import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-svelte';
    import Button from './Button.svelte';

    let isOpen = $derived(confirmStore.isOpen);
    let options = $derived(confirmStore.options);

    const handleConfirm = () => confirmStore.respond(true);
    const handleCancel = () => confirmStore.respond(false);

    // Permitir cerrar con Escape
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape' && isOpen) {
            handleCancel();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen && options}
    <div 
        class="modal-backdrop" 
        transition:fade={{ duration: 150 }} 
        role="dialog" 
        aria-modal="true"
        onclick={handleCancel}
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div 
            class="modal-content" 
            transition:scale={{ duration: 150, start: 0.95 }}
            onclick={(e) => e.stopPropagation()}
        >
            <div class="icon-container {options.type || 'info'}">
                {#if options.type === 'danger'}
                    <AlertTriangle size={28} />
                {:else if options.type === 'warning'}
                    <AlertCircle size={28} />
                {:else if options.type === 'success'}
                    <CheckCircle2 size={28} />
                {:else}
                    <Info size={28} />
                {/if}
            </div>
            
            <div class="text-container">
                <h3>{options.title}</h3>
                <p>{options.message}</p>
            </div>
            
            <div class="modal-actions">
                {#if !options.hideCancel}
                    <Button variant="secondary" onclick={handleCancel} fullWidth={true}>
                        {options.cancelText || 'Cancelar'}
                    </Button>
                {/if}
                <Button 
                    variant="primary" 
                    onclick={handleConfirm}
                    fullWidth={true}
                >
                    {options.confirmText || 'Confirmar'}
                </Button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(4px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        padding: 1rem;
    }

    .modal-content {
        background-color: var(--white);
        border-radius: 20px;
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 0 20px rgba(0, 0, 0, 0.05);
        width: 100%;
        max-width: 400px;
        padding: 32px 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
    }

    .icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        flex-shrink: 0;
        margin-bottom: 4px;
    }

    .icon-container.danger {
        background-color: var(--danger-50, #fef2f2);
        color: var(--danger-600, #dc2626);
    }

    .icon-container.warning {
        background-color: var(--warning-50, #fffbeb);
        color: var(--warning-600, #d97706);
    }

    .icon-container.success {
        background-color: var(--success-50, #f0fdf4);
        color: var(--success-600, #16a34a);
    }

    .icon-container.info {
        background-color: var(--primary-50, #f0f9ff);
        color: var(--primary-600, #0284c7);
    }

    .text-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        text-align: center;
        width: 100%;
    }

    .text-container h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--gray-900);
        letter-spacing: -0.02em;
    }

    .text-container p {
        margin: 0;
        font-size: 0.95rem;
        color: var(--gray-600);
        line-height: 1.5;
    }

    .modal-actions {
        display: flex;
        justify-content: center;
        width: 100%;
        gap: 12px;
        padding-top: 12px;
    }

    /* Opcional: para que los botones abarquen todo el ancho equitativamente si tienen la clase w-full */
    :global(.modal-actions > button) {
        flex: 1;
    }
</style>

