<script lang="ts">
    import type { Snippet } from 'svelte';
    import Switch from './Switch.svelte';

    let { columns, data, cell, headerCell } = $props<{
        columns: { 
            key: string; 
            label: string; 
            align?: 'left' | 'center' | 'right'; 
            width?: string;
            type?: 'switch';
            isAllChecked?: boolean;
            onToggleAll?: (checked: boolean) => void;
        }[];
        data: any[];
        cell?: Snippet<[any, string]>;
        headerCell?: Snippet<[any]>; // Recibe (row, colKey)
    }>();
</script>

<div class="data-grid-container">
    <table class="data-grid">
        <thead>
            <tr>
                {#each columns as col}
                    <th 
                        style="text-align: {col.align || 'left'}; {col.width ? `width: ${col.width};` : ''}"
                    >
                        {#if headerCell}
                            {@render headerCell(col)}
                        {:else if col.type === 'switch'}
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                                <span>{col.label}</span>
                                <Switch 
                                    checked={col.isAllChecked} 
                                    onchange={(checked) => col.onToggleAll && col.onToggleAll(checked)}
                                />
                            </div>
                        {:else}
                            {col.label}
                        {/if}
                    </th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#if data.length === 0}
                <tr>
                    <td colspan={columns.length} class="empty-state">No hay registros disponibles.</td>
                </tr>
            {:else}
                {#each data as row}
                    <tr>
                        {#each columns as col}
                            <td style="text-align: {col.align || 'left'}">
                                {#if cell}
                                    {@render cell(row, col.key)}
                                {:else}
                                    {row[col.key]}
                                {/if}
                            </td>
                        {/each}
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>

<style>
    .data-grid-container {
        width: 100%;
        max-width: 100%;
        max-height: 450px;
        overflow-x: auto;
        overflow-y: auto;
        border-radius: var(--radius-lg);
        border: 1px solid var(--gray-200);
        background-color: var(--white);
    }

    .data-grid {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--text-sm);
        text-align: left;
    }

    .data-grid th {
        position: sticky;
        top: 0;
        z-index: 10;
        background-color: var(--gray-50);
        color: var(--gray-600);
        font-weight: 600;
        padding: var(--spacing-3) var(--spacing-4);
        border-bottom: 1px solid var(--gray-200);
        white-space: nowrap;
    }

    .data-grid td {
        padding: var(--spacing-3) var(--spacing-4);
        border-bottom: 1px solid var(--gray-100);
        color: var(--gray-900);
        vertical-align: middle;
    }

    .data-grid tbody tr:last-child td {
        border-bottom: none;
    }

    .data-grid tbody tr:hover {
        background-color: var(--gray-50);
    }

    .empty-state {
        text-align: center;
        padding: var(--spacing-6) !important;
        color: var(--gray-500) !important;
        font-style: italic;
    }
</style>

