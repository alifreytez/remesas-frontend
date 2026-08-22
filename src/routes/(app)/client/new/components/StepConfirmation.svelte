<script lang="ts">
    import { ArrowRight, Info } from 'lucide-svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Stack from '$lib/components/ui/Stack.svelte';
    import SectionAccordion from '$lib/components/ui/SectionAccordion.svelte';
    
    let { 
        isSubmitting = false,
        prevStep,
        submitFn 
    }: {
        isSubmitting?: boolean;
        prevStep: () => void;
        submitFn: () => void;
    } = $props();
</script>

<div class="step-content">
    <Stack gap="var(--spacing-6)">
        <div class="header-text">
            <h2 class="step-title">Confirmación Final</h2>
            <p class="step-desc">Verifica los detalles del resumen a la derecha antes de proceder.</p>
        </div>

        <div class="confirmation-box">
            <Info size={24} color="var(--primary-600)" style="margin-bottom: 16px;" />
            <h3>Todo listo para enviar</h3>
            <p>Al confirmar esta transacción, la remesa pasará a estado de validación. Nuestro equipo procesará el pago hacia el destinatario en un plazo no mayor a 2 horas hábiles tras comprobar sus fondos.</p>
        </div>
    </Stack>

    <div class="actions">
        <Button variant="secondary" type="button" onclick={prevStep}>
            Atrás
        </Button>
        <Button variant="primary" onclick={submitFn} disabled={isSubmitting}>
            {isSubmitting ? 'Procesando...' : 'Confirmar y Enviar'} <ArrowRight size={16} />
        </Button>
    </div>
</div>

<style>
    .step-content {
        display: flex;
        flex-direction: column;
    }

    .header-text {
        margin-bottom: var(--spacing-4);
    }

    .step-title {
        font-size: 24px;
        font-weight: 700;
        color: var(--gray-900);
        margin: 0 0 4px 0;
    }

    .step-desc {
        color: var(--gray-500);
        margin: 0;
        font-size: 14px;
    }

    .confirmation-box {
        background-color: var(--primary-50);
        border: 1px dashed var(--primary-300);
        border-radius: var(--radius-lg);
        padding: var(--spacing-6);
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .confirmation-box h3 {
        margin: 0 0 var(--spacing-2) 0;
        font-size: 18px;
        color: var(--gray-900);
    }

    .confirmation-box p {
        margin: 0;
        color: var(--gray-600);
        font-size: 14px;
        line-height: 1.5;
        max-width: 400px;
    }

    .actions {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        gap: var(--spacing-4);
        margin-top: var(--spacing-8);
        width: 100%;
        border-top: 1px solid var(--gray-200);
        padding-top: var(--spacing-6);
    }
</style>

