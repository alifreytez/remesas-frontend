<script lang="ts">
    import { setHeader } from '$lib/stores/header.svelte';
    import PermissionGuard from '$lib/components/auth/PermissionGuard.svelte';
    import { auth } from '$lib/stores/auth.svelte';
    import { api } from '$lib/utils/api';
    import { confirm, alertMsg } from '$lib/stores/confirm.svelte';
    import Table from '$lib/components/ui/Table.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Stack from '$lib/components/ui/Stack.svelte';
    import Select from '$lib/components/ui/Select.svelte';
    import Section from '$lib/components/layout/Section.svelte';
    import SectionTitle from '$lib/components/layout/SectionTitle.svelte';
    import { Plus, Edit2, Trash2, RotateCcw } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { configState } from '$lib/stores/config.svelte';
    import CatalogForm from '$lib/components/admin/CatalogForm.svelte';
    import { fly } from 'svelte/transition';
    
    // States
    let catalogsList = $state<{value: string, label: string}[]>([]);
    let metadata = $state<Record<string, any>>({});
    let tableData = $state<any[]>([]);
    
    let currentView = $state<'list' | 'form'>('list');
    let editingRecordId = $state<string | null>(null);
    let refreshTrigger = $state(0);
    
    let loadingCatalogs = $state(true);
    let loadingMetadata = $state(false);
    let loadingData = $state(false);
    
    $effect(() => {
        setHeader('Configuración', false, '', null);
        return () => { setHeader('', false, '', null); };
    });

    // Handle catalog selection change
    function handleCatalogChange(val: string) {
        configState.selectedCatalog = val;
    }

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
        // Trackeamos el trigger para forzar refresco post-guardado
        const t = refreshTrigger;
        
        if (!configState.selectedCatalog) {
            metadata = {};
            tableData = [];
            return;
        }
        
        const loadCatalog = async () => {
            try {
                loadingMetadata = true;
                loadingData = true;
                
                // Fetch Metadata
                const metaRes = await api.get<{ data: Record<string, any> }>(`/catalogs/${configState.selectedCatalog}/metadata`);
                metadata = metaRes.data || {};
                
                // Fetch Data
                const dataRes = await api.get<any>(`/catalogs/${configState.selectedCatalog}?include=true&includeDeleted=true`);
                
                let rows = [];
                if (dataRes?.data?.rows) rows = dataRes.data.rows;
                else if (dataRes?.data?.data) rows = dataRes.data.data;
                else if (dataRes?.data && Array.isArray(dataRes.data)) rows = dataRes.data;
                else if (dataRes?.rows) rows = dataRes.rows;
                else if (Array.isArray(dataRes)) rows = dataRes;
                
                tableData = rows.map((r: any) => ({
                    ...r,
                    __estado_registro: !(r.deletedAt || r.deleted_at) ? 'Activo' : 'Eliminado'
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
            .filter(([key, meta]: [string, any]) => meta.visible !== false && key !== 'isActive')
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
            format: 'badge',
            badgeMap: {
                'Activo': 'success',
                'Eliminado': 'danger'
            },
            width: '150px',
            align: 'center',
            filterOptions: [
                { value: '', label: 'Todos' },
                { value: 'Activo', label: 'Activos' },
                { value: 'Eliminado', label: 'Eliminados' }
            ]
        });

        return cols;
    });

    const handleNew = () => {
        editingRecordId = null;
        currentView = 'form';
    };

    const handleEdit = (row: any) => {
        editingRecordId = row.id;
        currentView = 'form';
    };

    const handleFormSave = () => {
        currentView = 'list';
        refreshTrigger++;
    };

    const handleFormCancel = () => {
        currentView = 'list';
    };

    const handleStatusChange = async (row: any, action: 'delete' | 'restore') => {
        if (action === 'restore') {
            const isConfirmed = await confirm({
                title: 'Restaurar registro',
                message: '¿Estás seguro de restaurar este registro?',
                confirmText: 'Sí, restaurar',
                cancelText: 'Cancelar',
                type: 'warning'
            });

            if (!isConfirmed) return;

            try {
                await api.patch(`/catalogs/${configState.selectedCatalog}/${row.id}/restore`);
                row.deletedAt = null;
                row.__estado_registro = 'Activo';
                tableData = [...tableData];
            } catch (e: any) {
                console.error(e);
                const apiMsg = e.response?.data?.message || e.message || 'Error al restaurar';
                alertMsg(apiMsg, 'danger', 'Error');
            }
        } else if (action === 'delete') {
            const isConfirmed = await confirm({
                title: 'Eliminar registro',
                message: '¿Estás seguro de eliminar este registro?',
                confirmText: 'Sí, eliminar',
                cancelText: 'Cancelar',
                type: 'danger'
            });

            if (!isConfirmed) return;

            try {
                await api.delete(`/catalogs/${configState.selectedCatalog}/${row.id}`);
                row.deletedAt = new Date().toISOString();
                row.__estado_registro = 'Eliminado';
                tableData = [...tableData];
            } catch (e: any) {
                console.error(e);
                const apiMsg = e.response?.data?.message || e.message || 'Error al eliminar';
                alertMsg(apiMsg, 'danger', 'Error');
            }
        }
    };
</script>

<PermissionGuard permission="UI:VIEW:CONFIGS">
    <div class="catalogs-page">
        <Section>
            <SectionTitle 
                title={currentView === 'list' ? "Gestión de Catálogos" : (editingRecordId ? "Editar Registro" : "Añadir Registro")} 
                subtitle={currentView === 'list' ? "Selecciona un catálogo para gestionar sus registros." : ""}
                onBack={currentView === 'form' ? handleFormCancel : undefined}
            >
                {#snippet action()}
                    <div class="header-actions">
                        {#if currentView === 'list'}
                            <div class="catalog-selector">
                                {#if loadingCatalogs}
                                    <Select options={[]} placeholder="Cargando catálogos..." disabled />
                                {:else}
                                    <Select 
                                        options={catalogsList} 
                                        value={configState.selectedCatalog} 
                                        placeholder="Selecciona un catálogo" 
                                        onchange={handleCatalogChange}
                                    />
                                {/if}
                            </div>
                            <PermissionGuard permission="UI:CREATE:CONFIGS">
                                {#if configState.selectedCatalog}
                                    <Button variant="primary" onclick={handleNew} disabled={loadingCatalogs}>
                                        <Plus size={18} />
                                        Añadir Registro
                                    </Button>
                                {/if}
                            </PermissionGuard>
                        {/if}
                    </div>
                {/snippet}
            </SectionTitle>

            <div class="table-section-content view-slider-container">
                {#if currentView === 'form' && configState.selectedCatalog}
                    <div class="slide-view" in:fly={{ x: 50, duration: 300 }} out:fly={{ x: 50, duration: 300 }}>
                        <CatalogForm 
                            catalogName={configState.selectedCatalog} 
                            recordId={editingRecordId} 
                            onsave={handleFormSave} 
                            oncancel={handleFormCancel} 
                        />
                    </div>
                {:else}
                    <div class="slide-view" in:fly={{ x: -50, duration: 300 }} out:fly={{ x: -50, duration: 300 }}>
                        {#if loadingCatalogs}
                    <div class="loading-state">Cargando catálogos...</div>
                {:else if !configState.selectedCatalog}
                    <div class="loading-state">Selecciona un catálogo para visualizar o gestionar sus registros.</div>
                {:else if loadingMetadata || loadingData}
                    <div class="loading-state">Cargando catálogo...</div>
                {:else}
                    <Table 
                        columns={columns()} 
                        data={tableData}
                        variant="v2"
                        paginated={true}
                        hasActions={auth.hasPermission('UI:UPDATE:CONFIGS')}
                    >
                        {#snippet actions(row)}
                            <div class="actions-group">
                                <PermissionGuard permission="UI:UPDATE:CONFIGS">
                                    <button class="action-btn edit" onclick={() => handleEdit(row)} title="Editar"><Edit2 size={16} /></button>
                                    {#if row.__estado_registro === 'Activo'}
                                        <button class="action-btn delete" onclick={() => handleStatusChange(row, 'delete')} title="Eliminar"><Trash2 size={16} /></button>
                                    {:else}
                                        <button class="action-btn restore" onclick={() => handleStatusChange(row, 'restore')} title="Restaurar"><RotateCcw size={16} /></button>
                                    {/if}
                                </PermissionGuard>
                            </div>
                        {/snippet}
                    </Table>
                {/if}
                    </div>
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
        margin-top: 0;
    }

    .view-slider-container {
        display: grid;
        overflow-x: hidden;
    }

    .slide-view {
        grid-area: 1 / 1;
        width: 100%;
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

    .action-btn.delete {
        color: var(--danger-600);
    }

    .action-btn.delete:hover {
        background: var(--danger-50);
    }

    .action-btn.restore {
        color: var(--warning-600);
    }

    .action-btn.restore:hover {
        background: var(--warning-50);
    }
</style>
