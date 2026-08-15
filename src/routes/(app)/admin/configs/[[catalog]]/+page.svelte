<script lang="ts">
    import { setHeader } from '$lib/stores/header.svelte';
    import PermissionGuard from '$lib/components/auth/PermissionGuard.svelte';
    import { auth } from '$lib/stores/auth.svelte';
    import { api } from '$lib/utils/api';
    import Table from '$lib/components/ui/Table.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Stack from '$lib/components/ui/Stack.svelte';
    import Select from '$lib/components/ui/Select.svelte';
    import Section from '$lib/components/layout/Section.svelte';
    import SectionTitle from '$lib/components/layout/SectionTitle.svelte';
    import { Plus, Edit2, Trash2, RotateCcw } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    
    // States
    let catalogsList = $state<{value: string, label: string}[]>([]);
    let selectedCatalog = $state<string>($page.params.catalog || '');
    let metadata = $state<Record<string, any>>({});
    let tableData = $state<any[]>([]);
    
    let loadingCatalogs = $state(true);
    let loadingMetadata = $state(false);
    let loadingData = $state(false);
    
    $effect(() => {
        setHeader('Configuración', false, '', null);
        return () => { setHeader('', false, '', null); };
    });

    // Handle catalog selection change
    function handleCatalogChange(val: string) {
        if (val) {
            goto(`/admin/configs/${val}`, { keepFocus: true });
        }
    }

    // Sync selectedCatalog with URL params
    $effect(() => {
        if ($page.params.catalog && $page.params.catalog !== selectedCatalog) {
            selectedCatalog = $page.params.catalog;
        }
    });

    // Load available catalogs on mount
    $effect(() => {
        const fetchCatalogs = async () => {
            try {
                const res = await api.get<{data: any[]}>('/catalogs');
                if (res.data) {
                    catalogsList = res.data.map(c => ({
                        value: c.name,
                        label: c.uiName || c.name
                    }));
                    if (catalogsList.length > 0 && !selectedCatalog) {
                        selectedCatalog = catalogsList[0].value;
                        goto(`/admin/configs/${selectedCatalog}`, { replaceState: true });
                    }
                }
            } catch (err) {
                console.error('Error cargando catálogos:', err);
            } finally {
                loadingCatalogs = false;
            }
        };
        fetchCatalogs();
    });

    // Load metadata and data when selectedCatalog changes
    $effect(() => {
        if (!selectedCatalog) return;
        
        const loadCatalog = async () => {
            try {
                loadingMetadata = true;
                loadingData = true;
                
                // Fetch Metadata
                const metaRes = await api.get<{ data: Record<string, any> }>(`/catalogs/${selectedCatalog}/metadata`);
                metadata = metaRes.data || {};
                
                // Fetch Data
                const dataRes = await api.get<any>(`/catalogs/${selectedCatalog}?include=true&includeDeleted=true`);
                
                let rows = [];
                if (dataRes?.data?.rows) rows = dataRes.data.rows;
                else if (dataRes?.data?.data) rows = dataRes.data.data;
                else if (dataRes?.data && Array.isArray(dataRes.data)) rows = dataRes.data;
                else if (dataRes?.rows) rows = dataRes.rows;
                else if (Array.isArray(dataRes)) rows = dataRes;
                
                tableData = rows.map((r: any) => ({
                    ...r,
                    __estado_registro: !r.deletedAt
                }));
            } catch (err) {
                console.error(err);
            } finally {
                loadingMetadata = false;
                loadingData = false;
            }
        };

        loadCatalog();
    });

    // Formatear columnas dinámicamente según la metadata
    let columns = $derived(() => {
        if (!metadata || Object.keys(metadata).length === 0) return [];
        const cols = Object.entries(metadata)
            .filter(([_, meta]: [string, any]) => meta.visible !== false)
            .sort((a: any, b: any) => (a[1].order || 99) - (b[1].order || 99))
            .map(([key, meta]: [string, any]) => {
                // Determine format
                let format: 'text' | 'badge' | 'currency' | 'date' | 'switch' | 'percent' | 'relation' | 'json' = 'text';
                if (meta.relatedCatalog) format = 'relation';
                else if (meta.type === 'boolean') format = 'switch';
                else if (meta.type === 'date') format = 'date';
                else if (meta.type === 'json' || meta.type === 'jsonb' || meta.inputType === 'json-table') format = 'json';
                else if (key.toLowerCase().includes('status') || key.toLowerCase().includes('estado')) format = 'badge';
                else if (key.toLowerCase().includes('rate')) format = 'text'; // keep simple for rates

                let label = meta.uiLabel || key;
                if (key === 'isActive') label = 'Estado Registro';

                return {
                    key,
                    label,
                    filterType: format === 'switch' ? 'select' as const : 'text' as const,
                    format,
                    associationAlias: meta.associationAlias,
                    displayField: meta.displayField,
                    width: format === 'switch' ? '140px' : undefined,
                    align: format === 'switch' ? 'center' : 'left',
                    filterOptions: format === 'switch' ? [
                        { value: '', label: 'Todos' },
                        { value: 'true', label: 'Habilitados' },
                        { value: 'false', label: 'Deshabilitados' }
                    ] : undefined
                };
            });
            
        // Agregar columna de Estado al final
        cols.push({
            key: '__estado_registro',
            label: 'Estado Registro',
            filterType: 'select',
            format: 'switch',
            width: '150px',
            align: 'center',
            filterOptions: [
                { value: '', label: 'Todos' },
                { value: 'true', label: 'Activos' },
                { value: 'false', label: 'Inactivos' }
            ]
        });

        return cols;
    });

    const handleNew = () => {
        goto(`/admin/configs/${selectedCatalog}/new`);
    };

    const handleEdit = (row: any) => {
        goto(`/admin/configs/${selectedCatalog}/${row.id}`);
    };

    const handleSwitchChange = async (row: any, key: string, checked: boolean) => {
        if (key === '__estado_registro') {
            if (checked) {
                if (!confirm('¿Estás seguro de habilitar este registro?')) {
                    tableData = [...tableData];
                    return;
                }
                try {
                    await api.patch(`/catalogs/${selectedCatalog}/${row.id}/restore`);
                    row.deletedAt = null;
                    row.__estado_registro = true;
                    tableData = [...tableData];
                } catch (e) {
                    console.error(e);
                    alert('Error al habilitar');
                    tableData = [...tableData];
                }
            } else {
                if (!confirm('¿Estás seguro de deshabilitar este registro?')) {
                    tableData = [...tableData];
                    return;
                }
                try {
                    await api.delete(`/catalogs/${selectedCatalog}/${row.id}`);
                    row.deletedAt = new Date().toISOString();
                    row.__estado_registro = false;
                    tableData = [...tableData];
                } catch (e) {
                    console.error(e);
                    alert('Error al deshabilitar');
                    tableData = [...tableData];
                }
            }
        }
    };
</script>

<PermissionGuard permission="UI:VIEW:CONFIGS">
    <div class="catalogs-page">
        <Section>
            <SectionTitle title="Gestión de Catálogos" subtitle="Selecciona un catálogo para gestionar sus registros.">
                {#snippet action()}
                    <div class="header-actions">
                        <div class="catalog-selector">
                            {#if loadingCatalogs}
                                <Select options={[]} placeholder="Cargando catálogos..." disabled />
                            {:else}
                                <Select 
                                    options={catalogsList} 
                                    value={selectedCatalog} 
                                    placeholder="Selecciona un catálogo" 
                                    onchange={handleCatalogChange}
                                />
                            {/if}
                        </div>
                        <PermissionGuard permission="UI:CREATE:CONFIGS">
                            {#if selectedCatalog}
                                <Button variant="primary" onclick={handleNew} disabled={loadingCatalogs}>
                                    <Plus size={18} />
                                    Añadir Registro
                                </Button>
                            {/if}
                        </PermissionGuard>
                    </div>
                {/snippet}
            </SectionTitle>

            <div class="table-section-content">
                {#if loadingMetadata || loadingData || loadingCatalogs}
                    <div class="loading-state">Cargando catálogo...</div>
                {:else if !selectedCatalog}
                    <div class="loading-state">No hay catálogos disponibles para tu rol.</div>
                {:else}
                    <Table 
                        columns={columns()} 
                        data={tableData}
                        variant="v2"
                        paginated={true}
                        hasActions={auth.hasPermission('UI:UPDATE:CONFIGS')}
                        onswitch={handleSwitchChange}
                    >
                        {#snippet actions(row)}
                            <div class="actions-group">
                                <PermissionGuard permission="UI:UPDATE:CONFIGS">
                                    <button class="action-btn edit" onclick={() => handleEdit(row)} title="Editar"><Edit2 size={16} /></button>
                                </PermissionGuard>
                            </div>
                        {/snippet}
                    </Table>
                {/if}
            </div>
        </Section>
    </div>
</PermissionGuard>

<style>
    .catalogs-page {
        padding: 0;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: var(--spacing-4);
    }
    
    .catalog-selector {
        width: 250px;
    }

    .table-section-content {
        margin-top: 16px;
    }

    .loading-state {
        text-align: center;
        padding: 60px 0;
        color: var(--gray-500);
        font-size: 15px;
    }

    .actions-group {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: none;
        background: transparent;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .action-btn.edit {
        color: var(--primary-600);
    }

    .action-btn.edit:hover {
        background: var(--primary-50);
    }
</style>
