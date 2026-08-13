<script lang="ts">
    import { Send } from 'lucide-svelte';
    
    let { 
        id, 
        date, 
        destination, 
        amountPaid, 
        amountReceived, 
        status 
    } = $props<{
        id: string;
        date: string;
        destination: string;
        amountPaid: string;
        amountReceived: string;
        status: string;
    }>();

    // Determinar clase del badge de estado
    let badgeClass = $derived(
        (status === 'Rechazada' || status === 'Cancelada') ? 'badge-danger' : 
        (status === 'Aprobada' || status === 'Completada') ? 'badge-success' : 
        'badge-warning'
    );
</script>

<div class="tx-item-wide">
    <div class="tx-icon">
        <Send size={18} color="var(--primary-600)" />
    </div>
    <div class="tx-col tx-main">
        <span class="tx-name">{id}</span>
        <span class="tx-desc">{date}</span>
    </div>
    <div class="tx-col tx-destino">
        <span class="tx-label">Destino</span>
        <span class="tx-value">{destination}</span>
    </div>
    <div class="tx-col tx-pagado">
        <span class="tx-label">Monto Pagado</span>
        <span class="tx-value font-mono">{amountPaid}</span>
    </div>
    <div class="tx-col tx-recibir">
        <span class="tx-label">Monto a Recibir</span>
        <span class="tx-value font-mono text-primary">{amountReceived}</span>
    </div>
    <div class="tx-col tx-status-wrap">
        <span class="tx-status-badge {badgeClass}">{status}</span>
    </div>
</div>

<style>
    /* Tx Row Layout - CSS estandarizado de Home */
    .tx-item-wide {
        display: grid;
        grid-template-columns: 48px 1.5fr 1fr 1fr 1.2fr 100px;
        align-items: center;
        gap: 24px;
        padding: 16px;
        border: 1px solid var(--gray-200);
        border-radius: 16px;
        transition: border-color 0.2s;
        background-color: var(--white);
    }

    .tx-item-wide:hover {
        border-color: var(--gray-300);
    }

    .tx-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background-color: var(--primary-50);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-600);
        flex-shrink: 0;
    }

    .tx-col {
        display: flex;
        flex-direction: column;
        gap: 4px;
        overflow: hidden; /* prevents grid blowout */
    }
    
    .tx-main {
        /* Default flow */
    }

    .tx-name {
        font-weight: 700;
        font-size: 15px;
        color: var(--gray-900);
    }

    .tx-desc {
        font-size: 12px;
        color: var(--gray-500);
    }

    .tx-label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--gray-400);
        font-weight: 600;
    }

    .tx-value {
        font-size: 14px;
        font-weight: 600;
        color: var(--gray-900);
    }

    .font-mono {
        font-variant-numeric: tabular-nums;
    }

    .text-primary {
        color: var(--primary-700);
        font-weight: 700;
    }

    .tx-status-wrap {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
    }

    .tx-status-badge {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: capitalize;
        white-space: nowrap;
    }

    .badge-warning {
        background-color: var(--warning-50);
        color: var(--warning-700);
    }

    .badge-success {
        background-color: #ecfdf5; /* Tailwind emerald-50 */
        color: var(--accent-green);
    }

    .badge-danger {
        background-color: var(--danger-50);
        color: var(--danger-600);
    }

    @media (max-width: 1200px) {
        .tx-item-wide {
            grid-template-columns: 48px 1.2fr 1fr 1.2fr; /* ID, Pagado/Destino, Recibir/Status */
            grid-template-rows: auto auto;
            row-gap: 20px;
            column-gap: 16px;
        }

        .tx-icon {
            grid-column: 1;
            grid-row: 1 / span 2;
        }

        /* Fila 1 */
        .tx-main {
            grid-column: 2;
            grid-row: 1 / span 2;
            justify-content: center;
        }

        .tx-pagado {
            grid-column: 3;
            grid-row: 1;
        }

        .tx-recibir {
            grid-column: 4;
            grid-row: 1;
        }

        /* Fila 2 */
        .tx-destino {
            grid-column: 3;
            grid-row: 2;
        }

        .tx-status-wrap {
            grid-column: 4;
            grid-row: 2;
            justify-content: flex-start;
        }
    }

    @media (max-width: 768px) {
        .tx-item-wide {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
        }
        .tx-status-wrap {
            justify-content: flex-start;
        }
    }
</style>
