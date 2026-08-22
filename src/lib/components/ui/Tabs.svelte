<script lang="ts">
    let {
        tabs = [],
        activeTab = $bindable(0)
    }: {
        tabs: string[];
        activeTab: number;
    } = $props();
</script>

<div class="tabs-container">
    <div class="tabs-list">
        {#each tabs as tab, index}
            <button 
                class="tab {activeTab === index ? 'active' : ''}" 
                onclick={() => activeTab = index}
            >
                {tab}
            </button>
        {/each}
    </div>
</div>

<style>
    .tabs-container {
        width: 100%;
        margin-bottom: 24px;
        overflow-x: auto;
        /* Esconder scrollbar */
        scrollbar-width: none;
    }
    .tabs-container::-webkit-scrollbar {
        display: none;
    }

    .tabs-list {
        display: flex;
        gap: 8px;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 8px;
    }

    .tab {
        background: transparent;
        border: none;
        padding: 8px 16px;
        font-family: inherit;
        font-size: 14px;
        font-weight: 500;
        color: var(--text-muted);
        cursor: pointer;
        border-radius: 9999px;
        white-space: nowrap;
        transition: background-color 0.2s, color 0.2s;
    }

    .tab.active {
        background-color: var(--bg-inverted);
        color: white;
    }
</style>

