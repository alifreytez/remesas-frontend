<script lang="ts">
    import { api } from '$lib/utils/api';
    import Section from '$lib/components/layout/Section.svelte';
    import Grid from '$lib/components/ui/Grid.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import Switch from '$lib/components/ui/Switch.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Select from '$lib/components/ui/Select.svelte';
    import JsonTableEditor from '$lib/components/ui/JsonTableEditor.svelte';
    import PermissionGuard from '$lib/components/auth/PermissionGuard.svelte';
    import { confirm, alertMsg } from '$lib/stores/confirm.svelte';
    import { untrack } from 'svelte';
    
    let { 
        catalogName, 
        recordId = null, 
        onsave, 
        oncancel 
    }: { 
        catalogName: string; 
        recordId?: string | null; 
        onsave: () => void; 
        oncancel: () => void; 
    } = $props();
    
    let metadata = $state<Record<string, any>>({});
    let loading = $state(true);
    let saving = $state(false);
    
    // El objeto que guardará el estado del registro
    let formData = $state<Record<string, any>>({});
    let currentRecordId = $state(recordId);
    
    // Opciones para campos foráneos
    let relationOptions = $state<Record<string, {value: string, label: string}[]>>({});

    $effect(() => {
        untrack(() => {
            const fetchData = async () => {
                try {
                    loading = true;
                    // Fetch Metadata
                    const metaRes = await api.get<any>(`/catalogs/${catalogName}/metadata`);
                    metadata = metaRes?.data?.data || metaRes?.data || metaRes || {};
                
                let recordData: any = {};
                
                if (recordId) {
                    // Fetch Current Record si es edición
                    const recordRes = await api.get<any>(`/catalogs/${catalogName}/${recordId}`);
                    recordData = recordRes?.data?.data || recordRes?.data || recordRes || {};
                }
                
                // Initialize form values
                const initial: Record<string, any> = {};
                Object.entries(metadata).forEach(([key, meta]: [string, any]) => {
                    if (meta.editable !== false) {
                        initial[key] = recordData[key] !== undefined ? String(recordData[key]) : (meta.type === 'boolean' ? false : '');
                    }
                });
                formData = initial;
                
                // Fetch relation options
                const fieldsWithRelations = Object.entries(metadata).filter(([_, meta]: [string, any]) => meta.relatedCatalog && meta.editable !== false);
                for (const [key, meta] of fieldsWithRelations) {
                    try {
                        const relRes = await api.get<any>(`/catalogs/${meta.relatedCatalog}?limit=100`);
                        const relData = relRes?.data?.rows || relRes?.data?.data || relRes?.data || [];
                        relationOptions[key] = relData.map((row: any) => ({
                            value: String(row.id),
                            label: String(row[meta.displayField || 'name'] || row.id)
                        }));
                    } catch (e) {
                        console.error(`Error loading relation for ${key}`, e);
                    }
                }
                
            } catch (err: any) {
                console.error(err);
                const apiMsg = err.response?.data?.message || err.message || 'No se pudo cargar el formulario o el registro';
                alertMsg(apiMsg, 'danger', 'Error');
                oncancel();
            } finally {
                loading = false;
            }
        };
        fetchData();
        });
    });

    // Obtener campos editables ordenados para el formulario
    let formFields = $derived(() => {
        if (!metadata) return [];
        return Object.entries(metadata)
            .filter(([key, meta]: [string, any]) => meta.editable !== false && key !== 'isActive')
            .sort((a: any, b: any) => (a[1].order || 99) - (b[1].order || 99))
            .map(([key, meta]: [string, any]) => ({ key, ...meta }));
    });

    const handleSubmit = async (e: Event) => {
        e.preventDefault();

        const isConfirmed = await confirm({
            title: recordId ? 'Guardar cambios' : 'Crear registro',
            message: recordId ? '¿Estás seguro de que deseas guardar los cambios realizados en este registro?' : '¿Estás seguro de que deseas guardar este nuevo registro?',
            confirmText: recordId ? 'Guardar' : 'Crear',
            cancelText: 'Cancelar',
            type: 'info'
        });

        if (!isConfirmed) return;

        try {
            saving = true;
            if (currentRecordId) {
                await api.patch(`/catalogs/${catalogName}/${currentRecordId}`, formData);
            } else {
                const res = await api.post(`/catalogs/${catalogName}`, formData);
                currentRecordId = res.data?.id || res.data?.data?.id || currentRecordId;
            }
            alertMsg('Los datos del registro han sido guardados exitosamente.', 'success', 'Registro Actualizado');
        } catch (error: any) {
            console.error(error);
            const apiMsg = error.response?.data?.message || error.message || 'Error guardando registro. Asegúrese de completar todos los campos requeridos correctamente.';
            alertMsg(apiMsg, 'danger', 'Error al Guardar');
        } finally {
            saving = false;
        }
    };
</script>

<div class="form-page">
    {#if loading}
        <div class="loading-state">Cargando formulario...</div>
    {:else}
        <div class="layout-grid">
            <div class="form-column">
                <form onsubmit={handleSubmit} class="catalog-form">
                    <Grid cols={2} gap="24px">
                            {#each formFields() as field}
                                <div class="form-group {field.inputType === 'json-table' ? 'full-width' : ''}">
                                    {#if field.type === 'boolean'}
                                        <div style="display:flex; align-items:center; gap:8px;">
                                            <span class="label">{field.uiLabel || field.key}</span>
                                            <Switch bind:checked={formData[field.key]} />
                                        </div>
                                    {:else if field.inputType === 'json-table'}
                                        <div class="json-editor-wrapper">
                                            <span class="label" style="display:block; margin-bottom:8px; font-size:14px; font-weight:500;">{field.uiLabel || field.key}</span>
                                            <JsonTableEditor bind:value={formData[field.key]} />
                                        </div>
                                    {:else if field.relatedCatalog}
                                        <Select 
                                            label={field.uiLabel || field.key}
                                            options={relationOptions[field.key] || []}
                                            bind:value={formData[field.key]}
                                            placeholder={field.placeholder || `Seleccionar ${field.uiLabel || field.key}`}
                                            required={field.isRequired}
                                        />
                                    {:else}
                                        <Input 
                                            id={field.key}
                                            label={field.uiLabel || field.key}
                                            type={field.inputType || (field.type === 'integer' || field.type === 'decimal' ? 'number' : 'text')}
                                            bind:value={formData[field.key]}
                                            required={field.isRequired}
                                            placeholder={field.placeholder || ''}
                                        />
                                    {/if}
                                </div>
                            {/each}
                        </Grid>
                        <div class="form-actions">
                            <Button type="button" variant="secondary" onclick={oncancel} disabled={saving}>
                                Cancelar
                            </Button>
                            <PermissionGuard permission={currentRecordId ? 'UI:UPDATE:CONFIGS' : 'UI:CREATE:CONFIGS'}>
                                <Button type="submit" variant="primary" disabled={saving}>
                                    {saving ? 'Guardando...' : (currentRecordId ? 'Guardar Cambios' : 'Guardar Registro')}
                                </Button>
                            </PermissionGuard>
                        </div>
                    </form>
            </div>
            
            <div class="info-column">
                <Section>
                    <div class="info-content" style="padding-top: 0;">
                        <h3 style="margin-top: 0; font-size: 16px; font-weight: 600; color: var(--gray-800);">Consejos</h3>
                        {#if recordId}
                            <p>Solo modifique los campos necesarios. Tenga cuidado al cambiar datos críticos.</p>
                        {:else}
                            <p>Complete todos los campos requeridos para continuar.</p>
                        {/if}
                        <p>Asegúrese de verificar la información antes de guardar para evitar errores en el sistema o dependencias de otras tablas.</p>
                        <p>Si tiene dudas sobre algún campo, consulte con el administrador del sistema.</p>
                    </div>
                </Section>
            </div>
        </div>
    {/if}
</div>

<style>
    .form-page {
        padding: 0;
        width: 100%;
        animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .layout-grid {
        display: flex;
        gap: 24px;
        align-items: flex-start;
        width: 100%;
    }

    .form-column {
        flex: 7; /* 70% */
        min-width: 0;
        width: 100%;
    }

    .info-column {
        flex: 3; /* 30% */
        min-width: 0;
        width: 100%;
    }

    @media (max-width: 1024px) {
        .layout-grid {
            flex-direction: column;
        }
    }

    .info-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding-top: 16px;
    }

    .info-content p {
        margin: 0;
        font-size: 14px;
        color: var(--gray-600);
        line-height: 1.5;
    }

    .loading-state {
        text-align: center;
        padding: 60px 0;
        color: var(--gray-500);
        font-size: 15px;
    }

    .catalog-form {
        margin-top: var(--spacing-4);
    }
    
    .label {
        font-size: 14px;
        font-weight: 500;
        color: var(--gray-700);
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--spacing-3);
        margin-top: var(--spacing-8);
        padding-top: var(--spacing-6);
        border-top: 1px solid var(--gray-200);
    }

    .full-width {
        grid-column: 1 / -1;
    }
</style>

