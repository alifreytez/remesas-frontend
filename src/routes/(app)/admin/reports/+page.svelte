<script lang="ts">
    import { setHeader } from '$lib/stores/header.svelte';
    import Section from '$lib/components/layout/Section.svelte';
    import Grid from '$lib/components/ui/Grid.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import Select from '$lib/components/ui/Select.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import PermissionGuard from '$lib/components/auth/PermissionGuard.svelte';
    
    $effect(() => {
        setHeader('Reportes Financieros', false, '', null);
        return () => {
            setHeader('', false, '', null);
        };
    });

    let tipoReporte = $state('');
    let formato = $state('excel');
    let fechaInicio = $state('');
    let fechaFin = $state('');
    
    function handleDownload() {
        if (!tipoReporte || !fechaInicio || !fechaFin) {
            alert('Por favor complete todos los campos');
            return;
        }
        alert('Generando reporte: ' + tipoReporte + ' desde ' + fechaInicio + ' hasta ' + fechaFin);
    }
</script>

<div class="reports-container">
    <PermissionGuard permission="UI:VIEW:REPORTS">
        <Section variant="outline">
            
            <div class="export-box">
                <h3 class="export-title">Exportar Reporte</h3>
                
                <Grid cols="repeat(4, 1fr)" gap="var(--spacing-6)">
                    <div class="form-group">
                        <label for="tipo_reporte">Tipo de Reporte:</label>
                        <Select 
                            id="tipo_reporte" 
                            bind:value={tipoReporte}
                            options={[
                                { label: 'Seleccione un reporte...', value: '' },
                                { label: 'Ingresos Diarios', value: 'ingresos_diarios' },
                                { label: 'Comisiones Cobradas', value: 'comisiones' },
                                { label: 'Remesas por Estado', value: 'remesas_estado' }
                            ]}
                        />
                    </div>
                    
                    <div class="form-group">
                        <label for="formato">Formato:</label>
                        <Select 
                            id="formato" 
                            bind:value={formato}
                            options={[
                                { label: 'Excel (.xlsx)', value: 'excel' },
                                { label: 'PDF (.pdf)', value: 'pdf' },
                                { label: 'CSV (.csv)', value: 'csv' }
                            ]}
                        />
                    </div>

                    <div class="form-group">
                        <label for="fecha_inicio">Fecha Inicio:</label>
                        <Input id="fecha_inicio" type="date" bind:value={fechaInicio} />
                    </div>

                    <div class="form-group">
                        <label for="fecha_fin">Fecha Fin:</label>
                        <Input id="fecha_fin" type="date" bind:value={fechaFin} />
                    </div>
                </Grid>

                <div class="actions-container">
                    <Button variant="primary" onclick={handleDownload}>
                        Descargar Reporte
                    </Button>
                </div>
            </div>

        </Section>
    </PermissionGuard>
</div>

<style>
    .reports-container {
        max-width: 1000px;
    }

    .export-box {
        border: 1px dashed var(--gray-400);
        padding: var(--spacing-6);
        border-radius: 4px;
        background-color: var(--white);
    }
    
    .export-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--gray-900);
        margin-bottom: var(--spacing-6);
    }

    .form-group label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: var(--gray-700);
        margin-bottom: var(--spacing-2);
    }

    .actions-container {
        display: flex;
        justify-content: flex-end;
        margin-top: var(--spacing-8);
    }
</style>
