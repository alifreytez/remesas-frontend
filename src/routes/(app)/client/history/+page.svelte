<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { FileText, Search, Filter } from 'lucide-svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import Select from '$lib/components/ui/Select.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import TransactionCard from '$lib/components/ui/TransactionCard.svelte';
    import Section from '$lib/components/layout/Section.svelte';
    import Pagination from '$lib/components/ui/Pagination.svelte';

    let loading = $state(false);
    let history = $state<any[]>([]);
    let searchQuery = $state('');
    let statusFilter = $state('ALL');

    onMount(() => {
        loading = true;
        // Mock data
        setTimeout(() => {
            const baseHistory = [
                { id: 'RM-1030', date: '11 Ago 2026', beneficiary: 'Juan Pérez', destination: 'Venezuela', amountSend: '100.00', amountReceive: '4250.00', currency: 'Bs', status: 'Pendiente Pago' },
                { id: 'RM-1029', date: '05 Ago 2026', beneficiary: 'Maria Gomez', destination: 'Colombia', amountSend: '150.00', amountReceive: '600000.00', currency: 'COP', status: 'En Proceso' },
                { id: 'RM-1028', date: '28 Jul 2026', beneficiary: 'Juan Pérez', destination: 'Venezuela', amountSend: '50.00', amountReceive: '2125.00', currency: 'Bs', status: 'Completada' },
                { id: 'RM-1027', date: '15 Jul 2026', beneficiary: 'Pedro Pascal', destination: 'Chile', amountSend: '300.00', amountReceive: '240000.00', currency: 'CLP', status: 'Completada' },
                { id: 'RM-1026', date: '01 Jul 2026', beneficiary: 'Juan Pérez', destination: 'Venezuela', amountSend: '200.00', amountReceive: '8500.00', currency: 'Bs', status: 'Cancelada' }
            ];
            
            // Generar 100 items para demostrar la paginación larga
            const generatedHistory = [];
            for (let i = 1; i <= 100; i++) {
                const base = baseHistory[i % 5];
                generatedHistory.push({
                    ...base,
                    id: `RM-${2000 + i}`,
                    date: `${(i % 28) + 1} Ago 2026`
                });
            }
            history = generatedHistory;
            loading = false;
        }, 500);
    });

    let filteredHistory = $derived(
        history.filter(h => {
            const matchSearch = h.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                h.beneficiary.toLowerCase().includes(searchQuery.toLowerCase());
            const matchFilter = statusFilter === 'ALL' || h.status === statusFilter;
            return matchSearch && matchFilter;
        })
    );

    // Lógica de paginación
    let currentPage = $state(1);
    let itemsPerPage = $state(5);

    let paginatedHistory = $derived(
        filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    );

    // Resetear a página 1 si cambia la búsqueda o filtro
    $effect(() => {
        searchQuery;
        statusFilter;
        currentPage = 1;
    });

    const statusOptions = [
        { value: 'ALL', label: 'Todos los estados' },
        { value: 'Pendiente Pago', label: 'Pendiente Pago' },
        { value: 'En Proceso', label: 'En Proceso' },
        { value: 'Completada', label: 'Completada' },
        { value: 'Cancelada', label: 'Cancelada' }
    ];

    function getStatusClass(status: string) {
        if (status === 'Completada') return 'status-success';
        if (status === 'Cancelada') return 'status-danger';
        if (status === 'En Proceso') return 'status-warning';
        return 'status-info'; // Pendiente Pago
    }
</script>

<Section class="history-panel full-width">
    <div class="filters-section">
        <div class="search-box">
            <Input 
                placeholder="Buscar por ID o beneficiario..." 
                bind:value={searchQuery}
            />
        </div>
        <div class="status-box">
            <Select 
                label="" 
                options={statusOptions}
                bind:value={statusFilter}
            />
        </div>
    </div>

    {#if loading}
        <p class="loading-text">Cargando historial...</p>
    {:else if filteredHistory.length === 0}
        <div class="empty-state">
            <FileText size={48} color="var(--gray-300)" />
            <h3>No se encontraron remesas</h3>
            <p>No tienes envíos que coincidan con los criterios de búsqueda.</p>
        </div>
    {:else}
        <div class="tx-list">
            {#each paginatedHistory as item}
                <TransactionCard 
                    id={item.id}
                    date={item.date}
                    destination={item.destination}
                    amountPaid={`USD ${item.amountSend}`}
                    amountReceived={`${item.currency} ${item.amountReceive}`}
                    status={item.status}
                />
            {/each}
        </div>

        {#if filteredHistory.length > itemsPerPage}
            <Pagination 
                bind:currentPage 
                totalItems={filteredHistory.length} 
                bind:itemsPerPage 
            />
        {/if}
    {/if}
</Section>

<style>
    .filters-section {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--gray-200);
        margin-bottom: 16px;
        
        /* Reset margins from internal components to ensure symmetrical spacing */
        --select-mb: 0;
    }
    
    .filters-section :global(.input-group) {
        margin-bottom: 0 !important;
    }

    .search-box {
        flex: 1;
        min-width: 250px;
    }

    .status-box {
        width: 200px;
    }

    .tx-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    @media (max-width: 768px) {
        .tx-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(225px, 1fr));
            gap: 16px;
        }
        
        .status-box {
            width: 100%;
        }
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 64px 24px;
        text-align: center;
        background-color: var(--gray-50);
        border-radius: 16px;
        border: 1px dashed var(--gray-300);
        gap: 12px;
    }

    .empty-state h3 {
        font-size: 18px;
        color: var(--gray-900);
        font-weight: 600;
        margin: 0;
    }

    .empty-state p {
        color: var(--gray-500);
        font-size: 14px;
        max-width: 300px;
        margin: 0;
    }

    .loading-text {
        text-align: center;
        color: var(--gray-500);
        padding: 48px;
    }
</style>
