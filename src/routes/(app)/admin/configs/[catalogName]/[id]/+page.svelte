<script lang="ts">
    import { page } from '$app/state';
    import { setHeader } from '$lib/stores/header.svelte';
    import { api } from '$lib/utils/api';
    import { goto } from '$app/navigation';
    import Section from '$lib/components/layout/Section.svelte';
    import SectionTitle from '$lib/components/layout/SectionTitle.svelte';
    import Grid from '$lib/components/ui/Grid.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import Switch from '$lib/components/ui/Switch.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import JsonTableEditor from '$lib/components/ui/JsonTableEditor.svelte';
    
    let catalogName = $derived(page.params.catalogName);
    let recordId = $derived(page.params.id);
    
    let metadata = $state<Record<string, any>>({});
    let loading = $state(true);
    let saving = $state(false);
    
    // El objeto que guardará el estado del registro
    let formData = $state<Record<string, any>>({});

    $effect(() => {
        if (catalogName) {
            setHeader('Configuración', true, `/admin/configs/${catalogName}`, null);
        } else {
            setHeader('Configuración', true, '/admin/configs', null);
        }
        return () => { setHeader('', false, '', null); };
    });

    $effect(() => {
        const fetchData = async () => {
            try {
                // Fetch Metadata
                const metaRes = await api.get<any>(`/catalogs/${catalogName}/metadata`);
                metadata = metaRes?.data?.data || metaRes?.data || metaRes || {};
                
                // Fetch Current Record
                const recordRes = await api.get<any>(`/catalogs/${catalogName}/${recordId}`);
                const recordData = recordRes?.data?.data || recordRes?.data || recordRes || {};
                
                // Initialize form values
                const initial: Record<string, any> = {};
                Object.entries(metadata).forEach(([key, meta]: [string, any]) => {
                    if (meta.editable !== false) {
                        initial[key] = recordData[key] !== undefined ? recordData[key] : (meta.type === 'boolean' ? false : '');
                    }
                });
                formData = initial;
                
            } catch (err) {
                console.error(err);
                alert('No se pudo cargar el formulario o el registro');
                goto('/admin/configs');
            } finally {
                loading = false;
            }
        };
        fetchData();
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
        try {
            saving = true;
            await api.patch(`/catalogs/${catalogName}/${recordId}`, formData);
            goto('/admin/configs');
        } catch (error) {
            console.error(error);
            alert('Error guardando registro. Asegúrese de completar todos los campos requeridos correctamente.');
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
                <Section>
                    <SectionTitle title="Editar Registro" />
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
                            <Button type="submit" variant="primary" disabled={saving}>
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </div>
                    </form>
                </Section>
            </div>
            
            <div class="info-column">
                <Section>
                    <SectionTitle title="Consejos" />
                    <div class="info-content">
                        <p>Solo modifique los campos necesarios. Tenga cuidado al cambiar datos críticos.</p>
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
