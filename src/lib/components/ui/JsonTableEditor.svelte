<script lang="ts">
    import TableIcon from 'lucide-svelte/icons/table';
    import LayoutList from 'lucide-svelte/icons/layout-list';
    import Plus from 'lucide-svelte/icons/plus';
    import Trash2 from 'lucide-svelte/icons/trash-2';
    import Edit2 from 'lucide-svelte/icons/edit-2';
    import Columns from 'lucide-svelte/icons/columns';
    import Check from 'lucide-svelte/icons/check';
    import Button from './Button.svelte';

    let {
        value = $bindable(null),
        disabled = false,
        name = "root",
        isRoot = true,
        onClose = undefined
    }: {
        value?: any;
        disabled?: boolean;
        name?: string;
        isRoot?: boolean;
        onClose?: (val?: any, isCancel?: boolean) => void;
    } = $props();

    let internalValue = $state<any>(null);
    let parsedString = $state(false);
    let initialized = $state(false);

    $effect(() => {
        if (!initialized) {
            if (value !== undefined && value !== null) {
                if (typeof value === 'string') {
                    try {
                        internalValue = JSON.parse(value);
                        parsedString = true;
                    } catch(e) {
                        internalValue = [];
                    }
                } else {
                    // Si ya es un objeto/arreglo, copiamos para evitar mutaciones directas extrañas
                    internalValue = Array.isArray(value) ? [...value] : { ...value };
                }
            } else {
                internalValue = [];
            }
            initialized = true;
        }
    });

    // Sincronizar internalValue -> value
    $effect(() => {
        if (initialized && isRoot) {
            if (parsedString) {
                value = JSON.stringify(internalValue);
            } else {
                value = internalValue;
            }
        }
    });

    let isArrayMode = $derived(Array.isArray(internalValue));
    
    // ======== CUSTOM MODALS ========
    let promptModal = $state<{isOpen: boolean, message: string, value: string, resolve: ((val: string | null) => void) | null}>({isOpen: false, message: '', value: '', resolve: null});
    let confirmModal = $state<{isOpen: boolean, message: string, resolve: ((val: boolean) => void) | null}>({isOpen: false, message: '', resolve: null});

    function showPrompt(message: string): Promise<string | null> {
        return new Promise(resolve => {
            promptModal = { isOpen: true, message, value: '', resolve };
        });
    }

    function showConfirm(message: string): Promise<boolean> {
        return new Promise(resolve => {
            confirmModal = { isOpen: true, message, resolve };
        });
    }

    function closePrompt(submit: boolean) {
        if (promptModal.resolve) {
            promptModal.resolve(submit ? promptModal.value : null);
        }
        promptModal.isOpen = false;
    }

    function closeConfirm(submit: boolean) {
        if (confirmModal.resolve) {
            confirmModal.resolve(submit);
        }
        confirmModal.isOpen = false;
    }

    // ======== MODO ARREGLO ========
    let extraColumns = $state<string[]>([]);

    let columns = $derived(() => {
        if (!isArrayMode) return [];
        const keys = new Set<string>();
        internalValue.forEach((row: any) => {
            if (row && typeof row === 'object') {
                Object.keys(row).forEach(k => keys.add(k));
            }
        });
        extraColumns.forEach(c => keys.add(c));
        return Array.from(keys);
    });

    function addRow() {
        if (!isArrayMode) return;
        const newRow: Record<string, any> = {};
        columns().forEach(col => newRow[col] = '');
        internalValue = [...internalValue, newRow];
    }

    function removeRow(index: number) {
        if (!isArrayMode) return;
        internalValue = internalValue.filter((_: any, i: number) => i !== index);
    }

    async function addColumn() {
        if (!isArrayMode) return;
        const newCol = await showPrompt("Nombre de la nueva columna:");
        if (newCol && !columns().includes(newCol)) {
            extraColumns = [...extraColumns, newCol];
            internalValue = internalValue.map((row: any) => ({ ...row, [newCol]: '' }));
        }
    }

    async function removeColumn(col: string) {
        if (!isArrayMode) return;
        if (await showConfirm(`¿Estás seguro de eliminar la columna "${col}" y sus datos en todas las filas?`)) {
            extraColumns = extraColumns.filter(c => c !== col);
            internalValue = internalValue.map((row: any) => {
                const newRow = { ...row };
                delete newRow[col];
                return newRow;
            });
        }
    }

    // ======== MODO OBJETO ========
    function addProperty() {
        if (isArrayMode) return;
        let base = 'newKey';
        let idx = 1;
        while (internalValue.hasOwnProperty(base)) base = `newKey${idx++}`;
        internalValue = { ...internalValue, [base]: '' };
    }

    function removeProperty(key: string) {
        if (isArrayMode) return;
        const copy = { ...internalValue };
        delete copy[key];
        internalValue = copy;
    }

    function renameProperty(oldKey: string, newKey: string) {
        if (isArrayMode || !newKey || oldKey === newKey || internalValue.hasOwnProperty(newKey)) return;
        const copy = { ...internalValue };
        copy[newKey] = copy[oldKey];
        delete copy[oldKey];
        internalValue = copy;
    }

    async function switchMode() {
        if (isArrayMode) {
            if (await showConfirm("Cambiar a modo Objeto perderá la estructura de tabla actual. ¿Continuar?")) {
                internalValue = {};
            }
        } else {
            if (await showConfirm("Cambiar a modo Arreglo perderá las propiedades actuales. ¿Continuar?")) {
                internalValue = [];
            }
        }
    }

    function transformToComplex(rowIdx: number | undefined, key: string, asArray: boolean) {
        const newVal = asArray ? [] : {};
        if (isArrayMode && rowIdx !== undefined) {
            internalValue[rowIdx][key] = newVal;
            internalValue = [...internalValue];
        } else {
            internalValue[key] = newVal;
            internalValue = { ...internalValue };
        }
    }

    // ======== SUB-EDITOR MODAL ========
    let subEditorPath = $state<{rowIdx?: number, key?: string} | null>(null);
    let subEditorValue = $state<any>(null);

    function openSubEditor(rowIdx: number | undefined, key: string | undefined, currentVal: any) {
        subEditorValue = currentVal;
        subEditorPath = { rowIdx, key };
    }

    function saveSubEditor(newVal: any, isCancel?: boolean) {
        if (!isCancel && subEditorPath) {
            if (isArrayMode && subEditorPath.rowIdx !== undefined) {
                if (subEditorPath.key !== undefined) {
                    internalValue[subEditorPath.rowIdx][subEditorPath.key] = newVal;
                } else {
                    internalValue[subEditorPath.rowIdx] = newVal;
                }
                internalValue = [...internalValue];
            } else if (subEditorPath.key !== undefined) {
                internalValue[subEditorPath.key] = newVal;
                internalValue = { ...internalValue };
            } else {
                internalValue = newVal;
            }
        }
        subEditorPath = null;
    }

    function isComplex(val: any) {
        return val !== null && typeof val === 'object';
    }

    // Handlers para asegurar reactividad
    function updateVal() {
        internalValue = isArrayMode ? [...internalValue] : {...internalValue};
    }

</script>

{#if initialized}
<div class="json-table-editor" class:is-sub-editor={!isRoot}>
    <div class="toolbar">
        <div class="toolbar-left">
            <span class="title">
                {#if isArrayMode}
                    <TableIcon size={16} /> Lista
                    <span class="type-badge">Arreglo</span>
                {:else}
                    <LayoutList size={16} /> Propiedades
                    <span class="type-badge">Objeto</span>
                {/if}
            </span>
            <button type="button" class="mode-switch-btn" onclick={switchMode} {disabled} title="Cambiar formato base">
                Cambiar Modo
            </button>
        </div>
        <div class="toolbar-actions">
            {#if isArrayMode}
                <Button variant="outline" class="toolbar-btn" onclick={addColumn} {disabled}>
                    <Columns size={14} /> Añadir Columna
                </Button>
                <Button variant="primary" class="toolbar-btn" onclick={addRow} {disabled}>
                    <Plus size={14} /> Añadir Fila
                </Button>
            {:else}
                <Button variant="primary" class="toolbar-btn" onclick={addProperty} {disabled}>
                    <Plus size={14} /> Añadir Propiedad
                </Button>
            {/if}
        </div>
    </div>

    <div class="editor-body">
        {#if isArrayMode}
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            {#each columns() as col}
                                <th>
                                    <div class="col-header">
                                        {col}
                                        <button class="btn-remove-col" onclick={() => removeColumn(col)} title="Eliminar Columna">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </th>
                            {/each}
                            <th class="actions-col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each internalValue as row, rowIdx}
                            <tr>
                                {#each columns() as col}
                                    <td>
                                        {#if isComplex(row[col])}
                                            <button type="button" class="btn-edit-json" onclick={() => openSubEditor(rowIdx, col, row[col])}>
                                                <Edit2 size={12} /> Editar JSON
                                            </button>
                                        {:else}
                                            <div class="cell-input-wrapper">
                                                <input 
                                                    type="text" 
                                                    class="cell-input" 
                                                    bind:value={row[col]} 
                                                    oninput={updateVal}
                                                    {disabled} 
                                                    placeholder="Valor o vacío..."
                                                />
                                                {#if !row[col] && row[col] !== 0 && row[col] !== false}
                                                    <div class="convert-menu">
                                                        <button type="button" onclick={() => transformToComplex(rowIdx, col, false)} title="Convertir a Objeto">{"{}"}</button>
                                                        <button type="button" onclick={() => transformToComplex(rowIdx, col, true)} title="Convertir a Arreglo">{"[]"}</button>
                                                    </div>
                                                {/if}
                                            </div>
                                        {/if}
                                    </td>
                                {/each}
                                <td class="actions-col">
                                    <div class="actions-container">
                                        <button type="button" class="btn-icon edit" onclick={() => openSubEditor(rowIdx, undefined, row)} title="Editar Fila Completa" {disabled}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button type="button" class="btn-icon delete" onclick={() => removeRow(rowIdx)} {disabled} title="Eliminar Fila">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                        {#if internalValue.length === 0}
                            <tr>
                                <td colspan={columns().length + 1} class="empty-state">
                                    Sin elementos configurados. Pulsa "Añadir Fila".
                                </td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        {:else}
            <div class="table-container">
                <table class="object-table">
                    <thead>
                        <tr>
                            <th style="width: 40%">Propiedad (Llave)</th>
                            <th style="width: 50%">Valor</th>
                            <th class="actions-col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each Object.keys(internalValue) as key}
                            <tr>
                                <td>
                                    <input 
                                        type="text" 
                                        class="cell-input key-input" 
                                        value={key} 
                                        onblur={(e) => renameProperty(key, e.currentTarget.value)}
                                        onkeydown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                        {disabled} 
                                    />
                                </td>
                                <td>
                                    {#if isComplex(internalValue[key])}
                                        <button type="button" class="btn-edit-json" onclick={() => openSubEditor(undefined, key, internalValue[key])}>
                                            <Edit2 size={12} /> Editar JSON
                                        </button>
                                    {:else}
                                        <div class="cell-input-wrapper">
                                            <input 
                                                type="text" 
                                                class="cell-input" 
                                                bind:value={internalValue[key]} 
                                                oninput={updateVal}
                                                {disabled} 
                                            />
                                            {#if !internalValue[key] && internalValue[key] !== 0 && internalValue[key] !== false}
                                                <div class="convert-menu">
                                                    <button type="button" onclick={() => transformToComplex(undefined, key, false)} title="Convertir a Objeto">{"{}"}</button>
                                                    <button type="button" onclick={() => transformToComplex(undefined, key, true)} title="Convertir a Arreglo">{"[]"}</button>
                                                </div>
                                            {/if}
                                        </div>
                                    {/if}
                                </td>
                                <td class="actions-col">
                                    <button type="button" class="btn-icon delete" onclick={() => removeProperty(key)} {disabled}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        {/each}
                        {#if Object.keys(internalValue).length === 0}
                            <tr>
                                <td colspan="3" class="empty-state">
                                    Sin propiedades configuradas. Pulsa "Añadir Propiedad".
                                </td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        {/if}
    </div>
    
    {#if !isRoot}
        <div class="sub-editor-actions">
            <Button variant="outline" onclick={() => onClose && onClose(undefined, true)}>
                Cancelar
            </Button>
            <Button variant="primary" onclick={() => onClose && onClose(internalValue, false)}>
                <Check size={16} style="margin-right: 8px;"/> Confirmar y Cerrar
            </Button>
        </div>
    {/if}
</div>

{#if subEditorPath}
    <div class="modal-overlay">
        <div class="modal-container">
            <div class="modal-header">
                <h3>
                    {#if subEditorPath.key !== undefined}
                        Editando: <span class="highlight">{subEditorPath.key}</span>
                    {:else}
                        Editando <span class="highlight">Fila Completa</span>
                    {/if}
                </h3>
            </div>
            <div class="modal-body">
                <svelte:self 
                    value={subEditorValue} 
                    isRoot={false} 
                    onClose={saveSubEditor} 
                />
            </div>
        </div>
    </div>
{/if}

{#if confirmModal.isOpen}
    <div class="modal-overlay">
        <div class="modal-container small-modal">
            <div class="modal-header">
                <h3>Confirmación</h3>
            </div>
            <div class="modal-body confirm-body">
                <p>{confirmModal.message}</p>
                <div class="modal-footer">
                    <Button variant="outline" onclick={() => closeConfirm(false)}>Cancelar</Button>
                    <Button variant="primary" onclick={() => closeConfirm(true)}>Aceptar</Button>
                </div>
            </div>
        </div>
    </div>
{/if}

{#if promptModal.isOpen}
    <div class="modal-overlay">
        <div class="modal-container small-modal">
            <div class="modal-header">
                <h3>Añadir Columna</h3>
            </div>
            <div class="modal-body confirm-body">
                <p>{promptModal.message}</p>
                <input 
                    type="text" 
                    class="cell-input modal-input" 
                    bind:value={promptModal.value} 
                    autofocus
                    onkeydown={(e) => e.key === 'Enter' && closePrompt(true)}
                />
                <div class="modal-footer">
                    <Button variant="outline" onclick={() => closePrompt(false)}>Cancelar</Button>
                    <Button variant="primary" onclick={() => closePrompt(true)}>Aceptar</Button>
                </div>
            </div>
        </div>
    </div>
{/if}

{/if}

<style>
    .json-table-editor {
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-primary);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .is-sub-editor {
        border: none;
        border-radius: 0;
    }

    .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border-color);
    }

    .toolbar-left {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .title {
        font-weight: 600;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--text-main);
    }

    .type-badge {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 9999px;
        color: var(--text-muted);
        margin-left: 4px;
        font-weight: 500;
    }

    .mode-switch-btn {
        background: transparent;
        border: 1px dashed var(--border-color);
        color: var(--text-muted);
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 9999px;
        cursor: pointer;
        transition: all 0.2s;
    }
    .mode-switch-btn:hover {
        background: var(--bg-primary);
        color: var(--text-main);
    }

    :global(.toolbar-btn) {
        padding: 6px 16px !important;
        font-size: 13px !important;
    }

    .toolbar-actions {
        display: flex;
        gap: 8px;
    }

    .table-container {
        width: 100%;
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: 13px;
    }

    th {
        padding: 12px 16px;
        font-weight: 600;
        color: var(--text-muted);
        border-bottom: 1px solid var(--border-color);
        white-space: nowrap;
    }

    .col-header {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .btn-remove-col {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 2px;
        border-radius: 4px;
        display: inline-flex;
        opacity: 0;
        transition: opacity 0.2s, background 0.2s;
    }

    th:hover .btn-remove-col {
        opacity: 1;
    }

    .btn-remove-col:hover {
        background: var(--bg-secondary);
        color: var(--danger-600, #dc2626);
    }

    td {
        padding: 8px 16px;
        border-bottom: 1px solid var(--border-color);
    }

    tr:last-child td {
        border-bottom: none;
    }

    tr:hover td {
        background: rgba(0,0,0,0.01);
    }

    .actions-col {
        width: 80px;
        text-align: center;
    }

    .actions-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
    }

    .cell-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .cell-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid transparent;
        border-radius: 4px;
        font-family: inherit;
        font-size: 13px;
        background: transparent;
        color: var(--text-main);
        transition: all 0.2s;
    }

    .cell-input:focus, .cell-input:hover {
        border-color: var(--border-color);
        background: var(--bg-primary);
        outline: none;
    }

    .key-input {
        font-weight: 600;
        color: var(--accent-purple, #6366f1);
    }

    .convert-menu {
        display: flex;
        gap: 2px;
        opacity: 0;
        transition: opacity 0.2s;
    }

    .cell-input-wrapper:hover .convert-menu {
        opacity: 1;
    }

    .convert-menu button {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        color: var(--text-muted);
        font-size: 10px;
        padding: 2px 4px;
        border-radius: 4px;
        cursor: pointer;
    }
    .convert-menu button:hover {
        background: var(--border-color);
        color: var(--text-main);
    }

    .btn-icon {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 6px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        margin: 0 auto;
    }

    .btn-icon:hover {
        background: var(--bg-secondary);
        color: var(--text-main);
    }

    .btn-icon.delete:hover {
        background: rgba(220, 38, 38, 0.1);
        color: var(--danger-600, #dc2626);
    }

    .btn-icon.edit:hover {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
    }

    .btn-edit-json {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border: 1px solid var(--accent-purple, #6366f1);
        color: var(--accent-purple, #6366f1);
        background: rgba(99, 102, 241, 0.05);
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-edit-json:hover {
        background: rgba(99, 102, 241, 0.1);
    }

    .empty-state {
        text-align: center;
        padding: 24px;
        color: var(--text-muted);
        font-style: italic;
    }

    .sub-editor-actions {
        padding: 16px;
        background: var(--bg-secondary);
        border-top: 1px solid var(--border-color);
        display: flex;
        justify-content: flex-end;
        gap: 12px;
    }

    /* Modal Overlay */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.4);
        backdrop-filter: blur(2px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    }

    .modal-container {
        background: var(--bg-primary);
        width: 90%;
        max-width: 800px;
        max-height: 90vh;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .modal-header {
        padding: 16px 24px;
        border-bottom: 1px solid var(--border-color);
    }

    .modal-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
    }

    .modal-header .highlight {
        color: var(--accent-purple, #6366f1);
    }

    .modal-body {
        padding: 0;
        overflow-y: auto;
    }

    .small-modal {
        max-width: 400px;
    }

    .confirm-body {
        padding: 20px 24px;
    }

    .confirm-body p {
        margin-top: 0;
        margin-bottom: 16px;
        color: var(--text-main);
        font-size: 14px;
        line-height: 1.5;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
    }

    .modal-input {
        border: 1px solid var(--border-color) !important;
        background: var(--bg-primary) !important;
        margin-top: 8px;
    }
</style>
