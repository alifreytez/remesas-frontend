<script lang="ts">
    import type { Snippet } from 'svelte';
    import { onMount, onDestroy } from 'svelte';
    import { Edit2, Eye, Info } from 'lucide-svelte';
    import Badge from './Badge.svelte';
    import Switch from './Switch.svelte';
    import Select from './Select.svelte';
    import Pagination from './Pagination.svelte';
    
    let {
        columns = [],
        data = [],
        variant = 'v2', // 'v1' | 'v2'
        paginated = true,
        hasActions = false,
        actions, // Snippet for rendering actions per row
        onswitch,
        onfilter
    }: {
        columns: Array<{ 
            key: string; 
            label: string; 
            width?: string; 
            align?: string;
            filterType?: 'text' | 'select' | 'date' | 'dateRange';
            filterOptions?: Array<{value: string, label: string}>;
            filterProps?: Record<string, any>;
            format?: 'text' | 'currency' | 'switch' | 'badge' | 'relation' | 'json';
            currencyCode?: string;
            currencyKey?: string;
            badgeMap?: Record<string, 'info' | 'success' | 'warning' | 'danger'>;
            associationAlias?: string;
            displayField?: string;
        }>;
        data: Array<Record<string, any>>;
        variant?: 'v1' | 'v2';
        paginated?: boolean;
        hasActions?: boolean;
        actions?: Snippet<[Record<string, any>]>;
        onswitch?: (row: any, key: string, checked: boolean) => void;
        onfilter?: (filters: Record<string, string>) => void;
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
    
    // DateRange popup state
    let activeDateRangePopup = $state<string | null>(null);
    let tempDateRange = $state<Record<string, { start: string, end: string }>>({});

    function handleDocumentClick(event: MouseEvent) {
        if (!activeDateRangePopup) return;
        const target = event.target as HTMLElement;
        if (!target.closest('.date-range-popup') && !target.closest('.date-range-btn')) {
            activeDateRangePopup = null;
        }
    }

    onMount(() => {
        document.addEventListener('click', handleDocumentClick);
    });

    onDestroy(() => {
        if (typeof document !== 'undefined') {
            document.removeEventListener('click', handleDocumentClick);
        }
    });

    function toggleDateRangePopup(key: string) {
        if (activeDateRangePopup === key) {
            activeDateRangePopup = null;
        } else {
            activeDateRangePopup = key;
            if (!tempDateRange[key]) tempDateRange[key] = { start: '', end: '' };
        }
    }

    function confirmDateRange(key: string) {
        const { start, end } = tempDateRange[key];
        const val = `${start || ''}|${end || ''}`;
        applyFilter(key, val === '|' ? '' : val);
        activeDateRangePopup = null;
    }

    function applyFilter(key: string, value: string) {
        filters[key] = value;
        currentPage = 1;
        if (onfilter) {
            // Emitting copy of filters to avoid reactive issues outside
            onfilter($state.snapshot(filters));
        }
    }

    function getDisplayDateRange(val: string) {
        if (!val || val === '|') return 'Rango de fechas';
        const [start, end] = val.split('|');
        const format = (d: string) => {
            if (!d) return '';
            const p = d.split('-');
            return p.length === 3 ? `${p[2]}/${p[1]}/${p[0].slice(2)}` : d;
        };
        const s = format(start);
        const e = format(end);
        if (s && e) return `${s} - ${e}`;
        if (s) return `Desde ${s}`;
        if (e) return `Hasta ${e}`;
        return 'Rango de fechas';
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
                    }
                    const rowVal = String(cellValue ?? '').toLowerCase();
                    
                    if (colDef?.filterType === 'dateRange') {
                        if (!val || val === '|') return true;
                        const [start, end] = val.split('|');
                        // Consider ISO date starts with YYYY-MM-DD
                        if (start && rowVal < start) return false;
                        if (end && rowVal > end + 'T23:59:59') return false; // Simple comparison assuming ISO format
                        return true;
                    }
                    if (colDef?.filterType === 'date') {
                        return rowVal.startsWith(val);
                    }

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
                        <th style="width: {col.width || (col.filterType === 'dateRange' ? '170px' : 'auto')}; min-width: {col.width || (col.filterType === 'dateRange' ? '170px' : 'auto')}; text-align: {col.align || 'left'}">
                            <div class="header-content">
                                <span>{col.label}</span>
                                {#if col.filterType}
                                    <div class="filter-wrapper">
                                        {#if col.filterType === 'text'}
                                            <input 
                                                type="text" 
                                                class="header-filter" 
                                                placeholder="Filtrar {col.label}..." 
                                                value={filters[col.key] || ''}
                                                {...col.filterProps || {}}
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
                                        {:else if col.filterType === 'date'}
                                            <input 
                                                type="date" 
                                                class="header-filter" 
                                                value={filters[col.key] || ''}
                                                onchange={(e) => applyFilter(col.key, e.currentTarget.value)}
                                            />
                                        {:else if col.filterType === 'dateRange'}
                                            <div style="position: relative;">
                                                <button class="header-filter date-range-btn" onclick={() => toggleDateRangePopup(col.key)} title={getDisplayDateRange(filters[col.key])}>
                                                    {getDisplayDateRange(filters[col.key])}
                                                </button>
                                                {#if activeDateRangePopup === col.key}
                                                    <div class="date-range-popup">
                                                        <div class="date-range-inputs">
                                                            <div class="date-input-group">
                                                                <label>Inicio</label>
                                                                <input type="date" bind:value={tempDateRange[col.key].start} />
                                                            </div>
                                                            <div class="date-input-group">
                                                                <label>Fin</label>
                                                                <input type="date" bind:value={tempDateRange[col.key].end} />
                                                            </div>
                                                        </div>
                                                        <div class="date-range-actions">
                                                            <button class="btn-cancel" onclick={() => { activeDateRangePopup = null; }}>Cancelar</button>
                                                            <button class="btn-confirm" onclick={() => confirmDateRange(col.key)}>Confirmar</button>
                                                        </div>
                                                    </div>
                                                {/if}
                                            </div>
                                        {/if}
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
            {#if displayData.length > 0}
            <tbody>
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
            </tbody>
            {/if}
        </table>
        
        {#if displayData.length === 0}
            <div class="empty-state">
                <Info size={16} />
                <span>No hay registros para mostrar.</span>
            </div>
        {/if}
    </div>

    <!-- Paginación -->
    {#if paginated}
        <div style="padding-top: 12px;">
            <Pagination 
                bind:currentPage={currentPage} 
                bind:itemsPerPage={itemsPerPage}
                totalItems={filteredData().length} 
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

    .empty-state {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px;
        color: var(--text-muted);
        font-size: 13px;
        font-style: italic;
    }

    .table-container {
        width: 100%;
        max-height: 450px;
        overflow: auto;
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
        position: sticky;
        top: 0;
        z-index: 10;
        text-align: left;
        padding: 12px 16px;
        font-weight: 500;
        color: var(--text-muted);
        border-bottom: 1px solid var(--border-color);
        border-right: 1px solid var(--border-color);
        vertical-align: top;
        background-color: var(--bg-primary);
    }

    th:first-child {
        border-top-left-radius: 15px;
    }

    th:last-child {
        border-right: none;
        border-top-right-radius: 15px;
    }

    .header-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        /* Variables for overriding custom Select component styling */
        --select-mb: 0; 
        --select-bg: var(--bg-primary);
        --select-radius: 6px;
        --select-padding: 0 8px;
        --select-font-size: 12px;
        --select-height: 30px;
    }

    .header-filter {
        width: 100%;
        padding: 0 8px;
        height: 30px;
        font-size: 12px;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        background-color: var(--bg-primary);
        color: var(--text-main);
        outline: none;
        box-sizing: border-box;
        font-family: inherit;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .filter-wrapper {
        width: 0;
        min-width: 100%;
    }
    
    .header-filter:focus {
        border-color: var(--accent-purple);
    }
    
    .date-range-btn {
        cursor: pointer;
        text-align: left;
        display: block;
    }
    
    .date-range-popup {
        position: absolute;
        top: 100%;
        left: 0;
        z-index: 10;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        min-width: 200px;
        margin-top: 4px;
    }

    .date-range-inputs {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
    }

    .date-input-group label {
        display: block;
        font-size: 11px;
        color: var(--text-muted);
        margin-bottom: 4px;
    }

    .date-input-group input {
        width: 100%;
        padding: 6px 8px;
        font-size: 12px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        box-sizing: border-box;
    }

    .date-range-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }

    .date-range-actions button {
        padding: 4px 10px;
        font-size: 12px;
        border-radius: 4px;
        cursor: pointer;
        border: none;
        font-weight: 500;
    }

    .btn-cancel {
        background: var(--bg-secondary);
        color: var(--text-main);
        border: 1px solid var(--border-color) !important;
    }

    .btn-confirm {
        background: var(--accent-purple, #6d28d9);
        color: white;
    }

    td {
        padding: 10px 16px;
        color: var(--text-main);
        border-bottom: 1px solid var(--border-color);
        border-right: 1px solid var(--border-color);
    }

    td:first-child {
        /* No especial por defecto, se maneja en tr:last-child */
    }

    td:last-child {
        border-right: none;
    }

    tbody tr:last-child td {
        border-bottom: none;
    }

    tbody tr:last-child td:first-child {
        border-bottom-left-radius: 15px;
    }

    tbody tr:last-child td:last-child {
        border-bottom-right-radius: 15px;
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
