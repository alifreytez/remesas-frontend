<script lang="ts">
    import { setHeader } from '$lib/stores/header.svelte';
    import Section from '$lib/components/layout/Section.svelte';
    import SectionTitle from '$lib/components/layout/SectionTitle.svelte';
    import Grid from '$lib/components/ui/Grid.svelte';
    import Stack from '$lib/components/ui/Stack.svelte';
    import Card from '$lib/components/ui/Card.svelte';
    import Table from '$lib/components/ui/Table.svelte';
    import PermissionGuard from '$lib/components/auth/PermissionGuard.svelte';
    import { onMount } from 'svelte';
    import { api } from '$lib/utils/api';
    
    $effect(() => {
        setHeader('Dashboard Operativo', false, '', null);
        return () => {
            setHeader('', false, '', null);
        };
    });

    let pendingRemittances = $state<any[]>([]);
    let loading = $state(true);

    const tableColumns = [
        { key: 'id', label: 'ID' },
        { key: 'cliente', label: 'Cliente' },
        { key: 'corredor', label: 'Corredor' },
        { key: 'monto', label: 'Monto' },
        { key: 'estado', label: 'Estado', format: 'badge' as const, width: '1%' }
    ];

    onMount(async () => {
        try {
            loading = true;
            // Fetch real pending remittances
            const response = await api.get<{data: {rows: any[]}}>('/remittances?filters[status]=PENDING');
            const rawData = response.data?.rows || (Array.isArray(response.data) ? response.data : []);
            
            pendingRemittances = rawData.map((r: any) => ({
                id: `#${r.id}`,
                cliente: r._Client?._Person ? `${r._Client._Person.firstName} ${r._Client._Person.lastName}` : 'Desconocido',
                corredor: `${r._OriginCountry?.isoAlpha3 || '???'} -> ${r._DestinationCountry?.isoAlpha3 || '???'}`,
                monto: `${r.amountSent} ${r._OriginCountry?.currencyCode || ''}`,
                estado: r.status
            }));
        } catch (error) {
            console.error('Error fetching pending remittances:', error);
            pendingRemittances = [];
        } finally {
            loading = false;
        }
    });
</script>

<div class="admin-dashboard">
    <Stack gap="var(--spacing-8)">
        
        <PermissionGuard permission="UI:VIEW:DASHBOARD_STATS">
            <Section>
                <SectionTitle title="Ingresos del Día por País de Origen (Proximamente)" />
                <Grid cols="1fr 1fr" gap="var(--spacing-6)">
                    <div class="stat-item border-left border-green">
                        <span class="stat-label">CHILE</span>
                        <span class="stat-value">$0.00</span>
                    </div>
                    <div class="stat-item border-left border-blue">
                        <span class="stat-label">PERÚ</span>
                        <span class="stat-value">$0.00</span>
                    </div>
                </Grid>
            </Section>

            <Section>
                <SectionTitle title="Tasas Vigentes (Sincronizadas con BD)" />
                <div class="inline-stats">
                    <div class="stat-group">
                        <span class="stat-label">VEN &lt;-&gt; CHI:</span>
                        <span class="stat-value-sm">1.52 USD/CLP</span>
                    </div>
                    <div class="stat-group">
                        <span class="stat-label">VEN &lt;-&gt; PER:</span>
                        <span class="stat-value-sm">3.75 USD/PEN</span>
                    </div>
                </div>
            </Section>
        </PermissionGuard>

        <Section>
            <SectionTitle title="Solicitudes Pendientes" subtitle="Remesas esperando validación operativa" />
            {#if loading}
                <div style="padding: 40px; text-align: center; color: var(--gray-500);">
                    Cargando solicitudes...
                </div>
            {:else}
                <Table columns={tableColumns} data={pendingRemittances} variant="v2" />
            {/if}
        </Section>
        
    </Stack>
</div>

<style>
    .admin-dashboard {
        
        width: 100%;
    }

    .stat-item {
        background: var(--color-white);
        padding: var(--spacing-6);
        border: 1px solid var(--neutral-200);
        border-radius: var(--radius-xl);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }

    .border-left {
        border-left-width: 4px;
    }

    .border-green { border-left-color: var(--success-500, #10b981); }
    .border-blue { border-left-color: var(--primary-500, #3b82f6); }

    .stat-label {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--neutral-500);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: var(--neutral-900);
    }

    .inline-stats {
        display: flex;
        gap: var(--spacing-8);
        background: var(--color-white);
        padding: var(--spacing-4) var(--spacing-6);
        border: 1px solid var(--neutral-200);
        border-radius: var(--radius-xl);
        flex-wrap: wrap;
    }

    .stat-group {
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
    }

    .stat-group .stat-label {
        color: var(--neutral-500);
        font-size: var(--text-sm);
    }

    .stat-value-sm {
        font-weight: 700;
        font-size: var(--text-base);
        color: var(--neutral-900);
        background: var(--neutral-100);
        padding: 4px 12px;
        border-radius: var(--radius-full);
    }
</style>
