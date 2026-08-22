<script lang="ts">
    import Badge from './Badge.svelte';
    import { ArrowRight } from 'lucide-svelte';

    let {
        clientName = '',
        originCountry = 'CHI', // Added for route
        destCountry = 'COL',   // Added for route
        recipientName = '',    // Replaces subtitle
        id = '',               // Separated from title
        date = '',
        amount = '',
        status = 'pending',
        onclick
    }: {
        clientName?: string;
        originCountry?: string;
        destCountry?: string;
        recipientName?: string;
        id?: string;
        date: string;
        amount: string;
        status: 'pending' | 'approved' | 'rejected';
        onclick?: () => void;
    } = $props();

    const statusMap = {
        pending: { text: 'Pendiente', variant: 'warning' },
        approved: { text: 'Aprobada', variant: 'success' },
        rejected: { text: 'Rechazada', variant: 'danger' }
    };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="action-card" {onclick}>
    <div class="card-header">
        <span class="id-text">#{id}</span>
        <span class="date-text">{date}</span>
    </div>
    
    <div class="card-body">
        <div class="info-left">
            <div class="people">
                {#if clientName}
                    <span class="person">{clientName}</span>
                    <ArrowRight size={14} color="var(--text-muted)" />
                {/if}
                <span class="person">{recipientName}</span>
            </div>
            <div class="route">
                {originCountry} a {destCountry}
            </div>
        </div>
        
        <div class="info-right">
            <div class="amount">{amount}</div>
            <Badge text={statusMap[status].text} variant={statusMap[status].variant} />
        </div>
    </div>

    <!-- Botón de ver detalle -->
    <button class="detail-btn">
        Ver Detalle
    </button>
</div>

<style>
    .action-card {
        border: 1px solid var(--border-color);
        padding: 16px;
        margin-bottom: 12px;
        border-radius: 12px;
        background: var(--bg-primary);
        display: flex;
        flex-direction: column;
        gap: 12px;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    }

    .action-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        border-color: var(--text-muted);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px dashed var(--border-color);
        padding-bottom: 8px;
    }

    .id-text {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-muted);
    }

    .date-text {
        font-size: 12px;
        color: var(--text-muted);
    }

    .card-body {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .info-left {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .people {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 800;
        color: var(--text-main);
        font-size: 15px;
        letter-spacing: -0.3px;
    }

    .person {
        /* inherited from .people */
    }

    .route {
        font-size: 13px;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 4px;
        font-weight: 500;
    }

    .info-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
    }

    .amount {
        font-weight: 800;
        font-size: 16px;
        color: var(--accent-purple);
    }

    .detail-btn {
        width: 100%;
        margin-top: 8px;
        padding: 8px;
        background-color: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-main);
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        transition: background-color 0.2s, color 0.2s;
        font-family: inherit;
    }

    .detail-btn:hover {
        background-color: var(--accent-purple);
        color: white;
        border-color: var(--accent-purple);
    }
</style>

