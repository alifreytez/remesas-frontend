<script lang="ts">
    import { ArrowRight } from 'lucide-svelte';
    import Button from '$lib/components/ui/Button.svelte';
    
    let { 
        sendAmount,
        commissionAmount,
        receivedAmount,
        totalToPay,
        selectedMethodId,
        nextStep 
    }: {
        sendAmount: string;
        commissionAmount: string;
        receivedAmount: string;
        totalToPay: string;
        selectedMethodId: string;
        nextStep: () => void;
    } = $props();

    let methodDisplay = $derived(
        selectedMethodId === 'pago_movil' ? 'Pago Móvil' : 
        selectedMethodId === 'transferencia' ? 'Transferencia Bancaria' : 
        'Método no seleccionado'
    );
</script>

<div class="step-content">
    <h2 class="step-title">Resumen de la Remesa</h2>
    <p class="step-desc">Verifica que todos los datos sean correctos antes de proceder al pago.</p>

    <div class="summary-box">
        <div class="summary-section">
            <h4>Beneficiario</h4>
            <p><strong>Juan Pérez</strong> (V-12345678)</p>
            <p>Venezuela</p>
        </div>
        <div class="summary-section">
            <h4>Método de Recepción</h4>
            <p>{methodDisplay}</p>
        </div>
        <div class="summary-section highlight">
            <h4>Desglose Financiero</h4>
            <div class="summary-row">
                <span>Monto a Enviar:</span>
                <strong>USD {sendAmount}</strong>
            </div>
            <div class="summary-row">
                <span>Comisión:</span>
                <strong>USD {commissionAmount}</strong>
            </div>
            <div class="summary-row total">
                <span>Total a Pagar:</span>
                <strong>USD {totalToPay}</strong>
            </div>
            <div class="summary-row receive mt-2">
                <span>Monto a Recibir:</span>
                <strong>Bs {receivedAmount}</strong>
            </div>
        </div>
    </div>

    <div class="actions">
        <Button variant="primary" onclick={nextStep}>
            Confirmar y Pagar <ArrowRight size={16} />
        </Button>
    </div>
</div>

<style>
    .step-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .step-title {
        font-size: 20px;
        font-weight: 700;
        color: var(--gray-900);
        margin: 0;
    }

    .step-desc {
        color: var(--gray-500);
        margin: 0 0 24px 0;
        font-size: 14px;
    }

    .summary-box {
        border: 1px solid var(--gray-200);
        border-radius: 12px;
        overflow: hidden;
    }

    .summary-section {
        padding: 16px;
        border-bottom: 1px solid var(--gray-200);
    }

    .summary-section:last-child {
        border-bottom: none;
    }

    .summary-section h4 {
        margin: 0 0 8px 0;
        color: var(--gray-500);
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .summary-section p {
        margin: 0;
        color: var(--gray-900);
    }

    .summary-section.highlight {
        background-color: var(--gray-50);
    }

    .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
    }
    
    .total {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px dashed var(--gray-300);
        font-size: 16px;
    }

    .receive {
        color: var(--primary-700);
        font-size: 18px;
    }

    .mt-2 {
        margin-top: 8px;
    }

    .actions {
        margin-top: 32px;
        display: flex;
        justify-content: flex-end;
    }
</style>
