<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { FileText, Search, Filter } from 'lucide-svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import Select from '$lib/components/ui/Select.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Section from '$lib/components/layout/Section.svelte';
    import SectionTitle from '$lib/components/layout/SectionTitle.svelte';
    import TransactionGrid from '$lib/components/ui/TransactionGrid.svelte';
    import { setHeader } from '$lib/stores/header.svelte';
    import { api } from '$lib/utils/api';

    let loading = $state(false);
    let history = $state<any[]>([]);
    let searchQuery = $state('');
    let statusFilter = $state('');

    // Pagination (TransactionGrid already handles UI pagination, but we want server-side if it's large)
    // Currently, we'll fetch a batch and let TransactionGrid handle it or handle it here.
    // TransactionGrid expects all data and paginates internally based on the code I can guess.
    // To be safe, we'll fetch up to 100 or paginate if TransactionGrid supports it.
    
    $effect(() => {
        setHeader('Historial', false, '', null);
        return () => setHeader('', false, '', null);
    });

    async function fetchHistory() {
        try {
            loading = true;
            let query = new URLSearchParams();
            query.append('limit', '100');
            if (statusFilter) query.append('filters[status]', statusFilter);
            if (searchQuery) query.append('filters[id]', searchQuery); // Usually ID search in remittances

            const res = await api.get<{data: {rows: any[]}}>(`/remittances?${query.toString()}`);
            const dataRows = res.data?.rows || (Array.isArray(res.data) ? res.data : []);
            
            history = dataRows.map(r => ({
                id: `#${r.id}`,
                realId: r.id,
                date: new Date(r.createdAt).toLocaleDateString(),
                beneficiary: r._RecipientDetails?.contactName || 'Desconocido',
                destination: r._DestinationCountry?.name || 'Desconocido',
                amountSend: r.amountSent.toString(),
                amountReceive: r.amountReceived?.toString() || '0.00',
                currency: r._DestinationCountry?.currencyCode || '',
                status: r.status
            }));
        } catch (error) {
            console.error('Error fetching history:', error);
            history = [];
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchHistory();
    });

    let debounceTimer: ReturnType<typeof setTimeout>;
    function handleSearch() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fetchHistory();
        }, 500);
    }

    // El componente TransactionGrid espera:
    // { id, date, beneficiary, destination, amountSend, amountReceive, currency, status }
</script>

<div class="history-page">
    <Section>
        <SectionTitle title="Todas tus Transacciones" subtitle="Sigue el estado de tus envíos pasados y actuales" />
        
        <div class="filters-toolbar">
            <div class="search-box">
                <Input 
                    type="text" 
                    placeholder="Buscar por ID..." 
                    id="search" 
                    bind:value={searchQuery}
                    oninput={handleSearch}
                >
                    {#snippet leftIcon()}
                        <Search size={18} color="var(--gray-400)" />
                    {/snippet}
                </Input>
            </div>
            
            <div class="filter-box">
                <Select 
                    label="" 
                    id="status" 
                    bind:value={statusFilter}
                    onchange={handleSearch}
                    options={[
                        {value: '', label: 'Todos los estados'},
                        {value: 'PENDING', label: 'Pendiente'},
                        {value: 'APPROVED', label: 'Completada'},
                        {value: 'REJECTED', label: 'Cancelada'}
                    ]}
                />
            </div>
        </div>

        {#if loading && history.length === 0}
            <div class="loading-state">
                <p>Cargando historial...</p>
            </div>
        {:else if history.length === 0 && !searchQuery && !statusFilter}
            <div class="empty-state">
                <FileText size={48} color="var(--gray-300)" />
                <h3>Aún no tienes envíos registrados</h3>
                <p>Cuando realices envíos a tus destinatarios, aparecerán aquí.</p>
                <Button variant="primary" onclick={() => goto('/client/new')} style="margin-top: 16px;">
                    Hacer mi primer envío
                </Button>
            </div>
        {:else}
            <TransactionGrid data={history} />
        {/if}
    </Section>
</div>

<style>
    .history-page {
        display: flex;
        flex-direction: column;
        width: 100%;
        
    }

    .filters-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-4);
        margin-bottom: var(--spacing-6);
        align-items: center;
        justify-content: flex-end;
    }

    .search-box {
        width: 320px;
        max-width: 100%;
    }

    .filter-box {
        width: 200px;
    }

    .loading-state, .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 64px 24px;
        text-align: center;
        background-color: var(--white);
        border: 1px dashed var(--gray-300);
        border-radius: var(--radius-xl);
        gap: 8px;
    }

    .empty-state h3 {
        font-size: 18px;
        font-weight: 600;
        color: var(--gray-900);
        margin: 0;
    }

    .empty-state p {
        font-size: 14px;
        color: var(--gray-500);
        margin: 0;
    }
</style>
