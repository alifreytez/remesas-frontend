<script lang="ts">
    import { onMount } from 'svelte';
    import Section from '$lib/components/layout/Section.svelte';
    import SectionTitle from '$lib/components/layout/SectionTitle.svelte';
    import ContactCard from '$lib/components/ui/ContactCard.svelte';
    import Pagination from '$lib/components/ui/Pagination.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import { Plus, User } from 'lucide-svelte';
    import { api } from '$lib/utils/api';
    import { goto } from '$app/navigation';
    import Input from '$lib/components/ui/Input.svelte';
    import { setHeader } from '$lib/stores/header.svelte';

    let loading = $state(false);
    let contacts = $state<any[]>([]);
    let searchQuery = $state('');

    // Pagination
    let currentPage = $state(1);
    let itemsPerPage = $state(6);
    let totalItems = $state(0);

    $effect(() => {
        setHeader('Directorio de Destinatarios', false, '', null);
        return () => setHeader('', false, '', null);
    });

    async function fetchContacts() {
        try {
            loading = true;
            const res = await api.get<{data: {rows: any[], count: number}}>(`/users/me/contacts?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`);
            
            // Adjusting to different possible response structures
            if (res.data && res.data.rows) {
                contacts = res.data.rows;
                totalItems = res.data.count || 0;
            } else if (Array.isArray(res.data)) {
                contacts = res.data;
                totalItems = contacts.length;
            } else if (Array.isArray(res)) {
                contacts = res as any[];
                totalItems = contacts.length;
            } else {
                contacts = [];
                totalItems = 0;
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            contacts = [];
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchContacts();
    });

    let debounceTimer: ReturnType<typeof setTimeout>;
    function handleSearch() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentPage = 1;
            fetchContacts();
        }, 500);
    }

    function handlePageChange(newPage: number) {
        currentPage = newPage;
        fetchContacts();
    }

    let filteredContacts = $derived(contacts);

</script>

<div class="agenda-page">
    <Section>
        <SectionTitle title="Mis Contactos" subtitle="Gestiona a las personas a las que envías dinero">
            {#snippet action()}
                {#if totalItems > 0 || searchQuery !== ''}
                    <Button variant="primary" onclick={() => goto('/client/agenda/new')}>
                        <Plus size={16} style="margin-right: 8px;" />
                        Nuevo Contacto
                    </Button>
                {/if}
            {/snippet}
        </SectionTitle>

        <div class="agenda-toolbar">
            <div class="search-wrapper">
                <Input 
                    type="text" 
                    placeholder="Buscar por nombre..." 
                    id="searchContact"
                    bind:value={searchQuery}
                    oninput={handleSearch}
                />
            </div>
        </div>

        {#if loading && contacts.length === 0}
            <div class="loading-state">
                <p>Cargando tus contactos...</p>
            </div>
        {:else if filteredContacts.length > 0}
            <div class="contacts-grid">
                {#each filteredContacts as contact}
                    <ContactCard
                        id={contact.id}
                        name={`${contact.firstName || contact.first_name || ''} ${contact.lastName || contact.last_name || ''}`.trim()}
                        country={contact._Country?.name || 'Desconocido'}
                        onClick={() => goto(`/client/agenda/${contact.id}`)}
                    />
                {/each}
            </div>

            <div class="pagination-wrapper">
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalItems / itemsPerPage) || 1}
                    onPageChange={handlePageChange}
                />
            </div>
        {:else}
            <div class="empty-state">
                <User size={48} color="var(--gray-300)" />
                <h3>No tienes contactos guardados</h3>
                <p>Agrega a tus familiares y amigos para enviarles dinero fácilmente.</p>
                <Button variant="primary" onclick={() => goto('/client/agenda/new')} style="margin-top: 16px;">
                    <Plus size={16} style="margin-right: 8px;" />
                    Agregar el primero
                </Button>
            </div>
        {/if}
    </Section>
</div>

<style>
    .agenda-page {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-6);
        
        width: 100%;
    }

    .agenda-toolbar {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: var(--spacing-4);
        margin-bottom: var(--spacing-6);
    }

    .search-wrapper {
        width: 320px;
        max-width: 100%;
    }

    .contacts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: var(--spacing-4);
        margin-bottom: var(--spacing-8);
    }

    .pagination-wrapper {
        display: flex;
        justify-content: center;
        margin-top: var(--spacing-6);
    }

    .loading-state, .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 64px 24px;
        text-align: center;
        background-color: var(--white);
        border: 1px dashed var(--gray-300);
        border-radius: var(--radius-xl);
        gap: 8px;
    }

    .empty-state h3 {
        font-size: 18px;
        font-weight: 600;
        color: var(--gray-900);
        margin: 0;
    }

    .empty-state p {
        font-size: 14px;
        color: var(--gray-500);
        margin: 0;
    }
</style>
