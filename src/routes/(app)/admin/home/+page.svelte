<script lang="ts">
    import { setHeader } from '$lib/stores/header.svelte';
    import Section from '$lib/components/layout/Section.svelte';
    import Grid from '$lib/components/ui/Grid.svelte';
    import Stack from '$lib/components/ui/Stack.svelte';
    import Card from '$lib/components/ui/Card.svelte';
    import Table from '$lib/components/ui/Table.svelte';
    import PermissionGuard from '$lib/components/auth/PermissionGuard.svelte';
    
    $effect(() => {
        setHeader('Dashboard Operativo', false, '', null);
        return () => {
            setHeader('', false, '', null);
        };
    });

    // Mock data for the table
    const pendingRemittances = [
        { id: '#106', cliente: 'Ali Freytez', corredor: 'CHL -> COL', monto: '$100', estado: 'PENDING' },
        { id: '#107', cliente: 'Maria Paz', corredor: 'PER -> CHL', monto: '50 PEN', estado: 'PENDING' },
    ];

    const tableColumns = [
        { key: 'id', label: 'ID' },
        { key: 'cliente', label: 'Cliente' },
        { key: 'corredor', label: 'Corredor' },
        { key: 'monto', label: 'Monto' },
        { key: 'estado', label: 'Estado', format: 'badge' as const }
    ];
</script>

<div class="admin-dashboard">
    <Stack gap="var(--spacing-8)">
        
        <PermissionGuard permission="UI:VIEW:DASHBOARD_STATS">
            <Section title="Ingresos del Día por País de Origen" variant="outline">
                <Grid cols="1fr 1fr" gap="var(--spacing-6)">
                    <div class="stat-item border-left border-green">
                        <span class="stat-label">CHILE</span>
                        <span class="stat-value">$450,000 CLP</span>
                    </div>
                    <div class="stat-item border-left border-teal">
                        <span class="stat-label">PERÚ</span>
                        <span class="stat-value">2,500 PEN</span>
                    </div>
                </Grid>
            </Section>

            <Section title="Tasas Vigentes" variant="outline">
                <div class="inline-stats">
                    <div class="stat-group">
                        <span class="stat-label">VEN &lt;-&gt; CHI:</span>
                        <span class="stat-value-sm">43.5</span>
                    </div>
                    <div class="stat-divider">|</div>
                    <div class="stat-group">
                        <span class="stat-label">PER &lt;-&gt; CHI:</span>
                        <span class="stat-value-sm">3.8</span>
                    </div>
                </div>
            </Section>

            <Section title="Comisiones (Por Corredor)" variant="outline">
                <div class="stat-group">
                    <span class="stat-label">Chile -&gt; Perú:</span>
                    <span class="stat-value-sm">2.5% + $1</span>
                </div>
            </Section>
        </PermissionGuard>

        <PermissionGuard permission="UI:VIEW:REMITTANCES">
            <Section title="Últimas Remesas en Cola">
                <Table 
                    data={pendingRemittances} 
                    columns={tableColumns} 
                    loading={false}
                />
            </Section>
        </PermissionGuard>

    </Stack>
</div>

<style>
    .admin-dashboard {
        max-width: 1200px;
    }

    .stat-item {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
        padding-left: var(--spacing-4);
    }
    
    .border-left {
        border-left: 4px solid var(--gray-300);
    }
    
    .border-green {
        border-color: var(--success-500);
    }
    
    .border-teal {
        border-color: var(--primary-500);
    }

    .stat-label {
        font-size: 14px;
        font-weight: 600;
        color: var(--gray-600);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: var(--gray-900);
    }

    .inline-stats {
        display: flex;
        align-items: center;
        gap: var(--spacing-4);
    }

    .stat-group {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
    }

    .stat-value-sm {
        font-size: 16px;
        font-weight: 600;
        color: var(--gray-900);
    }

    .stat-divider {
        color: var(--gray-400);
        font-size: 18px;
    }
</style>
