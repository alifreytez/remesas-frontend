<script lang="ts">
    import { goto } from '$app/navigation';
    import { ArrowLeft, CheckCircle, Upload, Building, Landmark, Wallet } from 'lucide-svelte';
    import Section from '$lib/components/layout/Section.svelte';
    
    import StepContact from './components/StepContact.svelte';
    import StepCalculator from './components/StepCalculator.svelte';
    import StepSummary from './components/StepSummary.svelte';
    import StepSuccess from './components/StepSuccess.svelte';

    import { setHeader } from '$lib/stores/header.svelte';

    let currentStep = $state(1);
    
    $effect(() => {
        setHeader(
            'Nueva Remesa',
            true, // showBack
            '', // backUrl not needed, using onBack
            () => {
                if (currentStep === 1) {
                    goto('/client/home');
                } else {
                    prevStep();
                }
            }
        );

        return () => {
            setHeader('', false, '', null);
        };
    });

    // Mock Data for Steps
    let contacts = [
        { 
            id: '1', name: 'Juan Pérez', country: 'Venezuela', document: 'V-12345678',
            bankDetails: [
                { id: '1', method: 'pago_movil', bank: 'Banesco', document: 'V-12345678', phone: '04121234567' },
                { id: '2', method: 'transferencia', bank: 'Mercantil', accountNumber: '01050000000000000000', accountType: 'corriente', document: 'V-12345678' }
            ]
        },
        { 
            id: '2', name: 'Maria Gomez', country: 'Colombia', document: 'V-87654321',
            bankDetails: []
        }
    ];

    // Form State
    let recipientData = $state({
        isNew: true,
        saveAsContact: false,
        firstName: '',
        lastName: '',
        document: '',
        country: '',
        method: 'pago_movil',
        bank: '',
        accountNumber: '',
        phone: '',
        bankDocument: ''
    });
    let sendAmount = $state('');
    let selectedRateId = $state('1');

    let rates = [
        { id: '1', label: 'Origen a Venezuela', rate: 42.5 }
    ];

    let receivedAmount = $derived(
        sendAmount ? (Number(sendAmount) * 42.5).toFixed(2) : '0.00'
    );
    let commissionAmount = $derived(
        sendAmount ? (Number(sendAmount) * 0.05).toFixed(2) : '0.00'
    );
    let totalToPay = $derived(
        sendAmount ? (Number(sendAmount) + Number(commissionAmount)).toFixed(2) : '0.00'
    );

    function nextStep() {
        if (currentStep < 5) currentStep++;
    }

    function prevStep() {
        if (currentStep > 1) currentStep--;
    }

    function finish() {
        goto('/client/home');
    }
</script>

<div class="remittance-flow">
    <!-- Stepper Indicator -->
    <div class="stepper">
        {#each [1, 2, 3, 4] as step}
            <div class="step-item {step <= currentStep ? 'active' : ''}">
                <div class="step-circle">
                    {#if step < currentStep}
                        <CheckCircle size={14} />
                    {:else}
                        {step}
                    {/if}
                </div>
                {#if step < 4}
                    <div class="step-line {step < currentStep ? 'active-line' : ''}"></div>
                {/if}
            </div>
        {/each}
    </div>

    <!-- Step Content -->
    <Section class="full-width">
        {#if currentStep === 1}
            <StepContact 
                {contacts} 
                bind:recipientData
                {nextStep} 
            />
        {:else if currentStep === 2}
            <StepCalculator 
                {rates} 
                bind:selectedRateId 
                bind:sendAmount 
                {commissionAmount}
                {receivedAmount}
                {totalToPay}
                {nextStep} 
            />
        {:else if currentStep === 3}
            <StepSummary 
                {sendAmount}
                {commissionAmount}
                {receivedAmount}
                {totalToPay}
                {recipientData}
                {nextStep} 
            />
        {:else if currentStep === 4}
            <StepSuccess 
                {totalToPay}
                {finish}
            />
        {/if}
    </Section>
</div>

<style>
    .remittance-flow {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding-top: 16px;
        width: 100%;
    }

    .header-section {
        display: flex;
        flex-direction: row;
        gap: 16px;
        align-items: center;
    }

    .back-button {
        display: flex;
        align-items: center;
        gap: 8px;
        background: transparent;
        border: none;
        color: var(--gray-500);
        font-weight: 500;
        cursor: pointer;
        padding: 0;
        font-size: 14px;
        transition: color 0.2s;
    }

    .back-button:hover {
        color: var(--gray-900);
    }

    .page-title {
        font-size: 24px;
        font-weight: 700;
        color: var(--gray-900);
        margin: 0;
    }

    /* Stepper */
    .stepper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 16px 0 24px;
        padding: 0 16px;
    }

    .step-item {
        display: flex;
        align-items: center;
        flex: 1;
    }

    .step-item:last-child {
        flex: 0;
    }

    .step-circle {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: var(--gray-200);
        color: var(--gray-500);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.3s;
        flex-shrink: 0;
    }

    .step-item.active .step-circle {
        background-color: var(--primary-600);
        color: white;
    }

    .step-line {
        flex: 1;
        height: 2px;
        background-color: var(--gray-200);
        margin: 0 8px;
        transition: all 0.3s;
    }

    .active-line {
        background-color: var(--primary-600);
    }
</style>
