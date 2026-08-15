<script lang="ts">
    import { setHeader } from '$lib/stores/header.svelte';
    import Section from '$lib/components/layout/Section.svelte';
    import Table from '$lib/components/ui/Table.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import Select from '$lib/components/ui/Select.svelte';
    import Grid from '$lib/components/ui/Grid.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import PermissionGuard from '$lib/components/auth/PermissionGuard.svelte';
    
    $effect(() => {
        setHeader('Bandeja de Remesas', false, '', null);
        return () => {
            setHeader('', false, '', null);
        };
    });

    let solicitud = $state('');
    let fecha = $state('');
    let cliente = $state('');
    let origen = $state('todos');
    let estado = $state('PENDING');

    const tableColumns = [
        { key: 'solicitud', label: 'Solicitud' },
        { key: 'fecha', label: 'Fecha' },
        { key: 'cliente', label: 'Cliente' },
        { key: 'origen', label: 'Origen' },
        { key: 'estado', label: 'Estado', format: 'badge' as const },
        { key: 'accion', label: 'Acción' }
    ];

    const mockData = [
        { solicitud: '#106', fecha: '08/08/2026', cliente: 'Ali Freytez', origen: 'Chile', estado: 'PENDING', accion: 'Auditar' },
        { solicitud: '#107', fecha: '08/08/2026', cliente: 'Maria Paz', origen: 'Perú', estado: 'PENDING', accion: 'Auditar' }
    ];
</script>

<div class="remittances-container">
    <PermissionGuard permission="UI:VIEW:REMITTANCES">
        <Section variant="default">
            
            <div class="filters-container">
                <Grid cols="repeat(5, 1fr) auto" gap="var(--spacing-4)">
                    <div class="filter-group">
                        <label for="solicitud">Solicitud</label>
                        <Input id="solicitud" type="text" bind:value={solicitud} />
                    </div>
                    
                    <div class="filter-group">
                        <label for="fecha">Fecha</label>
                        <Input id="fecha" type="date" bind:value={fecha} />
                    </div>

                    <div class="filter-group">
                        <label for="cliente">Cliente</label>
                        <Input id="cliente" type="text" bind:value={cliente} />
                    </div>

                    <div class="filter-group">
                        <label for="origen">Origen</label>
                        <Select 
                            id="origen" 
                            bind:value={origen}
                            options={[
                                { label: 'Todos', value: 'todos' },
                                { label: 'Chile', value: 'CL' },
                                { label: 'Perú', value: 'PE' }
                            ]}
                        />
                    </div>

                    <div class="filter-group">
                        <label for="estado">Estado</label>
                        <Select 
                            id="estado" 
                            bind:value={estado}
                            options={[
                                { label: 'Todos', value: 'todos' },
                                { label: 'PENDING', value: 'PENDING' },
                                { label: 'APPROVED', value: 'APPROVED' },
                                { label: 'REJECTED', value: 'REJECTED' }
                            ]}
                        />
                    </div>
                    
                    <div class="filter-actions">
                        <Button variant="primary">Buscar</Button>
                    </div>
                </Grid>
            </div>

            <div class="table-container">
                <table class="ui-table">
                    <thead>
                        <tr>
                            {#each tableColumns as col}
                                <th>{col.label}</th>
                            {/each}
                        </tr>
                    </thead>
                    <tbody>
                        {#each mockData as row}
                            <tr>
                                <td>{row.solicitud}</td>
                                <td>{row.fecha}</td>
                                <td>{row.cliente}</td>
                                <td>{row.origen}</td>
                                <td>
                                    <span class="badge badge-warning">{row.estado}</span>
                                </td>
                                <td>
                                    <Button variant="primary" size="sm">Auditar</Button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
            
            <div class="pagination-footer">
                Paginación: 1 2 3
            </div>

        </Section>
    </PermissionGuard>
</div>

<style>
    .remittances-container {
        max-width: 1400px;
    }

    .filters-container {
        background: var(--gray-50);
        padding: var(--spacing-4);
        border: 1px solid var(--gray-200);
        border-bottom: none;
    }

    .filter-group label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: var(--gray-700);
        margin-bottom: var(--spacing-2);
    }
    
    .filter-actions {
        display: flex;
        align-items: flex-end;
    }

    .table-container {
        border: 1px solid var(--gray-200);
        overflow-x: auto;
    }

    .ui-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }

    .ui-table th {
        background-color: var(--gray-50);
        padding: var(--spacing-4);
        font-size: 14px;
        font-weight: 600;
        color: var(--gray-700);
        border-bottom: 2px solid var(--gray-200);
    }

    .ui-table td {
        padding: var(--spacing-4);
        font-size: 14px;
        color: var(--gray-800);
        border-bottom: 1px solid var(--gray-200);
        vertical-align: middle;
    }
    
    .badge-warning {
        background-color: #FEF3C7;
        color: #D97706;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 12px;
    }

    .pagination-footer {
        text-align: right;
        padding: var(--spacing-4) 0;
        font-size: 14px;
        font-weight: 500;
        color: var(--gray-600);
    }
</style>
