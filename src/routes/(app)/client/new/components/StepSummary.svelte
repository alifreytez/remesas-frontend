<script lang="ts">
    import { ArrowRight } from 'lucide-svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Grid from '$lib/components/ui/Grid.svelte';
    import Stack from '$lib/components/ui/Stack.svelte';
    import SectionAccordion from '$lib/components/ui/SectionAccordion.svelte';
    import { methodsConfig } from '$lib/data/methodsConfig';
    
    let { 
        sendAmount,
        commissionAmount,
        receivedAmount,
        totalToPay,
        recipientData,
        selectedRate,
        prevStep,
        nextStep 
    }: {
        sendAmount: string;
        commissionAmount: string;
        receivedAmount: string;
        totalToPay: string;
        recipientData: any;
        selectedRate: any;
        prevStep: () => void;
        nextStep: () => void;
    } = $props();

    let methodDisplay = $derived(
        methodsConfig[recipientData.method]?.name || 'Transferencia Bancaria'
    );
</script>

<div class="step-content">
    <Stack gap="var(--spacing-6)">
        <div class="header-text">
            <h2 class="step-title">Resumen de la Remesa</h2>
            <p class="step-desc">Verifica que todos los datos sean correctos antes de proceder al pago.</p>
        </div>

        <Grid cols={2}>
            <SectionAccordion title="Datos del Beneficiario" defaultOpen={true}>
                <div class="summary-details">
                    <div class="detail-row">
                        <span class="label">Nombre:</span>
                        <span class="value">{recipientData.firstName} {recipientData.lastName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Documento:</span>
                        <span class="value">{recipientData.document}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">País:</span>
                        <span class="value">{recipientData.country === '1' ? 'Venezuela' : 'Otro'}</span>
                    </div>
                </div>
            </SectionAccordion>

            <SectionAccordion title="Datos de Recepción" defaultOpen={true}>
                <div class="summary-details">
                    <div class="detail-row">
                        <span class="label">Método:</span>
                        <span class="value">{methodDisplay}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Entidad:</span>
                        <span class="value">{recipientData.bank || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Cuenta/Teléfono:</span>
                        <span class="value">{recipientData.accountNumber || recipientData.phone || 'N/A'}</span>
                    </div>
                </div>
            </SectionAccordion>
        </Grid>

        <SectionAccordion title="Desglose Financiero" defaultOpen={true}>
            <div class="financial-box">
                <div class="fin-row">
                    <span>Monto Enviado:</span>
                    <strong>{selectedRate.originCurrency.code} {sendAmount}</strong>
                </div>
                <div class="fin-row">
                    <span>Comisión Administrativa:</span>
                    <strong>{selectedRate.originCurrency.code} {commissionAmount}</strong>
                </div>
                <div class="divider"></div>
                <div class="fin-row total-pay">
                    <span>Monto Total a Pagar:</span>
                    <span>{selectedRate.originCurrency.code} {totalToPay}</span>
                </div>
                <div class="fin-row receive">
                    <span>Monto a Recibir:</span>
                    <span>{selectedRate.destinationCurrency.symbol} {receivedAmount}</span>
                </div>
            </div>
        </SectionAccordion>
    </Stack>

    <div class="actions">
        <Button variant="outline" type="button" onclick={prevStep}>
            Atrás
        </Button>
        <Button variant="primary" onclick={nextStep}>
            Confirmar y Pagar <ArrowRight size={16} />
        </Button>
    </div>
</div>

<style>
    .step-content {
        display: flex;
        flex-direction: column;
    }

    .header-text {
        margin-bottom: var(--spacing-2);
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

    .summary-details {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3);
    }

    .detail-row {
        display: flex;
        flex-direction: column;
    }

    .detail-row .label {
        font-size: 12px;
        color: var(--gray-500);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .detail-row .value {
        font-size: 15px;
        color: var(--gray-900);
        font-weight: 500;
    }

    .financial-box {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3);
    }

    .fin-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
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
        font-size: 16px;
        font-weight: 700;
        color: var(--gray-900);
    }

    .receive {
        margin-top: var(--spacing-2);
        background-color: #f3e8ff;
        padding: var(--spacing-4);
        border-radius: var(--radius-md);
        color: var(--primary-700);
        font-size: 18px;
        font-weight: 700;
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
