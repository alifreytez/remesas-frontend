<script lang="ts">
    import Section from '$lib/components/layout/Section.svelte';
    import SectionTitle from '$lib/components/layout/SectionTitle.svelte';

    let { 
        sendAmount,
        commissionAmount,
        receivedAmount,
        totalToPay,
        recipientData,
        selectedRate,
        paymentMethods,
        countries,
        currentStep
    }: {
        sendAmount: string;
        commissionAmount: string;
        receivedAmount: string;
        totalToPay: string;
        recipientData: any;
        selectedRate: any;
        paymentMethods: any[];
        countries: any[];
        currentStep: number;
    } = $props();

    let methodDisplay = $derived(
        paymentMethods.find(m => m.typeCode === recipientData.method)?.name || 'Transferencia'
    );

    let countryDisplay = $derived(
        countries.find(c => c.id == recipientData.country)?.name || ''
    );

    let hasRecipientInfo = $derived(!!recipientData.firstName || !!recipientData.country);
    let hasAmountInfo = $derived(!!sendAmount && Number(sendAmount) > 0);
</script>

<Section class="summary-panel-section">
    <SectionTitle title="Resumen de Solicitud" />
    
    <div class="summary-content">
        {#if !hasRecipientInfo && !hasAmountInfo}
            <div class="empty-summary">
                <p>Complete los pasos para visualizar el resumen de su remesa.</p>
            </div>
        {/if}

        {#if hasRecipientInfo}
            <div class="summary-section">
                <h4>1. Beneficiario</h4>
                <div class="summary-details">
                    <div class="detail-row">
                        <span class="label">Nombre:</span>
                        <span class="value">{recipientData.firstName} {recipientData.lastName}</span>
                    </div>
                    {#if recipientData.country}
                        <div class="detail-row">
                            <span class="label">País:</span>
                            <span class="value">{countryDisplay}</span>
                        </div>
                    {/if}
                    {#if recipientData.method}
                        <div class="detail-row">
                            <span class="label">Método de Recepción:</span>
                            <span class="value">{methodDisplay}</span>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}

        {#if hasAmountInfo}
            {#if hasRecipientInfo}<div class="divider"></div>{/if}
            <div class="summary-section">
                <h4>2. Desglose Financiero</h4>
                <div class="financial-box">
                    <div class="fin-row">
                        <span>Monto a Enviar:</span>
                        <strong>{selectedRate?.originCurrency?.code || ''} {sendAmount}</strong>
                    </div>
                    <div class="fin-row">
                        <span>Comisión:</span>
                        <strong>{selectedRate?.originCurrency?.code || ''} {commissionAmount}</strong>
                    </div>
                    
                    <div class="fin-row total-pay">
                        <span>Total a Pagar:</span>
                        <span>{selectedRate?.originCurrency?.code || ''} {totalToPay}</span>
                    </div>
                    <div class="fin-row receive">
                        <span>Destinatario Recibe:</span>
                        <span>{selectedRate?.destinationCurrency?.symbol || ''} {receivedAmount}</span>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</Section>

<style>
    :global(.summary-panel-section) {
        height: fit-content;
    }

    .empty-summary {
        padding: var(--spacing-6) 0;
        text-align: center;
        color: var(--gray-500);
        font-size: var(--text-sm);
        border: 1px dashed var(--gray-300);
        border-radius: var(--radius-lg);
        margin-top: var(--spacing-4);
    }

    .summary-content {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
        margin-top: var(--spacing-4);
    }

    .summary-section h4 {
        margin: 0 0 var(--spacing-3) 0;
        font-size: var(--text-sm);
        color: var(--gray-900);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .summary-details {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
    }

    .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .detail-row .label {
        font-size: var(--text-xs);
        color: var(--gray-500);
    }

    .detail-row .value {
        font-size: var(--text-sm);
        color: var(--gray-900);
        font-weight: 500;
        text-align: right;
    }

    .financial-box {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
    }

    .fin-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: var(--text-sm);
        color: var(--gray-600);
    }

    .fin-row strong {
        color: var(--gray-900);
        font-weight: 600;
    }

    .divider {
        height: 1px;
        background-color: var(--gray-200);
        margin: var(--spacing-2) 0;
    }

    .total-pay {
        font-size: var(--text-base);
        font-weight: 700;
        color: var(--gray-900);
        margin-top: var(--spacing-2);
        padding-top: var(--spacing-2);
        border-top: 1px dashed var(--gray-300);
    }

    .receive {
        margin-top: var(--spacing-2);
        background-color: #f3e8ff;
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        color: var(--primary-700);
        font-size: var(--text-lg);
        font-weight: 700;
    }
</style>
