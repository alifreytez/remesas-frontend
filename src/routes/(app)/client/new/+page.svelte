<script lang="ts">
    import { goto } from '$app/navigation';
    import { ArrowLeft, CheckCircle, Upload, Building, Landmark, Wallet } from 'lucide-svelte';
    import Section from '$lib/components/layout/Section.svelte';
    import SectionTitle from '$lib/components/layout/SectionTitle.svelte';
    
    import StepContact from './components/StepContact.svelte';
    import StepCalculator from './components/StepCalculator.svelte';
    import StepSummary from './components/StepSummary.svelte';
    import StepSuccess from './components/StepSuccess.svelte';

    import { setHeader } from '$lib/stores/header.svelte';

    import { api } from '$lib/utils/api';
    import { onMount } from 'svelte';

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

    let contacts = $state<any[]>([]);
    let paymentMethods = $state<any[]>([]);
    let platformAccounts = $state<any[]>([]);
    let clientData = $state<any>(null);
    let countries = $state<any[]>([]);
    let isLoading = $state(true);

    onMount(async () => {
        try {
            const res = await api.get<{ data: any }>('/remittances/options');
            contacts = res.data.contacts || [];
            paymentMethods = res.data.paymentMethods || [];
            platformAccounts = res.data.platformAccounts || [];
            clientData = res.data.client || null;
            countries = res.data.countries || [];
            if (platformAccounts.length > 0) {
                selectedPlatformAccountId = platformAccounts[0].id.toString();
            }
        } catch (error) {
            console.error('Error fetching remittance options:', error);
        } finally {
            isLoading = false;
        }
    });

    // Form State
    let recipientData = $state({
        isNew: true,
        saveAsContact: false,
        firstName: '',
        lastName: '',
        document: '',
        country: '',
        method: '',
        bank: '',
        accountNumber: '',
        phone: '',
        bankDocument: ''
    });

    let selectedPlatformAccountId = $state('');
    let sendAmount = $state('');

    let selectedPlatformAccount = $derived(
        platformAccounts.find(acc => acc.id == selectedPlatformAccountId) || platformAccounts[0]
    );

    let originCurrency = $derived(selectedPlatformAccount?.currency || { code: '', symbol: '' });

    // Deducir moneda destino según el método seleccionado en el Paso 1
    let destinationMethod = $derived(
        paymentMethods.find(m => m.type_code === recipientData.method)
    );
    let destinationCurrency = $derived(
        destinationMethod?.is_global ? { code: 'USD', symbol: '$', id: 1 } : { code: 'VES', symbol: 'Bs', id: 2 } // Mock IDs si no vienen
    );

    // Quote Data del Backend
    let quoteData = $state({
        amountReceived: '0.00',
        totalFees: '0.00',
        amountToPay: '0.00',
        exchangeRateValue: 1,
        isLoading: false
    });

    let debounceTimer: any;
    
    $effect(() => {
        // Trigger fetchQuote when sendAmount or selectedPlatformAccountId changes
        if (sendAmount && selectedPlatformAccountId && destinationCurrency) {
            clearTimeout(debounceTimer);
            quoteData.isLoading = true;
            debounceTimer = setTimeout(async () => {
                try {
                    const res = await api.post<{ data: any }>('/remittances/quote', {
                        amount: Number(sendAmount),
                        originCurrency: selectedPlatformAccount?.currency?.id || 1, // Fallback safe
                        destinationCurrency: destinationCurrency.id || 2, // Fallback safe
                        originCountry: clientData?.originCountry || 2, // Usando data real del cliente (ideal pasarlo desde res.data.client.originCountry)
                        destinationCountry: 1, // Ej Venezuela
                        paymentMethod: destinationMethod?.id
                    });
                    
                    const q = res.data;
                    quoteData.amountReceived = Number(q.amountReceived).toFixed(2);
                    quoteData.totalFees = Number(q.totalFees).toFixed(2);
                    quoteData.amountToPay = Number(q.amountToPay).toFixed(2);
                    quoteData.exchangeRateValue = q.exchangeRateValue;
                } catch (error) {
                    console.error('Error fetching quote:', error);
                } finally {
                    quoteData.isLoading = false;
                }
            }, 500); // 500ms debounce
        } else {
            quoteData.amountReceived = '0.00';
            quoteData.totalFees = '0.00';
            quoteData.amountToPay = '0.00';
            quoteData.exchangeRateValue = 1;
        }
    });

    let selectedRate = $derived({
        originCurrency,
        destinationCurrency,
        rate: quoteData.exchangeRateValue
    });

    let isSubmitting = $state(false);

    async function submitRemittance() {
        if (isSubmitting) return;
        isSubmitting = true;
        try {
            // Preparar el recipientAccountDetails en base al fields_config
            let details: Record<string, string> = { method: recipientData.method };
            const methodDef = paymentMethods.find(m => m.type_code === recipientData.method);
            if (methodDef) {
                methodDef.fields_config.forEach((f: any) => {
                    details[f.name] = recipientData[f.name];
                });
            }

            await api.post('/remittances', {
                destinationCountry: Number(recipientData.country),
                platformBankAccount: Number(selectedPlatformAccountId),
                amountSent: Number(sendAmount),
                recipientAccountDetails: details,
                // Si tienes un save_contact para el backend:
                saveContact: recipientData.saveAsContact,
                contactName: `${recipientData.firstName} ${recipientData.lastName}`
            });
            nextStep();
        } catch (error) {
            console.error('Error al crear la remesa:', error);
            // ideal mostrar un toast de error aquí
        } finally {
            isSubmitting = false;
        }
    }

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
                    {paymentMethods}
                    {countries}
                    bind:recipientData
                    {nextStep} 
                />
            {:else if currentStep === 2}
                <StepCalculator 
                    {platformAccounts} 
                    {paymentMethods}
                    bind:selectedPlatformAccountId 
                    bind:sendAmount 
                    commissionAmount={quoteData.totalFees}
                    receivedAmount={quoteData.amountReceived}
                    totalToPay={quoteData.amountToPay}
                    isLoading={quoteData.isLoading}
                    {selectedRate}
                    {prevStep}
                    {nextStep} 
                />
            {:else if currentStep === 3}
                <StepSummary 
                    {sendAmount}
                    commissionAmount={quoteData.totalFees}
                    receivedAmount={quoteData.amountReceived}
                    totalToPay={quoteData.amountToPay}
                    {recipientData}
                    {selectedRate}
                    {paymentMethods}
                    {countries}
                    {isSubmitting}
                    {prevStep}
                    submitFn={submitRemittance} 
                />
            {:else if currentStep === 4}
                <StepSuccess 
                    {totalToPay}
                    {finish}
                />
            {/if}
        </Section>

        <div class="guide-panel-container desktop-only">
            <Section class="guide-section">
                {#if currentStep === 1}
                    <SectionTitle title="Guía: Destinatario" />
                    <div class="guide-content">
                        <p>Seleccione o registre a la persona que recibirá el dinero.</p>
                        <ul>
                            <li><strong>Desde Directorio:</strong> Elija un contacto y cuenta previamente guardados para mayor rapidez.</li>
                            <li><strong>Sin Registrar:</strong> Ingrese manualmente los datos de un nuevo destinatario.</li>
                        </ul>
                        <p class="guide-note">Asegúrese de que los datos bancarios coincidan exactamente con la identidad del titular de la cuenta para evitar rechazos bancarios.</p>
                    </div>
                {:else if currentStep === 2}
                    <SectionTitle title="Guía: Montos y Tasas" />
                    <div class="guide-content">
                        <p>Calcule exactamente cuánto dinero se enviará y cuánto recibirá su destinatario.</p>
                        <ul>
                            <li><strong>Tasa de cambio:</strong> Se actualiza en tiempo real según el mercado.</li>
                            <li><strong>Comisión:</strong> Costo operativo que se aplica según la ruta y método seleccionado.</li>
                        </ul>
                    </div>
                {:else if currentStep === 3}
                    <SectionTitle title="Guía: Verificación" />
                    <div class="guide-content">
                        <p>Revise detalladamente el resumen antes de proceder al pago.</p>
                        <p class="guide-note">Una vez confirmada la operación, pasará a validación por nuestro equipo de finanzas.</p>
                    </div>
                {:else if currentStep === 4}
                    <SectionTitle title="¡Felicidades!" />
                    <div class="guide-content">
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
        gap: var(--spacing-6);
        width: 100%;
    }

    /* Stepper */
    .stepper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: var(--spacing-4) 0 var(--spacing-6);
        padding: 0 var(--spacing-4);
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
        width: var(--spacing-8);
        height: var(--spacing-8);
        border-radius: 50%;
        background-color: var(--gray-200);
        color: var(--gray-500);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: var(--text-sm);
        transition: all var(--transition-fast);
        flex-shrink: 0;
    }

    .step-item.active .step-circle {
        background-color: var(--primary-600);
        color: var(--white);
    }

    .step-line {
        flex: 1;
        height: 2px;
        background-color: var(--gray-200);
        margin: 0 var(--spacing-2);
        transition: all var(--transition-fast);
    }

    .active-line {
        background-color: var(--primary-600);
    }

    /* New Layout Styles */
    .new-remittance-layout {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--spacing-6);
        align-items: start;
    }

    @media (min-width: 1024px) {
        .new-remittance-layout {
            grid-template-columns: 1.8fr 1fr; /* roughly 65% / 35% */
        }
    }

    .guide-panel-container {
        position: sticky;
        top: var(--spacing-6);
    }

    .guide-content p {
        font-size: var(--text-sm);
        color: var(--gray-600);
        line-height: 1.5;
        margin-bottom: var(--spacing-3);
    }

    .guide-content ul {
        padding-left: var(--spacing-6);
        margin-bottom: var(--spacing-4);
    }

    .guide-content li {
        font-size: var(--text-sm);
        color: var(--gray-600);
        margin-bottom: var(--spacing-2);
        line-height: 1.5;
    }

    .guide-note {
        padding: var(--spacing-3) var(--spacing-4);
        background-color: var(--gray-50);
        border-radius: var(--radius-lg);
        border-left: 4px solid var(--primary-600);
        font-size: var(--text-xs);
        color: var(--gray-800);
        margin-top: var(--spacing-6);
        margin-bottom: 0;
    }

    @media (max-width: 1023px) {
        .desktop-only {
            display: none;
        }
    }
</style>

