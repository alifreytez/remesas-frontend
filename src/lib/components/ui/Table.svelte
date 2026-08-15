<script lang="ts">
    import type { Snippet } from 'svelte';
    import { Edit2, Eye } from 'lucide-svelte';
    import Badge from './Badge.svelte';
    import Switch from './Switch.svelte';
    import Select from './Select.svelte';
    import Pagination from './Pagination.svelte';
    
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
        }).format(Number(value));

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

    function formatJsonString(val: any): string {
        if (!val) return '';
        if (typeof val === 'string') {
            try { val = JSON.parse(val); } catch (e) { return val; }
        }
        if (Array.isArray(val)) {
            return val.map(item => {
                if (typeof item === 'object' && item !== null) {
                    return Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ');
                }
                return String(item);
            }).join(' | ');
        } else if (typeof val === 'object' && val !== null) {
            return Object.entries(val).map(([k, v]) => `${k}: ${v}`).join(', ');
        }
        return String(val);
    }

    function getRelationDisplay(row: any, col: any) {
        if (col.associationAlias && row[col.associationAlias]) {
            const val = row[col.associationAlias][col.displayField || 'name'];
            if (val !== undefined && val !== null && val !== '') {
                return val;
            }
        }
        if (row[col.key] !== undefined && row[col.key] !== null) return row[col.key];
        return `[DEBUG: no key '${col.key}'. Keys: ${Object.keys(row).join(', ')}]`;
    }

    let currentPage = $state(1);
    let itemsPerPage = $state(10);
    let filters = $state<Record<string, string>>({});

    function applyFilter(key: string, value: string) {
        filters[key] = value;
        currentPage = 1;
    }

    let filteredData = $derived(() => {
        let result = data;
        for (const [key, val] of Object.entries(filters)) {
            if (val) {
                const searchStr = String(val).toLowerCase();
                const colDef = columns.find(c => c.key === key);
                result = result.filter(row => {
                    let cellValue = row[key];
                    if (colDef && colDef.format === 'relation') {
                        cellValue = getRelationDisplay(row, colDef);
                    } else if (colDef && colDef.format === 'currency') {
                        // For currency, search in unformatted number or string
                    }
                    const rowVal = String(cellValue ?? '').toLowerCase();
                    return rowVal.includes(searchStr);
                });
            }
        }
        return result;
    });

    let displayData = $derived(paginated ? filteredData().slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : filteredData());
</script>

<div class="table-wrapper">
    <div class="table-container {variant}">
        <table>
            <thead>
                <tr>
                    {#each columns as col}
                        <th style="width: {col.width || 'auto'}; text-align: {col.align || 'left'}">
                            <div class="header-content">
                                <span>{col.label}</span>
                                <!-- Render Header Filters for V2 or if specified -->
                                {#if col.filterType === 'text'}
                                    <input 
                                        type="text" 
                                        class="header-filter" 
                                        placeholder="Filtrar {col.label}..." 
                                        value={filters[col.key] || ''}
                                        onkeydown={(e) => { if (e.key === 'Enter') applyFilter(col.key, e.currentTarget.value) }}
                                        onchange={(e) => applyFilter(col.key, e.currentTarget.value)}
                                    />
                                {:else if col.filterType === 'select'}
                                    <div class="header-select-wrapper" style="text-align: left;">
                                        <Select 
                                            options={col.filterOptions || [{value: '', label: 'Todos'}]}
                                            placeholder="Todos"
                                            value={filters[col.key] || ''}
                                            onchange={(val) => applyFilter(col.key, val)}
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
                {#if data.length === 0}
                    <tr>
                        <td colspan={columns.length + (hasActions ? 1 : 0)} style="text-align: center; padding: 40px; color: var(--gray-500);">
                            No hay registros para mostrar
                        </td>
                    </tr>
                {:else}
                    {#each displayData as row}
                        <tr>
                        {#each columns as col}
                            <td style="text-align: {col.align || 'left'};">
                                <div style="{col.align === 'center' ? 'display: flex; justify-content: center;' : ''}">
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
                                    {:else if col.format === 'relation'}
                                        {getRelationDisplay(row, col)}
                                    {:else if col.format === 'json'}
                                        <div class="json-cell">
                                            {formatJsonString(row[col.key])}
                                        </div>
                                    {:else}
                                        {row[col.key]}
                                    {/if}
                                </div>
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
                {/if}
            </tbody>
        </table>
    </div>

    <!-- Paginación -->
    {#if paginated}
        <div style="padding-top: 12px;">
            <Pagination 
                bind:currentPage={currentPage} 
                bind:itemsPerPage={itemsPerPage}
                totalItems={data.length} 
                hasBorder={false}
            />
        </div>
    {/if}
</div>

<style>
    .table-wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .table-container {
        width: 100%;
        overflow-x: auto;
        overflow-y: auto;
        max-height: 400px;
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
        padding: 12px 16px;
        font-weight: 500;
        color: var(--text-muted);
        border-bottom: 1px solid var(--border-color);
        border-right: 1px solid var(--border-color);
        vertical-align: top;
    }

    th:last-child {
        border-right: none;
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
        padding: 10px 16px;
        color: var(--text-main);
        border-bottom: 1px solid var(--border-color);
        border-right: 1px solid var(--border-color);
    }

    td:last-child {
        border-right: none;
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

    /* Columnas pegajosas (Sticky) para acciones */
    .sticky-actions-col {
        position: sticky;
        right: 0;
        background-color: inherit; /* Hereda el background del thead/tr */
        z-index: 1;
        border-left: 1px solid var(--border-color);
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
</style>
