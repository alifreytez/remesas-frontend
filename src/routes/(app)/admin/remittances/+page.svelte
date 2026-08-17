<script lang="ts">
    import { setHeader } from '$lib/stores/header.svelte';
    import Section from '$lib/components/layout/Section.svelte';
    import Table from '$lib/components/ui/Table.svelte';

    import PermissionGuard from '$lib/components/auth/PermissionGuard.svelte';
    import { FileSearch } from 'lucide-svelte';
    
    $effect(() => {
        setHeader('Bandeja de Remesas', false, '', null);
        return () => {
            setHeader('', false, '', null);
        };
    });



    const tableColumns = [
        { key: 'solicitud', label: 'Solicitud', filterType: 'text' as const },
        { key: 'fecha', label: 'Fecha', filterType: 'dateRange' as const },
        { key: 'cliente', label: 'Cliente', filterType: 'text' as const },
        { key: 'origen', label: 'Origen', filterType: 'select' as const, filterOptions: [
            { label: 'Todos', value: '' },
            { label: 'Chile', value: 'Chile' },
            { label: 'Perú', value: 'Perú' }
        ] },
        { key: 'estado', label: 'Estado', format: 'badge' as const, filterType: 'select' as const, filterOptions: [
            { label: 'Todos', value: '' },
            { label: 'PENDING', value: 'PENDING' },
            { label: 'APPROVED', value: 'APPROVED' },
            { label: 'REJECTED', value: 'REJECTED' }
        ], badgeMap: {
            'PENDING': 'warning',
            'APPROVED': 'success',
            'REJECTED': 'danger'
        } as Record<string, "info" | "success" | "warning" | "danger"> }
    ];

    const mockData = [
        { solicitud: '#106', fecha: '2026-08-08', cliente: 'Ali Freytez', origen: 'Chile', estado: 'PENDING' },
        { solicitud: '#107', fecha: '2026-08-08', cliente: 'Maria Paz', origen: 'Perú', estado: 'PENDING' }
    ];

    function handleFilterChange(filters: Record<string, any>) {
        console.log('Filters changed:', filters);
        // Here you would typically fetch data from the server using these filters
    }
</script>

<div class="remittances-container">
    <PermissionGuard permission="UI:VIEW:REMITTANCES">
        <Section variant="default">
            


            <div class="table-container">
                <Table 
                    columns={tableColumns} 
                    data={mockData} 
                    hasActions={true}
                    variant="v2"
                    onfilter={handleFilterChange}
                >
                    {#snippet actions(row)}
                        <div class="actions-col">
                            <button class="icon-btn" title="Auditar Remesa">
                                <FileSearch size={18} />
                            </button>
                        </div>
                    {/snippet}
                </Table>
            </div>

        </Section>
    </PermissionGuard>
</div>

<style>
    .remittances-container {
        max-width: 1400px;
    }



    .actions-col {
        display: flex;
        gap: 8px;
        justify-content: center;
    }

    .icon-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--gray-600);
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s, background-color 0.2s;
    }

    .icon-btn:hover {
        color: var(--accent-purple, #6d28d9);
        background-color: var(--gray-100);
    }
</style>
