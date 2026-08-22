<script lang="ts">
    import ContactCard from './ContactCard.svelte';
    import Pagination from './Pagination.svelte';
    import Grid from './Grid.svelte';

    let { data = [], itemsPerPage = $bindable(6) } = $props<{
        data: any[];
        itemsPerPage?: number;
    }>();

    let currentPage = $state(1);

    // Si la data cambia o se filtra desde afuera, volvemos a la pág 1
    $effect(() => {
        data;
        currentPage = 1;
    });

    let paginatedData = $derived(
        data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    );
</script>

<div class="contact-grid-wrapper">
    <Grid cols={3} colsMd={2} colsSm={1} gap="16px">
        {#each paginatedData as contact}
            <ContactCard 
                id={contact.id}
                firstName={contact.firstName}
                lastName={contact.lastName}
                country={contact._Country?.name || contact.country}
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
    .contact-grid-wrapper {
        display: flex;
        flex-direction: column;
        gap: 24px;
        width: 100%;
    }
</style>


