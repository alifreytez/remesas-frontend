<script lang="ts">
    import { goto } from '$app/navigation';
    import { ArrowRight, User } from 'lucide-svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import Select from '$lib/components/ui/Select.svelte';
    import { countriesMethods, methodsConfig } from '$lib/data/methodsConfig';
    
    let { contacts, recipientData = $bindable(), nextStep }: {
        contacts: any[];
        recipientData: any;
        nextStep: () => void;
    } = $props();

    let countriesList = [
        { id: '1', name: 'Venezuela' },
        { id: '2', name: 'Colombia' },
        { id: '3', name: 'Perú' },
        { id: '4', name: 'Chile' }
    ];

    let searchQuery = $state('');
    let searchResults = $derived(
        searchQuery 
            ? contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.document.includes(searchQuery))
            : []
    );

    let selectedContact = $state<any>(null);
    let selectedBankId = $state<string>('');

    let availableMethods = $derived(
        recipientData.country && countriesMethods[recipientData.country] 
            ? countriesMethods[recipientData.country] 
            : []
    );

    let currentMethodConfig = $derived(
        recipientData.method && methodsConfig[recipientData.method]
            ? methodsConfig[recipientData.method]
            : null
    );

    // Auto-select first method when country changes or methods become available
    $effect.pre(() => {
        if (availableMethods.length > 0 && !availableMethods.includes(recipientData.method)) {
            recipientData.method = availableMethods[0];
        }
        
        if (currentMethodConfig) {
            currentMethodConfig.fields.forEach(field => {
                if (recipientData[field.name] === undefined) {
                    recipientData[field.name] = '';
                }
            });
        }
    });

    // When a contact is selected from search
    function loadContact(contact: any) {
        selectedContact = contact;
        searchQuery = '';
        
        // Auto-fill personal data
        const parts = contact.name.split(' ');
        recipientData.firstName = parts[0] || '';
        recipientData.lastName = parts.slice(1).join(' ') || '';
        recipientData.document = contact.document;
        // Make sure country matches ID for select binding
        recipientData.country = contact.countryId || contact.country || '1'; 

        // Auto-select first bank if available
        if (contact.bankDetails && contact.bankDetails.length > 0) {
            selectedBankId = contact.bankDetails[0].id;
            loadBankDetails(contact.bankDetails[0]);
        } else {
            selectedBankId = 'new';
        }
    }

    function loadBankDetails(bank: any) {
        if (!bank) return;
        recipientData.method = bank.method;
        
        // Copy all dynamic fields from bank to recipientData
        if (methodsConfig[bank.method]) {
            const config = methodsConfig[bank.method];
            for (const field of config.fields) {
                recipientData[field.name] = bank[field.name] || '';
            }
        }
    }

    $effect(() => {
        if (selectedBankId && selectedBankId !== 'new' && selectedContact) {
            const bank = selectedContact.bankDetails.find((b: any) => b.id === selectedBankId);
            if (bank) loadBankDetails(bank);
        } else if (selectedBankId === 'new') {
            // Clear dynamic fields when 'new' is selected
            if (currentMethodConfig) {
                for (const field of currentMethodConfig.fields) {
                    recipientData[field.name] = '';
                }
            }
        }
    });

    let isValid = $derived.by(() => {
        if (!recipientData.firstName || !recipientData.document || !recipientData.country || !recipientData.method) return false;
        if (!currentMethodConfig) return false;
        
        // Check all required dynamic fields
        for (const field of currentMethodConfig.fields) {
            if (field.required && !recipientData[field.name]) {
                return false;
            }
        }
        return true;
    });
</script>

<div class="step-content">
    <h2 class="step-title">Datos del Destinatario</h2>
    <p class="step-desc">Ingresa los datos bancarios del destino. Si es un contacto frecuente, búscalo en tu agenda.</p>

    <!-- Buscador -->
    <div class="search-container">
        <Input 
            label="Buscar contacto en agenda (Opcional)" 
            bind:value={searchQuery}
        />
        {#if searchResults.length > 0}
            <div class="search-results">
                {#each searchResults as contact}
                    <button class="search-item" onclick={() => loadContact(contact)}>
                        <div class="avatar"><User size={16} /></div>
                        <div>
                            <strong>{contact.name}</strong>
                            <span>{contact.document}</span>
                        </div>
                    </button>
                {/each}
            </div>
        {/if}
    </div>

    <!-- Cuentas Previas (Si se cargó contacto) -->
    {#if selectedContact && selectedContact.bankDetails.length > 0}
        <div class="saved-banks">
            <Select
                label="Cuentas Guardadas del Contacto"
                bind:value={selectedBankId}
                options={[
                    ...selectedContact.bankDetails.map((b: any) => ({
                        value: b.id,
                        label: `${b.bank || methodsConfig[b.method]?.name} - ${methodsConfig[b.method]?.name}`
                    })),
                    { value: 'new', label: '+ Ingresar otra cuenta manualmente' }
                ]}
            />
        </div>
    {/if}

    <div class="manual-form">
        <div class="form-row">
            <Input label="Nombre(s)" bind:value={recipientData.firstName} required />
            <Input label="Apellido(s)" bind:value={recipientData.lastName} required />
        </div>
        <div class="form-row">
            <Input label="Documento de Identidad" bind:value={recipientData.document} required />
            <Select 
                label="País de Residencia" 
                options={countriesList.map(c => ({ value: c.id, label: c.name }))}
                bind:value={recipientData.country} 
                required 
            />
        </div>

        {#if availableMethods.length > 0}
            <h3 class="subsection-title">Datos Bancarios</h3>
            <div class="form-row">
                <Select 
                    label="Método de Recepción" 
                    options={availableMethods.map(m => ({ value: m, label: methodsConfig[m].name }))}
                    bind:value={recipientData.method}
                />
            </div>

            {#if currentMethodConfig}
                <!-- Dynamic Fields Render -->
                <div class="dynamic-fields">
                    {#each currentMethodConfig.fields as field}
                        <div class="form-field-wrapper">
                            <Input 
                                label={field.label} 
                                type={field.type}
                                bind:value={recipientData[field.name]} 
                                required={field.required} 
                            />
                        </div>
                    {/each}
                </div>
            {/if}
        {:else if recipientData.country}
            <div class="no-methods-alert">
                <p>No hay métodos de pago disponibles para este país actualmente.</p>
            </div>
        {/if}
        
        <div class="checkbox-container">
            <label class="checkbox-label">
                <input type="checkbox" bind:checked={recipientData.saveAsContact} />
                <span class="checkbox-text">Guardar en mi agenda de contactos</span>
            </label>
        </div>
    </div>

    <div class="actions">
        <Button variant="primary" disabled={!isValid} onclick={nextStep}>
            Continuar <ArrowRight size={16} />
        </Button>
    </div>
</div>

<style>
    .step-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .step-title {
        font-size: 20px;
        font-weight: 700;
        color: var(--gray-900);
        margin: 0;
    }

    .step-desc {
        color: var(--gray-500);
        margin: 0;
        font-size: 14px;
    }

    .search-container {
        position: relative;
        z-index: 10;
    }

    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--white);
        border: 1px solid var(--gray-200);
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        margin-top: 4px;
        max-height: 200px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    }

    .search-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border: none;
        background: transparent;
        cursor: pointer;
        text-align: left;
        border-bottom: 1px solid var(--gray-100);
    }

    .search-item:hover {
        background-color: var(--gray-50);
    }

    .search-item:last-child {
        border-bottom: none;
    }

    .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: var(--primary-600);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .search-item strong {
        display: block;
        color: var(--gray-900);
        font-size: 14px;
    }

    .search-item span {
        color: var(--gray-500);
        font-size: 12px;
    }

    .saved-banks {
        background-color: var(--gray-50);
        padding: 16px;
        border-radius: 8px;
        border: 1px solid var(--gray-200);
    }

    .manual-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
        border-top: 1px solid var(--gray-200);
        padding-top: 24px;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .dynamic-fields {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
    }

    @container section (min-width: 600px) {
        .form-row, .dynamic-fields {
            grid-template-columns: 1fr 1fr;
        }
    }

    .no-methods-alert {
        padding: 16px;
        background-color: #fef2f2;
        color: #ef4444;
        border-radius: 8px;
        border: 1px solid #fecaca;
        font-size: 14px;
    }

    .subsection-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--gray-900);
        margin: 16px 0 0 0;
    }

    .checkbox-container {
        margin-top: 16px;
        padding: 16px;
        background-color: var(--gray-50);
        border-radius: 8px;
        border: 1px solid var(--gray-200);
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: var(--primary-600);
        cursor: pointer;
    }

    .checkbox-text {
        font-size: 14px;
        font-weight: 500;
        color: var(--gray-700);
    }

    .actions {
        margin-top: 16px;
        display: flex;
        justify-content: flex-end;
    }
</style>
