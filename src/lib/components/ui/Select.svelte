<script lang="ts">
    import { ChevronDown, Search, Check } from 'lucide-svelte';
    import { onMount, onDestroy, tick } from 'svelte';

    let {
        label = '',
        options = [],
        value = $bindable(''),
        disabled = false,
        placeholder = 'Selecciona una opción'
    }: {
        label?: string;
        options: { value: string; label: string }[];
        value?: string;
        disabled?: boolean;
        placeholder?: string;
    } = $props();

    let open = $state(false);
    let dropUp = $state(false);
    let searchQuery = $state('');
    let dropdownRef: HTMLDivElement;

    let filteredOptions = $derived(
        options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    let selectedLabel = $derived(
        options.find(opt => opt.value === value)?.label || placeholder
    );

    async function toggle() {
        if (!disabled) {
            open = !open;
            if (open) {
                // Calcular espacio disponible
                if (dropdownRef) {
                    const rect = dropdownRef.getBoundingClientRect();
                    const spaceBelow = window.innerHeight - rect.bottom;
                    const spaceAbove = rect.top;
                    // Si el espacio abajo es menor a 300px (aprox dropdown) y hay más espacio arriba
                    dropUp = spaceBelow < 300 && spaceAbove > spaceBelow;
                }

                searchQuery = '';
                await tick();
                const selectedEl = dropdownRef?.querySelector('.option.selected');
                if (selectedEl) {
                    selectedEl.scrollIntoView({ block: 'nearest' });
                }
            }
        }
    }

    function selectOption(val: string) {
        value = val;
        open = false;
    }

    function handleClickOutside(event: MouseEvent) {
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
            open = false;
        }
    }

    onMount(() => {
        document.addEventListener('click', handleClickOutside);
    });

    onDestroy(() => {
        if (typeof document !== 'undefined') {
            document.removeEventListener('click', handleClickOutside);
        }
    });
</script>

<div class="select-container" bind:this={dropdownRef}>
    {#if label}
        <label>{label}</label>
    {/if}
    
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        class="select-trigger {open ? 'open' : ''} {disabled ? 'disabled' : ''}" 
        onclick={toggle}
    >
        <span class="value {value === '' ? 'placeholder' : ''}">{selectedLabel}</span>
        <div class="caret">
            <ChevronDown size={16} />
        </div>
    </div>

    {#if open}
        <div class="dropdown-menu {dropUp ? 'drop-up' : ''}">
            <div class="search-box">
                <Search size={14} color="var(--text-muted)" class="search-icon" />
                <input 
                    type="text" 
                    placeholder="Buscar opción..." 
                    bind:value={searchQuery} 
                    onclick={(e) => e.stopPropagation()}
                    autofocus
                />
            </div>
            
            <div class="options-list">
                {#if filteredOptions.length === 0}
                    <div class="no-results">No se encontraron resultados</div>
                {/if}
                
                {#each filteredOptions as option}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div 
                        class="option {option.value === value ? 'selected' : ''}" 
                        onclick={() => selectOption(option.value)}
                    >
                        <span>{option.label}</span>
                        {#if option.value === value}
                            <Check size={14} color="var(--accent-purple)" />
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    .select-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        margin-bottom: var(--select-mb, 16px);
        position: relative;
    }

    label {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-main);
    }

    .select-trigger {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--select-bg, var(--bg-secondary));
        border: 1px solid var(--border-color);
        border-radius: var(--select-radius, 12px);
        padding: var(--select-padding, 14px 16px);
        font-size: var(--select-font-size, 14px);
        color: var(--text-main);
        cursor: pointer;
        transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;
        user-select: none;
    }

    .select-trigger:hover:not(.disabled) {
        border-color: var(--text-muted);
    }

    .select-trigger.open {
        border-color: var(--accent-purple);
        background-color: var(--bg-primary);
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }

    .select-trigger.disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .value {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .value.placeholder {
        color: var(--text-muted);
    }

    .caret {
        display: flex;
        align-items: center;
        color: var(--text-muted);
        transition: transform 0.2s;
    }

    .select-trigger.open .caret {
        transform: rotate(180deg);
        color: var(--accent-purple);
    }

    .dropdown-menu {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        width: 100%;
        background-color: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 50;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        transform-origin: top center;
    }

    .dropdown-menu.drop-up {
        top: auto;
        bottom: calc(100% + 8px);
        animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        transform-origin: bottom center;
        box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.1);
    }

    @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .search-box {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--border-color);
        background-color: var(--bg-secondary);
        position: relative;
    }
    
    .search-icon {
        position: absolute;
        left: 16px;
    }

    .search-box input {
        width: 100%;
        border: none;
        background: transparent;
        font-family: inherit;
        font-size: 14px;
        color: var(--text-main);
        outline: none;
        padding-left: 28px; /* space for icon */
    }

    .search-box input::placeholder {
        color: var(--text-muted);
    }

    .options-list {
        max-height: 250px;
        overflow-y: auto;
        padding: 0;
    }

    .option {
        padding: 12px 16px;
        font-size: 14px;
        color: var(--text-main);
        cursor: pointer;
        transition: background-color 0.2s, color 0.2s;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .option:hover {
        background-color: var(--bg-secondary);
        color: var(--accent-purple);
    }

    .option.selected {
        background-color: #f3e8ff; /* Light purple */
        color: var(--accent-purple);
        font-weight: 600;
    }

    .no-results {
        padding: 16px;
        text-align: center;
        font-size: 13px;
        color: var(--text-muted);
    }

    /* Custom Scrollbar for dropdown */
    .options-list::-webkit-scrollbar {
        width: 6px;
    }
    .options-list::-webkit-scrollbar-track {
        background: transparent;
    }
    .options-list::-webkit-scrollbar-thumb {
        background-color: #cbd5e1;
        border-radius: 10px;
    }
</style>
