<script lang="ts">
    import { ArrowRight } from 'lucide-svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import Select from '$lib/components/ui/Select.svelte';
    import Grid from '$lib/components/ui/Grid.svelte';
    import Stack from '$lib/components/ui/Stack.svelte';
    
    let { 
        rates, 
        selectedRateId = $bindable(), 
        sendAmount = $bindable(),
        commissionAmount,
        receivedAmount,
        totalToPay,
        selectedRate,
        prevStep,
        nextStep 
    }: {
        rates: any[];
        selectedRateId: string;
        sendAmount: string;
        commissionAmount: string;
        receivedAmount: string;
        totalToPay: string;
        selectedRate: any;
        prevStep: () => void;
        nextStep: () => void;
    } = $props();
</script>

<div class="step-content">
    <Grid cols={2}>
        <!-- Columna Izquierda: Controles -->
        <Stack gap="var(--spacing-6)">
            <Select 
                label="Ruta y Tasa de Cambio" 
                options={rates.map(r => ({ value: r.id, label: r.label }))}
                bind:value={selectedRateId}
            />

            <Input 
                label={`Monto a Enviar (${selectedRate.originCurrency.code})`}
                type="number"
                placeholder="0.00"
                bind:value={sendAmount}
            />
        </Stack>

        <!-- Columna Derecha: Resultados (Ticket) -->
        <div class="calc-results">
            <h4 class="results-title">Resumen de Conversión</h4>
            <div class="result-row">
                <span>Tasa de cambio:</span>
                <span>1 {selectedRate.originCurrency.code} = {selectedRate.rate} {selectedRate.destinationCurrency.symbol}</span>
            </div>
            <div class="result-row">
                <span>Comisión (5%):</span>
                <span>{selectedRate.originCurrency.code} {commissionAmount || '0.00'}</span>
            </div>
            <div class="divider"></div>
            <div class="result-row highlight-receive">
                <span>El destinatario recibe:</span>
                <span class="receive-amount">{selectedRate.destinationCurrency.symbol} {receivedAmount || '0.00'}</span>
            </div>
            <div class="result-row total-pay">
                <span>Total a Pagar:</span>
                <span>{selectedRate.originCurrency.code} {totalToPay || '0.00'}</span>
            </div>
        </div>
    </Grid>

    <div class="actions">
        <Button variant="outline" type="button" onclick={prevStep}>
            Atrás
        </Button>
        <Button variant="primary" disabled={!sendAmount || Number(sendAmount) <= 0} onclick={nextStep}>
            Continuar <ArrowRight size={16} />
        </Button>
    </div>
</div>

<style>
    .step-content {
        display: flex;
        flex-direction: column;
    }

    .calc-results {
        background-color: var(--gray-50);
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-lg);
        padding: var(--spacing-6);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
        height: 100%;
        justify-content: center;
    }

    .results-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--gray-900);
        margin: 0 0 var(--spacing-2) 0;
    }

    .result-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        color: var(--gray-600);
    }

    .divider {
        height: 1px;
        background-color: var(--gray-200);
        margin: 4px 0;
    }

    .total-pay {
        font-weight: 700;
        color: var(--gray-900);
        font-size: 16px;
    }

    .highlight-receive {
        background-color: #f3e8ff;
        padding: 12px;
        border-radius: 6px;
        color: var(--primary-700);
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
