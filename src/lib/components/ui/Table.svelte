<script lang="ts">
    import type { Snippet } from 'svelte';
    import { Edit2, Eye } from 'lucide-svelte';
    import Badge from './Badge.svelte';
    import Switch from './Switch.svelte';
    import Select from './Select.svelte';
    
    let {
        columns = [],
        data = [],
        variant = 'v1', // 'v1' | 'v2'
        paginated = true,
        hasActions = false,
        actions, // Snippet for rendering actions per row
        onswitch
    }: {
        columns: Array<{ 
            key: string; 
            label: string; 
            width?: string; 
            filterType?: 'text' | 'select';
            filterOptions?: Array<{value: string, label: string}>;
            format?: 'text' | 'currency' | 'switch' | 'badge';
            currencyCode?: string;
            currencyKey?: string;
            badgeMap?: Record<string, 'info' | 'success' | 'warning' | 'danger'>;
        }>;
        data: Array<Record<string, any>>;
        variant?: 'v1' | 'v2';
        paginated?: boolean;
        hasActions?: boolean;
        actions?: Snippet<[Record<string, any>]>;
        onswitch?: (row: any, key: string, checked: boolean) => void;
    } = $props();

    function formatCurrency(value: any, code: string = 'USD') {
        if (value === undefined || value === null) return '';
        
        // Formateo numérico base al estilo latino (ej: 1.500,50)
        const numStr = new Intl.NumberFormat('es-CL', { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
        }).format(value);

        // Mapa de símbolos personalizados según el requerimiento
        const symbols: Record<string, string> = {
            'PEN': 'S/ ',
            'VES': 'Bs. ',
            'CLP': '$',
            'USD': '$'
        };

        const prefix = symbols[code] || `${code} `;
        return `${prefix}${numStr}`;
    }
</script>

<div class="table-wrapper">
    <div class="table-container {variant}">
        <table>
            <thead>
                <tr>
                    {#each columns as col}
                        <th style="width: {col.width || 'auto'}">
                            <div class="header-content">
                                <span>{col.label}</span>
                                <!-- Render Header Filters for V2 or if specified -->
                                {#if col.filterType === 'text'}
                                    <input type="text" class="header-filter" placeholder="Filtrar {col.label}..." />
                                {:else if col.filterType === 'select'}
                                    <div class="header-select-wrapper">
                                        <Select 
                                            options={col.filterOptions || [{value: '', label: 'Todos'}]}
                                            placeholder="Todos"
                                        />
                                    </div>
                                {/if}
                            </div>
                        </th>
                    {/each}
                    {#if hasActions}
                        <th class="sticky-actions-col" style="width: 80px; text-align: center;">Acciones</th>
                    {/if}
                </tr>
            </thead>
            <tbody>
                {#each data as row}
                    <tr>
                        {#each columns as col}
                            <td>
                                {#if col.format === 'currency'}
                                    {formatCurrency(row[col.key], col.currencyKey ? row[col.currencyKey] : col.currencyCode)}
                                {:else if col.format === 'badge'}
                                    <Badge 
                                        text={row[col.key]} 
                                        variant={col.badgeMap ? (col.badgeMap[row[col.key]] || 'info') : 'info'} 
                                    />
                                {:else if col.format === 'switch'}
                                    <Switch 
                                        checked={row[col.key]} 
                                        onchange={(checked) => onswitch && onswitch(row, col.key, checked)} 
                                    />
                                {:else}
                                    {row[col.key]}
                                {/if}
                            </td>
                        {/each}
                        {#if hasActions}
                            <td class="sticky-actions-col" style="text-align: center;">
                                {#if actions}
                                    {@render actions(row)}
                                {:else}
                                    <!-- Fallback dummy actions if snippet not provided -->
                                    <div style="display:flex; gap: 8px; justify-content: center;">
                                        <span style="cursor:pointer; color: var(--text-muted);"><Edit2 size={16} /></span>
                                        <span style="cursor:pointer; color: var(--text-muted);"><Eye size={16} /></span>
                                    </div>
                                {/if}
                            </td>
                        {/if}
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <!-- Paginación -->
    {#if paginated}
        <div class="pagination">
            <span class="pagination-info">Mostrando 1 a 10 de 50 resultados</span>
            <div class="pagination-controls">
                <button class="page-btn" disabled>&laquo; Ant</button>
                <button class="page-btn active">1</button>
                <button class="page-btn">2</button>
                <button class="page-btn">3</button>
                <button class="page-btn">Sig &raquo;</button>
            </div>
        </div>
    {/if}
</div>

<style>
    .table-wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
        margin-bottom: 24px;
    }

    .table-container {
        width: 100%;
        overflow-x: auto;
        border-radius: 16px;
        border: 1px solid var(--border-color);
        background: var(--bg-primary);
    }

    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
    }

    th {
        text-align: left;
        padding: 16px;
        font-weight: 500;
        color: var(--text-muted);
        border-bottom: 1px solid var(--border-color);
        vertical-align: top;
    }

    .header-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        /* Variables for overriding custom Select component styling */
        --select-mb: 0; 
        --select-bg: var(--bg-primary);
        --select-radius: 6px;
        --select-padding: 6px 8px;
        --select-font-size: 12px;
    }

    .header-filter {
        width: 100%;
        padding: 6px 8px;
        font-size: 12px;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        background-color: var(--bg-primary);
        color: var(--text-main);
        outline: none;
        box-sizing: border-box;
        font-family: inherit;
    }
    
    .header-filter:focus {
        border-color: var(--accent-purple);
    }

    td {
        padding: 16px;
        color: var(--text-main);
        border-bottom: 1px solid var(--border-color);
    }

    tr:last-child td {
        border-bottom: none;
    }

    /* Variant 2: zebra striping or more compact */
    .v2 table {
        font-size: 13px;
    }
    .v2 th {
        background-color: var(--bg-secondary);
        color: var(--text-main);
        font-weight: 600;
    }
    .v2 tr:hover td {
        background-color: var(--bg-secondary);
    }

    /* Columnas pegajosas (Sticky) para acciones */
    .sticky-actions-col {
        position: sticky;
        right: 0;
        background-color: inherit; /* Hereda el background del thead/tr */
        z-index: 1;
        box-shadow: -2px 0 5px rgba(0,0,0,0.03); /* Ligera sombra para indicar superposición */
    }
    
    th.sticky-actions-col {
        background-color: var(--bg-primary);
    }
    .v2 th.sticky-actions-col {
        background-color: var(--bg-secondary);
    }
    
    td.sticky-actions-col {
        background-color: var(--bg-primary);
    }
    .v2 tr:hover td.sticky-actions-col {
        background-color: var(--bg-secondary);
    }

    /* Paginación */
    .pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
        padding: 0 8px;
    }

    .pagination-info {
        font-size: 13px;
        color: var(--text-muted);
    }

    .pagination-controls {
        display: flex;
        gap: 4px;
    }

    .page-btn {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        color: var(--text-main);
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
        transition: background-color 0.2s;
        font-family: inherit;
    }

    .page-btn:hover:not(:disabled) {
        background: var(--bg-secondary);
    }

    .page-btn.active {
        background: var(--bg-inverted);
        color: white;
        border-color: var(--bg-inverted);
    }

    .page-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
