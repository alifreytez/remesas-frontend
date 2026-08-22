<script lang="ts">
    import TransactionCard from './TransactionCard.svelte';
    import Pagination from './Pagination.svelte';
    import Grid from './Grid.svelte';

    let { data = [], itemsPerPage = $bindable(5) } = $props<{
        data: any[];
        itemsPerPage?: number;
    }>();

    let currentPage = $state(1);

    $effect(() => {
        data;
        currentPage = 1;
    });

    let paginatedData = $derived(
        data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    );
</script>

<div class="transaction-grid-wrapper">
    <Grid cols={1} colsMd={1} colsSm="repeat(auto-fit, minmax(225px, 1fr))" gap="20px">
        {#each paginatedData as item}
            <TransactionCard 
                id={item.id}
                realId={item.realId}
                date={item.date}
                destination={item.destination}
                amountPaid={`USD ${item.amountSend}`}
                amountReceived={`${item.currency} ${item.amountReceive}`}
                status={item.status}
            />
        {/each}
    </Grid>

    <div class="pagination-container">
        <Pagination 
            bind:currentPage 
            totalItems={data.length} 
            bind:itemsPerPage={itemsPerPage} 
        />
    </div>
</div>

<style>
    .transaction-grid-wrapper {
        display: flex;
        flex-direction: column;
        gap: 24px;
        width: 100%;
    }
</style>


