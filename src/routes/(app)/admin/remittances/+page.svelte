<script lang="ts">
    import { setHeader } from '$lib/stores/header.svelte';
    import Section from '$lib/components/layout/Section.svelte';
    import SectionTitle from '$lib/components/layout/SectionTitle.svelte';
    import Table from '$lib/components/ui/Table.svelte';
    import { auth } from '$lib/stores/auth.svelte';
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { api } from '$lib/utils/api';

    import PermissionGuard from '$lib/components/auth/PermissionGuard.svelte';
    import { FileSearch } from 'lucide-svelte';
    import RemittanceDetail from '$lib/components/admin/RemittanceDetail.svelte';
    
    $effect(() => {
        setHeader('Remesas', false, '', null);
        return () => {
            setHeader('', false, '', null);
        };
    });

    let currentView = $state<'list' | 'detail'>('list');
    let selectedRemittance = $state<any>(null);

    let remittances = $state<any[]>([]);
    let loading = $state(true);

    const tableColumns = [
        { key: 'solicitud', label: 'Solicitud', filterType: 'text' as const },
        { key: 'fecha', label: 'Fecha', filterType: 'dateRange' as const },
        { key: 'cliente', label: 'Cliente', filterType: 'text' as const },
        { key: 'origen', label: 'Origen', filterType: 'text' as const },
        { key: 'estado', label: 'Estado', format: 'status' as const, width: '150px', filterType: 'select' as const, filterOptions: [
            { label: 'Todos', value: '' },
            { label: 'PENDING', value: 'PENDING' },
            { label: 'APPROVED', value: 'APPROVED' },
            { label: 'REJECTED', value: 'REJECTED' }
        ] }
    ];

    async function fetchRemittances(filters: Record<string, any> = {}) {
        try {
            loading = true;
            let query = new URLSearchParams();
            if (filters.estado) query.append('filters[status]', filters.estado);
            if (filters.solicitud) query.append('filters[id]', filters.solicitud);
            
            const response = await api.get<{data: {rows: any[]}}>(`/remittances?${query.toString()}`);
            const rawData = response.data?.rows || (Array.isArray(response.data) ? response.data : []);
            
            remittances = rawData.map((r: any) => ({
                id: r.id,
                solicitud: `#${r.id}`,
                fecha: new Date(r.createdAt).toISOString().split('T')[0],
                cliente: r._Client?._Person ? `${r._Client._Person.firstName} ${r._Client._Person.lastName}` : 'Desconocido',
                origen: r._OriginCountry?.name || 'Desconocido',
                estado: r.status
            }));
        } catch (error) {
            console.error('Error fetching remittances:', error);
            remittances = [];
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchRemittances();
    });

    function handleFilterChange(filters: Record<string, any>) {
        fetchRemittances(filters);
    }

    function openDetail(row: any) {
        selectedRemittance = row;
        currentView = 'detail';
    }

    function closeDetail() {
        currentView = 'list';
        selectedRemittance = null;
        fetchRemittances(); // Refrescar por si hubo cambios de estado
    }
</script>

<div class="view-slider-container">
    {#if currentView === 'detail' && selectedRemittance}
        <div class="slide-view" in:fly={{ x: 50, duration: 300 }} out:fly={{ x: 50, duration: 300 }}>
            <Section>
                <SectionTitle 
                    title={`Detalle de Solicitud ${selectedRemittance.solicitud}`}
                    onBack={closeDetail}
                />
                
                <!-- Aquí iría el componente real que fetch del ID. Por ahora le pasamos el ID o el objeto -->
                <RemittanceDetail remittanceId={selectedRemittance.id} onStatusChange={closeDetail} />
            </Section>
        </div>
    {:else}
        <div class="slide-view" in:fly={{ x: -50, duration: 300 }} out:fly={{ x: -50, duration: 300 }}>
            <Section>
                <SectionTitle title="Todas las Solicitudes" subtitle="Gestiona y aprueba envíos de dinero" />
                
                {#if loading}
                    <div style="padding: 40px; text-align: center; color: var(--gray-500);">
                        Cargando remesas...
                    </div>
                {:else}
                    <Table 
                        columns={tableColumns} 
                        data={remittances} 
                        variant="v2"
                        onFilterChange={handleFilterChange}
                        hasActions={true}
                    >
                        {#snippet actions(row)}
                            <PermissionGuard permission="REMITTANCES:VIEW_DETAIL">
                                <button type="button" class="action-btn" title="Ver Detalles" onclick={() => openDetail(row)}>
                                    <FileSearch size={16} />
                                </button>
                            </PermissionGuard>
                        {/snippet}
                    </Table>
                {/if}
            </Section>
        </div>
    {/if}
</div>

<style>
    .view-slider-container {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
    }
    .slide-view {
        grid-area: 1 / 1;
        width: 100%;
        min-width: 0;
    }
    
    .action-btn {
        background: transparent;
        border: none;
        color: var(--gray-500);
        cursor: pointer;
        padding: 4px;
        border-radius: var(--radius-sm);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }
    .action-btn:hover {
        color: var(--primary-600);
        background-color: var(--primary-50);
    }
</style>
