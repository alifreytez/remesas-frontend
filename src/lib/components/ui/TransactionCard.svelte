<script lang="ts">
    import { Send, ChevronRight } from 'lucide-svelte';
    import StatusBadge from './StatusBadge.svelte';
    import { goto } from '$app/navigation';
    
    let { 
        id, 
        realId,
        date, 
        destination, 
        amountPaid, 
        amountReceived, 
        status 
    } = $props<{
        id: string;
        realId?: string | number;
        date: string;
        destination: string;
        amountPaid: string;
        amountReceived: string;
        status: string;
    }>();
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
        <StatusBadge {status} />
    </div>
    <div class="tx-col tx-action">
        <button class="icon-btn" onclick={() => goto(`/client/history/${realId || id.replace('#', '')}`)} title="Ver Detalles">
            <ChevronRight size={20} />
        </button>
    </div>
</div>

<style>
    /* Tx Row Layout - CSS estandarizado de Home */
    .tx-item-wide {
        display: grid;
        grid-template-columns: 48px 1.2fr 1fr 1.2fr 1.2fr 140px auto;
        align-items: center;
        gap: 24px;
        padding: 16px;
        border: 1px solid var(--gray-200);
        border-radius: 16px;
        background-color: var(--white);
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
        font-weight: 600;
        font-size: 14px;
        color: var(--text-main);
    }

    .tx-desc {
        font-size: 12px;
        color: var(--gray-500);
    }

    .tx-label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--gray-500);
        font-weight: 600;
    }

    .tx-value {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-main);
        line-height: 1.4;
    }

    .font-mono {
        font-variant-numeric: tabular-nums;
    }

    .text-primary {
        color: var(--primary-700);
    }

    .tx-status-wrap {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
    }

    .icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        background-color: transparent;
        color: var(--gray-400);
        cursor: pointer;
        transition: all 0.2s;
    }

    .icon-btn:hover {
        background-color: var(--gray-100);
        color: var(--gray-900);
    }

    @media (max-width: 1200px) {
        .tx-item-wide {
            grid-template-columns: 48px 1.2fr 1fr 1.2fr auto;
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

        .tx-action {
            grid-column: 5;
            grid-row: 1 / span 2;
            display: flex;
            align-items: center;
            justify-content: flex-end;
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
        .tx-action {
            width: 100%;
            display: flex;
            justify-content: flex-end;
            margin-top: -8px;
        }
    }
</style>

