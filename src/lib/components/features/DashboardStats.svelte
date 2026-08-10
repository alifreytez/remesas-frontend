<script lang="ts">
    import Card from '../ui/Card.svelte';
    
    let {
        rate = '43.5',
        currencyPair = 'USD a VES',
        activeShipments = '2',
        totalSent = '$350'
    } = $props();
</script>

<Card padding="24px" class="stats-card">
    <div class="circle-graph">
        <span class="label">Tasa actual</span>
        <h2>{rate}</h2>
        <span class="label">{currencyPair}</span>
    </div>
    
    <div class="card-row">
        <div class="mini-card">
            <p>Envíos Activos</p>
            <h3>{activeShipments}</h3>
        </div>
        <div class="mini-card">
            <p>Total Enviado</p>
            <h3 style="color: var(--accent-green)">{totalSent}</h3>
        </div>
    </div>
</Card>

<style>
    .stats-card {
        align-items: center;
        margin: 0 24px 24px 24px;
        width: auto;
    }

    /* Simulación de gráfico circular plano */
    .circle-graph {
        width: 140px;
        height: 140px;
        border-radius: 50%;
        border: 12px solid var(--accent-purple);
        border-right-color: var(--border-color); /* To simulate progress */
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-bottom: 24px;
        box-sizing: border-box;
    }

    .circle-graph .label { 
        font-size: 12px; 
        color: var(--text-muted); 
    }
    
    .circle-graph h2 { 
        font-size: 32px; 
        font-weight: 700; 
        color: var(--text-main); 
        margin: 4px 0; 
    }

    .card-row {
        display: flex;
        justify-content: space-between;
        width: 100%;
        gap: 12px;
    }

    .mini-card {
        flex: 1;
        background-color: var(--bg-secondary);
        border-radius: 20px;
        padding: 16px;
        text-align: center;
    }

    .mini-card p {
        font-size: 12px;
        color: var(--text-muted);
        margin-bottom: 4px;
    }

    .mini-card h3 {
        font-size: 20px;
        font-weight: 700;
        color: var(--text-main);
    }
</style>
