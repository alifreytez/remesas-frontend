<script lang="ts">
    import { ChevronLeft, ChevronRight } from 'lucide-svelte';

    let {
        currentPage = $bindable(1),
        totalItems = 0,
        itemsPerPage = $bindable(10),
    } = $props<{
        currentPage?: number;
        totalItems: number;
        itemsPerPage?: number;
    }>();

    let totalPages = $derived(Math.max(1, Math.ceil(totalItems / itemsPerPage)));

    function previous() {
        if (currentPage > 1) currentPage--;
    }

    function next() {
        if (currentPage < totalPages) currentPage++;
    }

    function goToPage(page: number | string) {
        if (typeof page === 'number' && page >= 1 && page <= totalPages) {
            currentPage = page;
        }
    }

    // Calcula qué páginas mostrar con puntos suspensivos
    let visiblePages = $derived.by(() => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }
        return pages;
    });

    let startItem = $derived(totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1);
    let endItem = $derived(Math.min(currentPage * itemsPerPage, totalItems));
</script>

<div class="pagination-container">
    <span class="pagination-info">
        Mostrando <strong>{startItem}-{endItem}</strong> de <strong>{totalItems}</strong>
    </span>

    <div class="pagination-actions">
        <select class="selector-select" bind:value={itemsPerPage} onchange={() => currentPage = 1} aria-label="Registros por página">
            {#each [5, 10, 20, 40] as opt}
                <option value={opt}>{opt}</option>
            {/each}
        </select>

        <div class="divider"></div>

        <div class="pagination-controls">
            <button class="page-btn nav-btn" onclick={previous} disabled={currentPage === 1} aria-label="Anterior">
                <ChevronLeft size={16} />
            </button>
            
            {#each visiblePages as page}
                {#if page === '...'}
                    <span class="ellipsis">...</span>
                {:else}
                    <button 
                        class="page-btn {currentPage === page ? 'active' : ''}" 
                        onclick={() => goToPage(page)}
                    >
                        {page}
                    </button>
                {/if}
            {/each}
            
            <button class="page-btn nav-btn" onclick={next} disabled={currentPage === totalPages} aria-label="Siguiente">
                <ChevronRight size={16} />
            </button>
        </div>
    </div>
</div>

<style>
    .pagination-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--gray-200);
        margin-top: 16px;
    }

    .pagination-info {
        font-size: 14px;
        color: var(--gray-500);
    }

    .pagination-info strong {
        color: var(--gray-900);
        font-weight: 600;
    }

    .pagination-actions {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
    }

    .selector-select {
        background-color: var(--white);
        border: 1px solid var(--gray-200);
        border-radius: 8px;
        padding: 6px 8px;
        color: var(--gray-900);
        font-size: 13px;
        font-weight: 500;
        outline: none;
        cursor: pointer;
        font-family: inherit;
    }

    .selector-select:focus {
        border-color: var(--primary-600);
    }

    .divider {
        width: 1px;
        height: 24px;
        background-color: var(--gray-200);
    }

    .pagination-controls {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .page-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--gray-600);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
    }

    .page-btn:hover:not(:disabled):not(.active) {
        background-color: var(--gray-100);
        color: var(--gray-900);
    }

    .page-btn.active {
        background-color: var(--primary-50);
        color: var(--primary-700);
        border-color: var(--primary-200);
        font-weight: 600;
    }

    .page-btn.nav-btn {
        border-color: var(--gray-200);
        color: var(--gray-500);
    }

    .page-btn.nav-btn:hover:not(:disabled) {
        background-color: var(--gray-50);
        border-color: var(--gray-300);
        color: var(--gray-900);
    }

    .page-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .ellipsis {
        color: var(--gray-400);
        padding: 0 4px;
        font-weight: 600;
    }

    @media (max-width: 640px) {
        .pagination-container {
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 16px;
        }
        
        .pagination-actions {
            flex-direction: column;
            justify-content: center;
            gap: 12px;
            width: 100%;
        }

        .divider {
            display: none;
        }

        .pagination-controls {
            flex-wrap: nowrap;
            justify-content: center;
            gap: 2px;
            width: 100%;
        }

        .page-btn {
            min-width: 24px;
            height: 28px;
            font-size: 12px;
            padding: 0;
        }

        .ellipsis {
            padding: 0 2px;
            font-size: 12px;
        }
    }
</style>
