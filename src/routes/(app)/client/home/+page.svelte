<script lang="ts">
    import { onMount } from 'svelte';
    import { auth } from '$lib/stores/auth.svelte';
    import Card from '$lib/components/ui/Card.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import Select from '$lib/components/ui/Select.svelte';
    import { ArrowRight, Activity, CheckCircle, Clock, XCircle, Send } from 'lucide-svelte';
    import { api } from '$lib/utils/api';
    import { goto } from '$app/navigation';
    import Section from '$lib/components/layout/Section.svelte';
    import SectionGrid from '$lib/components/layout/SectionGrid.svelte';
    import SectionTitle from '$lib/components/layout/SectionTitle.svelte';
    import TransactionCard from '$lib/components/ui/TransactionCard.svelte';

    let loadingRates = $state(false);
    let rates = $state<any[]>([]);
    
    // Calculator State
    let selectedRateId = $state('');
    let sendAmount = $state('');
    
    let selectedRate = $derived(rates.find(r => r.id === Number(selectedRateId)));
    let receivedAmount = $derived(
        sendAmount && selectedRate 
            ? (Number(sendAmount) * Number(selectedRate.rate)).toFixed(2) 
            : '0.00'
    );
    let commissionAmount = $derived(
        sendAmount ? (Number(sendAmount) * 0.05).toFixed(2) : '0.00'
    );
    let totalToPay = $derived(
        sendAmount ? (Number(sendAmount) + Number(commissionAmount)).toFixed(2) : '0.00'
    );

    // Updated Summary Data (4 Cards)
    const summary = [
        { label: 'Realizadas', value: '253', icon: Activity, color: 'var(--primary-600)' },
        { label: 'Aprobadas', value: '240', icon: CheckCircle, color: 'var(--primary-600)' },
        { label: 'Pendientes', value: '11', icon: Clock, color: 'var(--primary-600)' },
        { label: 'Rechazadas', value: '2', icon: XCircle, color: 'var(--primary-600)' }
    ];

    // Mock recent activity
    const recentActivity = [
        { id: 'RM-1029', date: 'Hoy, 07:29 am', amountPaid: '$150.00', amountReceived: 'Bs 6,375.00', status: 'Pendiente', destination: 'Venezuela' },
        { id: 'RM-1028', date: 'Ayer, 07:16 am', amountPaid: '$340.01', amountReceived: 'COP 1,360,000', status: 'Aprobada', destination: 'Colombia' },
        { id: 'RM-1027', date: '12 Jun, 3:12 pm', amountPaid: '$512.04', amountReceived: 'Bs 21,760.00', status: 'Aprobada', destination: 'Venezuela' },
        { id: 'RM-1026', date: '11 Jun, 9:20 am', amountPaid: '$612.18', amountReceived: 'PEN 2,265.00', status: 'Rechazada', destination: 'Perú' }
    ];

    onMount(async () => {
        try {
            loadingRates = true;
            const res = await api.get('/api/v1/finances/rates');
            if (res.data?.success) {
                rates = res.data.data;
                if (rates.length > 0) {
                    selectedRateId = rates[0].id.toString();
                }
            }
        } catch (error) {
            console.error('Failed to load rates', error);
        } finally {
            loadingRates = false;
        }
    });

    function getRateOptions() {
        return rates.map(r => ({
            value: r.id.toString(),
            label: `${r._InitialCountry?.name || 'Origen'} a ${r._SecondaryCountry?.name || 'Destino'}`
        }));
    }
</script>

<div class="dashboard">
    <!-- Top Row: KPIs -->
    <div class="summary-grid">
        {#each summary as item}
            <div class="kpi-card">
                <div class="kpi-header">
                    <svelte:component this={item.icon} size={18} color={item.color} />
                    <span class="kpi-label">{item.label}</span>
                </div>
                <div class="kpi-value">{item.value}</div>
            </div>
        {/each}
    </div>

    <!-- Middle Row: Calculator & Rates -->
    <SectionGrid cols="2">
        <!-- Premium White Calculator Panel -->
        <Section class="calculator-panel">
            <SectionTitle title="Calculadora de Envío">
                {#snippet action()}
                    <div class="desktop-only-btn">
                        <Button variant="primary" onclick={() => goto('/client/new')}>
                            <Send size={18} /> Nueva Remesa
                        </Button>
                    </div>
                {/snippet}
            </SectionTitle>
            
            <div class="calc-inner">
                {#if loadingRates}
                    <p class="loading-text">Cargando tasas de cambio...</p>
                {:else if rates.length === 0}
                    <p class="loading-text">No hay tasas de cambio disponibles por el momento.</p>
                {:else}
                    <div class="calc-row">
                        <div class="input-light">
                            <label>Ruta de Envío</label>
                            <select bind:value={selectedRateId} class="select-light">
                                {#each getRateOptions() as opt}
                                    <option value={opt.value}>{opt.label}</option>
                                {/each}
                            </select>
                        </div>
                        <div class="input-light">
                            <label>Monto a Enviar ({selectedRate?._InitialCountry?.currencySymbol || '$'})</label>
                            <input type="number" placeholder="0.00" bind:value={sendAmount} class="input-field-light" />
                        </div>
                    </div>

                    {#if selectedRate && sendAmount && Number(sendAmount) > 0}
                        <div class="calc-results-light">
                            <div class="result-box">
                                <span class="res-label">Tasa de cambio</span>
                                <span class="res-val">1 {selectedRate._InitialCountry?.currencySymbol} = {selectedRate.rate} {selectedRate._SecondaryCountry?.currencySymbol}</span>
                            </div>
                            <div class="result-box">
                                <span class="res-label">Comisión</span>
                                <span class="res-val">{selectedRate._InitialCountry?.currencySymbol}{commissionAmount}</span>
                            </div>
                            <div class="result-box total-box">
                                <span class="res-label">Total a Pagar</span>
                                <span class="res-val-big">{selectedRate._InitialCountry?.currencySymbol}{totalToPay}</span>
                            </div>
                            <div class="result-box receive-box">
                                <span class="res-label">Destinatario Recibe</span>
                                <span class="res-val-huge">{selectedRate._SecondaryCountry?.currencySymbol}{receivedAmount}</span>
                            </div>
                        </div>
                    {/if}
                {/if}
            </div>

            <div class="calc-action mobile-only-btn" style="margin-top: 24px;">
                <Button variant="primary" onclick={() => goto('/client/new')} class="w-full">
                    <Send size={18} /> Nueva Remesa
                </Button>
            </div>
        </Section>

        <!-- Rates Panel -->
        <Section class="rates-panel">
            <SectionTitle title="Tasas del Sistema" />
            <div class="rates-list">
                {#if loadingRates}
                    <p class="loading-text" style="padding: 12px;">Cargando tasas...</p>
                {:else if rates.length === 0}
                    <p class="loading-text" style="padding: 12px;">No hay tasas disponibles por el momento.</p>
                {:else}
                    {#each rates as rate}
                        <div class="rate-item">
                            <div class="rate-route">
                                <strong>{rate._InitialCountry?.name || 'Origen'}</strong>
                                <ArrowRight size={14} color="var(--gray-400)" />
                                <strong>{rate._SecondaryCountry?.name || 'Destino'}</strong>
                            </div>
                            <span class="rate-value">
                                1 {rate._InitialCountry?.currencySymbol || '$'} = <strong class="text-primary">{rate.rate} {rate._SecondaryCountry?.currencySymbol || 'Bs'}</strong>
                            </span>
                        </div>
                    {/each}
                {/if}
            </div>
        </Section>
    </SectionGrid>

    <!-- Bottom Row: Transactions -->
    <Section class="activity-panel full-width">
        <SectionTitle title="Transacciones Recientes">
            {#snippet action()}
                <Button variant="outline" onclick={() => goto('/client/history')}>
                    Ver historial
                </Button>
            {/snippet}
        </SectionTitle>

        <div class="tx-list">
            {#each recentActivity as tx}
                <TransactionCard {...tx} />
            {/each}
        </div>
    </Section>
</div>

<style>
    .dashboard {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 0;
        width: 100%;
    }

    .desktop-only-btn {
        display: block;
    }
    
    .mobile-only-btn {
        display: none;
    }

    /* Top KPI Cards */
    .summary-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
    }

    @media (max-width: 1200px) {
        .summary-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 768px) {
        .summary-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
        .kpi-card {
            padding: 16px;
        }
    }

    @media (max-width: 360px) {
        .summary-grid {
            grid-template-columns: 1fr;
        }
    }

    .kpi-card {
        background-color: var(--white);
        border: 1px solid var(--gray-200);
        border-radius: 12px;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        text-align: left;
        gap: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        padding: 24px;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .kpi-header {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .kpi-label {
        font-size: 14px;
        font-weight: 600;
        color: var(--gray-600);
    }

    .kpi-value {
        font-size: 32px;
        font-weight: 700;
        color: var(--gray-900);
        letter-spacing: -1px;
    }

    /* Rates Panel */
    .rates-panel {
        background-color: var(--white);
        border-radius: 24px;
        padding: 24px;
        border: 1px solid var(--gray-200);
        display: flex;
        flex-direction: column;
    }

    .rates-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
        max-height: 200px;
    }

    .rate-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 12px 16px;
        background-color: var(--gray-50);
        border-radius: 12px;
        border: 1px solid var(--gray-100);
    }

    .rate-route {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: var(--gray-600);
    }

    .rate-route strong {
        color: var(--gray-900);
    }

    .rate-value {
        font-size: 15px;
        color: var(--gray-700);
    }

    .text-primary {
        color: var(--primary-700);
        font-weight: 700;
    }

    .calc-inner {
        display: flex;
        flex-direction: column;
        gap: 24px;
        flex: 1;
    }

    .calc-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }
    
    @media (max-width: 640px) {
        .calc-row {
            grid-template-columns: 1fr;
        }
    }

    .input-light {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .input-light label {
        font-size: 13px;
        color: var(--gray-500);
        font-weight: 500;
    }

    .select-light, .input-field-light {
        background-color: var(--white);
        border: 1px solid var(--gray-200);
        border-radius: 12px;
        padding: 12px 16px;
        color: var(--gray-900);
        font-size: 16px;
        outline: none;
        transition: border-color 0.2s;
        font-family: inherit;
    }

    .select-light:focus, .input-field-light:focus {
        border-color: var(--primary-600);
    }
    
    .select-light option {
        background-color: var(--white);
        color: var(--gray-900);
    }

    .calc-results-light {
        margin-top: auto;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        background-color: var(--gray-50);
        border-radius: 16px;
        padding: 24px;
    }

    .result-box {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .total-box, .receive-box {
        grid-column: 1 / -1;
        padding-top: 16px;
        border-top: 1px solid var(--gray-200);
    }
    
    .receive-box {
        background-color: #f3e8ff;
        border: 1px solid var(--gray-200);
        border-radius: 12px;
        padding: 16px;
        border-top: none;
    }

    .res-label {
        font-size: 13px;
        color: var(--gray-500);
    }

    .res-val {
        font-size: 16px;
        font-weight: 500;
        color: var(--gray-900);
    }

    .res-val-big {
        font-size: 24px;
        font-weight: 700;
        color: var(--gray-900);
    }

    .res-val-huge {
        font-size: 32px;
        font-weight: 800;
        color: var(--primary-600); /* highlight */
    }

    .loading-text {
        color: var(--gray-500);
        text-align: center;
        padding: 48px;
    }

    .tx-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .tx-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    @media (max-width: 768px) {
        .desktop-only-btn {
            display: none;
        }

        .mobile-only-btn {
            display: block;
        }

        .tx-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(225px, 1fr));
            gap: 16px;
        }
    }
</style>
