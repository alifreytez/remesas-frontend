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

    let loading = $state(false);
    let contacts = $state<any[]>([]);
    let searchQuery = $state('');

    // Pagination
    let currentPage = $state(1);
    const itemsPerPage = 6;

    // Mock data initially if no API yet
    onMount(async () => {
        try {
            loading = true;
            // TODO: Fetch from actual contacts API
            // const res = await api.get('/api/v1/contacts');
            // contacts = res.data?.data || [];
            
            // Mock Data
            setTimeout(() => {
                contacts = [
                    { id: 1, firstName: 'Juan', lastName: 'Pérez', documentNumber: 'V-12345678', phone: '+584121234567', _Country: { name: 'Venezuela' } },
                    { id: 2, firstName: 'Maria', lastName: 'Gomez', documentNumber: 'V-87654321', phone: '+584241112233', _Country: { name: 'Colombia' } },
                    { id: 3, firstName: 'Carlos', lastName: 'Ramirez', documentNumber: 'V-22334455', phone: '+584145556677', _Country: { name: 'Peru' } },
                    { id: 4, firstName: 'Ana', lastName: 'Torres', documentNumber: 'V-99887766', phone: '+584249998877', _Country: { name: 'Chile' } }
                ];
                loading = false;
            }, 500);
        } catch (error) {
            console.error(error);
            loading = false;
        }
    });

    let filteredContacts = $derived(
        contacts.filter(c => 
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.documentNumber.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    let totalPages = $derived(Math.max(1, Math.ceil(filteredContacts.length / itemsPerPage)));
    let paginatedContacts = $derived(
        filteredContacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    );

    // Reset page when searching
    $effect(() => {
        if (searchQuery) {
            currentPage = 1;
        }
    });
</script>

<div class="agenda-page">
    <Section class="full-width">
        <SectionTitle 
            title="Directorio de Contactos" 
            subtitle="Administra tus beneficiarios frecuentes"
        >
            {#snippet action()}
                <Button variant="primary" onclick={() => goto('/client/agenda/new')}>
                    <Plus size={18} /> Nuevo Contacto
                </Button>
            {/snippet}
        </SectionTitle>

        <div class="filters-section">
            <div class="search-bar">
                <Input 
                    placeholder="Buscar por nombre o documento..." 
                    bind:value={searchQuery}
                />
            </div>
        </div>

        {#if loading}
            <p class="loading-text">Cargando contactos...</p>
        {:else if filteredContacts.length === 0}
            <div class="empty-state">
                <User size={48} color="var(--gray-300)" />
                <h3>No tienes contactos guardados</h3>
                <p>Agrega un beneficiario para agilizar tus futuros envíos.</p>
            </div>
        {:else}
            <div class="contacts-grid">
                {#each paginatedContacts as contact}
                    <ContactCard 
                        id={contact.id}
                        firstName={contact.firstName}
                        lastName={contact.lastName}
                        country={contact._Country?.name}
                        phone={contact.phone}
                    />
                {/each}
            </div>

            <!-- Pagination Container (matching History layout) -->
            <div class="pagination-container">
                <Pagination 
                    bind:currentPage={currentPage}
                    {totalPages}
                />
            </div>
        {/if}
    </Section>
</div>

<style>
    .agenda-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .filters-section {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--gray-200);
        margin-bottom: 16px;
    }

    .filters-section :global(.input-group) {
        margin-bottom: 0 !important;
    }

    .search-bar {
        max-width: 400px;
        width: 100%;
    }

    .contacts-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
    }

    /* Container Queries para un responsive perfecto interno */
    @container section (max-width: 900px) {
        .contacts-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @container section (max-width: 500px) {
        .contacts-grid {
            grid-template-columns: 1fr;
        }
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px 24px;
        text-align: center;
        background-color: var(--gray-50);
        border-radius: 16px;
        border: 1px dashed var(--gray-300);
        gap: 12px;
    }

    .empty-state h3 {
        font-size: 18px;
        color: var(--gray-900);
        font-weight: 600;
    }

    .empty-state p {
        color: var(--gray-500);
        font-size: 14px;
        max-width: 300px;
    }

    .loading-text {
        color: var(--gray-500);
        text-align: center;
        padding: 48px;
    }
</style>
