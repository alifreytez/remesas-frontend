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
        { 
            id: '1', 
            label: 'Perú a Venezuela (PEN a VES)', 
            rate: 11.2,
            originCurrency: { code: 'PEN', symbol: 'S/' },
            destinationCurrency: { code: 'VES', symbol: 'Bs' }
        },
        { 
            id: '2', 
            label: 'Chile a Venezuela (CLP a VES)', 
            rate: 0.045,
            originCurrency: { code: 'CLP', symbol: '$' },
            destinationCurrency: { code: 'VES', symbol: 'Bs' }
        },
        { 
            id: '3', 
            label: 'USA a Venezuela (USD a VES)', 
            rate: 42.5,
            originCurrency: { code: 'USD', symbol: '$' },
            destinationCurrency: { code: 'VES', symbol: 'Bs' }
        }
    ];

    let selectedRate = $derived(rates.find(r => r.id === selectedRateId) || rates[0]);

    let receivedAmount = $derived(
        sendAmount ? (Number(sendAmount) * selectedRate.rate).toFixed(2) : '0.00'
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

    <!-- Main Layout -->
    <div class="new-remittance-layout">
        <!-- Step Content (Left Column) -->
        <Section class="form-section">
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
                    {selectedRate}
                    {prevStep}
                    {nextStep} 
                />
            {:else if currentStep === 3}
                <StepSummary 
                    {sendAmount}
                    {commissionAmount}
                    {receivedAmount}
                    {totalToPay}
                    {recipientData}
                    {selectedRate}
                    {prevStep}
                    {nextStep} 
                />
            {:else if currentStep === 4}
                <StepSuccess 
                    {totalToPay}
                    {finish}
                />
            {/if}
        </Section>

        <!-- Guide Panel (Right Column) -->
        <div class="guide-panel-container desktop-only">
            <Section class="guide-section">
                {#if currentStep === 1}
                    <div class="guide-content">
                        <h3>Guía: Destinatario</h3>
                        <p>Seleccione o registre a la persona que recibirá el dinero.</p>
                        <ul>
                            <li><strong>Desde Directorio:</strong> Elija un contacto y cuenta previamente guardados para mayor rapidez.</li>
                            <li><strong>Sin Registrar:</strong> Ingrese manualmente los datos de un nuevo destinatario.</li>
                        </ul>
                        <p class="guide-note">Asegúrese de que los datos bancarios coincidan exactamente con la identidad del titular de la cuenta para evitar rechazos bancarios.</p>
                    </div>
                {:else if currentStep === 2}
                    <div class="guide-content">
                        <h3>Guía: Montos y Tasas</h3>
                        <p>Calcule exactamente cuánto dinero se enviará y cuánto recibirá su destinatario.</p>
                        <ul>
                            <li><strong>Tasa de cambio:</strong> Se actualiza en tiempo real según el mercado.</li>
                            <li><strong>Comisión:</strong> Costo operativo que se aplica según la ruta y método seleccionado.</li>
                        </ul>
                    </div>
                {:else if currentStep === 3}
                    <div class="guide-content">
                        <h3>Guía: Verificación</h3>
                        <p>Revise detalladamente el resumen antes de proceder al pago.</p>
                        <p class="guide-note">Una vez confirmada la operación, pasará a validación por nuestro equipo de finanzas.</p>
                    </div>
                {:else if currentStep === 4}
                    <div class="guide-content">
                        <h3>¡Felicidades!</h3>
                        <p>Su proceso de registro ha terminado. Ahora puede consultar el estado en su historial.</p>
                    </div>
                {/if}
            </Section>
        </div>
    </div>
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

    /* New Layout Styles */
    .new-remittance-layout {
        display: grid;
        grid-template-columns: 1fr;
        gap: 24px;
        align-items: start;
    }

    @media (min-width: 1024px) {
        .new-remittance-layout {
            grid-template-columns: 1.8fr 1fr; /* roughly 65% / 35% */
        }
    }

    .guide-panel-container {
        position: sticky;
        top: 24px;
    }

    .guide-content h3 {
        margin-top: 0;
        margin-bottom: 16px;
        font-size: 18px;
        color: var(--gray-900);
        font-weight: 700;
    }

    .guide-content p {
        font-size: 14px;
        color: var(--gray-600);
        line-height: 1.5;
        margin-bottom: 12px;
    }

    .guide-content ul {
        padding-left: 20px;
        margin-bottom: 16px;
    }

    .guide-content li {
        font-size: 14px;
        color: var(--gray-600);
        margin-bottom: 8px;
        line-height: 1.5;
    }

    .guide-note {
        padding: 12px 16px;
        background-color: #eff6ff; /* light blue */
        border-radius: 8px;
        border-left: 4px solid var(--primary-600);
        font-size: 13px !important;
        color: var(--gray-800) !important;
        margin-top: 24px;
        margin-bottom: 0 !important;
    }

    @media (max-width: 1023px) {
        .desktop-only {
            display: none;
        }
    }
</style>
