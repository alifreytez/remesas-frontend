<script lang="ts">
    import { ArrowRight } from 'lucide-svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import Select from '$lib/components/ui/Select.svelte';
    
    let { 
        rates, 
        selectedRateId = $bindable(), 
        sendAmount = $bindable(),
        commissionAmount,
        receivedAmount,
        totalToPay,
        nextStep 
    }: {
        rates: any[];
        selectedRateId: string;
        sendAmount: string;
        commissionAmount: string;
        receivedAmount: string;
        totalToPay: string;
        nextStep: () => void;
    } = $props();
</script>

<div class="step-content">
    <h2 class="step-title">Calculadora de Montos</h2>
    <p class="step-desc">Ingresa cuánto deseas enviar.</p>

    <div class="calc-box">
        <Select 
            label="Ruta y Tasa de Cambio" 
            options={rates.map(r => ({ value: r.id, label: r.label }))}
            bind:value={selectedRateId}
        />

        <Input 
            label="Monto a Enviar (USD)" 
            type="number"
            placeholder="0.00"
            bind:value={sendAmount}
        />

        {#if sendAmount && Number(sendAmount) > 0}
            <div class="calc-results">
                <div class="result-row">
                    <span>Tasa de cambio:</span>
                    <span>1 USD = 42.5 Bs</span>
                </div>
                <div class="result-row">
                    <span>Comisión (5%):</span>
                    <span>USD {commissionAmount}</span>
                </div>
                <div class="divider"></div>
                <div class="result-row highlight-receive">
                    <span>El destinatario recibe:</span>
                    <span class="receive-amount">Bs {receivedAmount}</span>
                </div>
                <div class="result-row total-pay">
                    <span>Total a Pagar:</span>
                    <span>USD {totalToPay}</span>
                </div>
            </div>
        {/if}
    </div>

    <div class="actions">
        <Button variant="primary" disabled={!sendAmount || Number(sendAmount) <= 0} onclick={nextStep}>
            Continuar <ArrowRight size={16} />
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

    .calc-box {
        display: flex;
        flex-direction: column;
        gap: 16px;
        max-width: 100%;
    }

    @container section (min-width: 600px) {
        .calc-box {
            max-width: 500px;
            margin: 0 auto;
        }
    }

    .calc-results {
        background-color: var(--gray-50);
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-lg);
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 8px;
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
        margin-top: 32px;
        display: flex;
        justify-content: flex-end;
    }
</style>
