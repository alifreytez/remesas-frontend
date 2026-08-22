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
    import { setHeader } from '$lib/stores/header.svelte';

    let loadingRates = $state(false);
    let rates = $state<any[]>([]);
    
    // Calculator State
    let selectedRateId = $state('');
    let sendAmount = $state('');

    let recentRemittances = $state<any[]>([]);
    let stats = $state({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0
    });

    $effect(() => {
        setHeader('Resumen de Cuenta', false, '', null);
        return () => setHeader('', false, '', null);
    });
    
    let selectedRate = $derived(rates.find(r => r.id === Number(selectedRateId)));
    
    let quoteData = $state({
        amountReceived: '0.00',
        totalFees: '0.00',
        amountToPay: '0.00',
        exchangeRateValue: 1,
        isLoading: false
    });

    let debounceTimer: ReturnType<typeof setTimeout>;

    $effect(() => {
        if (sendAmount && selectedRate) {
            clearTimeout(debounceTimer);
            quoteData.isLoading = true;
            debounceTimer = setTimeout(async () => {
                try {
                    const res = await api.post<{ data: any }>('/remittances/quote', {
                        amount: Number(sendAmount),
                        originCurrency: selectedRate._InitialCurrency?.id || 1, 
                        destinationCurrency: selectedRate._SecondaryCurrency?.id || 2, 
                        originCountry: selectedRate.initialCountry, 
                        destinationCountry: selectedRate.secondaryCountry, 
                        paymentMethod: null
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
            }, 500); 
        } else {
            quoteData.amountReceived = '0.00';
            quoteData.totalFees = '0.00';
            quoteData.amountToPay = '0.00';
            quoteData.exchangeRateValue = 1;
        }
    });

    onMount(async () => {
        try {
            loadingRates = true;
            const res = await api.get<{data: any[]}>('/finances/rates');
            rates = res.data || [];
            if (rates.length > 0) {
                selectedRateId = rates[0].id.toString();
            }

            // Fetch user remittances for history and stats
            const remRes = await api.get<{data: {rows: any[], count: number}}>('/remittances?limit=100');
            const dataRows = remRes.data?.rows || (Array.isArray(remRes.data) ? remRes.data : []);
            
            recentRemittances = dataRows.slice(0, 4);

            stats = {
                total: remRes.data?.count || dataRows.length,
                approved: dataRows.filter(r => r.status === 'APPROVED').length,
                pending: dataRows.filter(r => r.status === 'PENDING' || r.status === 'PENDIENTE DE REVISION').length,
                rejected: dataRows.filter(r => r.status === 'REJECTED').length
            };

        } catch (error) {
            console.error('Failed to load data', error);
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

<div class="dashboard-page">
    <!-- Resumen de Actividad -->
    <Section>
        <SectionGrid cols={4} colsMd={2} colsSm={1} gap="var(--spacing-6)">
            <Card padding="var(--spacing-6)" style="display: flex; align-items: center; gap: var(--spacing-4);">
                <div class="stat-icon" style="background-color: var(--primary-50); color: var(--primary-600);">
                    <Activity size={24} />
                </div>
                <div>
                    <span class="stat-label">Realizadas</span>
                    <strong class="stat-value">{stats.total}</strong>
                </div>
            </Card>
            <Card padding="var(--spacing-6)" style="display: flex; align-items: center; gap: var(--spacing-4);">
                <div class="stat-icon" style="background-color: var(--primary-50); color: var(--primary-600);">
                    <CheckCircle size={24} />
                </div>
                <div>
                    <span class="stat-label">Aprobadas</span>
                    <strong class="stat-value">{stats.approved}</strong>
                </div>
            </Card>
            <Card padding="var(--spacing-6)" style="display: flex; align-items: center; gap: var(--spacing-4);">
                <div class="stat-icon" style="background-color: var(--primary-50); color: var(--primary-600);">
                    <Clock size={24} />
                </div>
                <div>
                    <span class="stat-label">Pendientes</span>
                    <strong class="stat-value">{stats.pending}</strong>
                </div>
            </Card>
            <Card padding="var(--spacing-6)" style="display: flex; align-items: center; gap: var(--spacing-4);">
                <div class="stat-icon" style="background-color: var(--primary-50); color: var(--primary-600);">
                    <XCircle size={24} />
                </div>
                <div>
                    <span class="stat-label">Rechazadas</span>
                    <strong class="stat-value">{stats.rejected}</strong>
                </div>
            </Card>
        </SectionGrid>
    </Section>

    <!-- Main Content Grid -->
    <div class="main-content">
        
        <!-- Left Column: Historial -->
        <div class="content-left">
            <Section>
                <SectionTitle title="Historial Reciente" subtitle="Tus últimas transacciones">
                    {#snippet action()}
                        <Button variant="ghost" onclick={() => goto('/client/history')} style="padding: 0; color: var(--primary-600);">
                            Ver todo <ArrowRight size={16} style="margin-left: 4px;" />
                        </Button>
                    {/snippet}
                </SectionTitle>

                <div class="activity-list">
                    {#if recentRemittances.length > 0}
                        {#each recentRemittances as item}
                            <TransactionCard
                                id={`#${item.id}`}
                                date={new Date(item.createdAt).toLocaleDateString()}
                                amountPaid={`${item.amountSent} ${item._OriginCountry?.currencyCode || ''}`}
                                amountReceived={`${item.amountReceived || 'N/A'} ${item._DestinationCountry?.currencyCode || ''}`}
                                status={item.status === 'PENDING' ? 'Pendiente' : item.status === 'APPROVED' ? 'Aprobada' : 'Rechazada'}
                                destination={item._DestinationCountry?.name || 'Desconocido'}
                                onClick={() => goto(`/client/history/${item.id}`)}
                            />
                        {/each}
                    {:else}
                        <div class="empty-state">
                            <Clock size={48} color="var(--gray-300)" />
                            <p>No tienes transacciones recientes.</p>
                        </div>
                    {/if}
                </div>
            </Section>
        </div>

        <!-- Right Column: Calculadora -->
        <div class="content-right">
            <Section>
                <SectionTitle title="Calculadora Rápida" subtitle="Estima tu próximo envío" />
                <Card padding="var(--spacing-6)" class="calculator-card">
                    <form class="calc-form" onsubmit={(e) => { e.preventDefault(); goto('/client/new'); }}>
                        {#if loadingRates}
                            <div style="text-align: center; padding: 20px;">Cargando tasas...</div>
                        {:else}
                            <Select 
                                label="Corredor" 
                                id="rate" 
                                bind:value={selectedRateId} 
                                options={getRateOptions()} 
                            />
                            
                            <Input 
                                label="Monto a Enviar" 
                                id="sendAmount" 
                                type="number" 
                                placeholder="Ej. 100.00" 
                                bind:value={sendAmount}
                                min="1"
                                step="0.01"
                            >
                                {#snippet rightIcon()}
                                    <span class="currency-label">{selectedRate?._InitialCurrency?.code || 'USD'}</span>
                                {/snippet}
                            </Input>

                            <div class="calc-result">
                                <div class="result-row">
                                    <span>Tasa de cambio:</span>
                                    <span>{quoteData.exchangeRateValue}</span>
                                </div>
                                <div class="result-row highlight">
                                    <span>Reciben aprox:</span>
                                    <strong>{quoteData.amountReceived} {selectedRate?._SecondaryCurrency?.code || ''}</strong>
                                </div>
                            </div>
                        {/if}

                        <Button variant="primary" type="submit" style="width: 100%; margin-top: var(--spacing-4);">
                            <Send size={16} style="margin-right: 8px;" />
                            Comenzar Envío
                        </Button>
                    </form>
                </Card>
            </Section>
        </div>

    </div>
</div>

<style>
    .dashboard-page {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-8);
        
        width: 100%;
    }

    .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .stat-label {
        display: block;
        font-size: var(--text-sm);
        color: var(--gray-500);
        margin-bottom: 2px;
    }

    .stat-value {
        display: block;
        font-size: 24px;
        font-weight: 700;
        color: var(--gray-900);
    }

    .main-content {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--spacing-8);
        align-items: start;
    }

    @media (min-width: 1024px) {
        .main-content {
            grid-template-columns: 7fr 4fr;
        }
    }

    .activity-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
    }

    :global(.calculator-card) {
        background: linear-gradient(180deg, var(--white) 0%, var(--gray-50) 100%);
        border: 1px solid var(--gray-200);
    }

    .calc-form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-5);
    }

    .currency-label {
        font-weight: 600;
        color: var(--gray-500);
        padding-right: 8px;
    }

    .calc-result {
        background-color: var(--white);
        border-radius: var(--radius-md);
        padding: var(--spacing-4);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
        border: 1px dashed var(--gray-300);
        margin-top: var(--spacing-2);
    }

    .result-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: var(--text-sm);
        color: var(--gray-600);
    }

    .result-row.highlight {
        font-size: var(--text-base);
        color: var(--gray-900);
        margin-top: 4px;
        padding-top: 8px;
        border-top: 1px solid var(--gray-100);
    }

    .result-row.highlight strong {
        color: var(--primary-600);
        font-size: var(--text-lg);
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        color: var(--gray-500);
        background: var(--white);
        border-radius: var(--radius-xl);
        border: 1px dashed var(--gray-300);
        gap: 16px;
    }
</style>
