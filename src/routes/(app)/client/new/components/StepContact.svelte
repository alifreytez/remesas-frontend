<script lang="ts">
    import { goto } from '$app/navigation';
    import { ArrowRight, Info, XCircle } from 'lucide-svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import Select from '$lib/components/ui/Select.svelte';
    import SectionAccordion from '$lib/components/ui/SectionAccordion.svelte';
    import Grid from '$lib/components/ui/Grid.svelte';
    import Stack from '$lib/components/ui/Stack.svelte';
    import HintText from '$lib/components/ui/HintText.svelte';
    
    let { 
        contacts,
        paymentMethods,
        countries,
        recipientData = $bindable(), 
        nextStep 
    }: {
        contacts: any[];
        paymentMethods: any[];
        countries: any[];
        recipientData: any;
        nextStep: () => void;
    } = $props();

    let activeTab = $state<'directory' | 'new'>('directory');
    let selectedContactId = $state<string>('');
    let selectedBankId = $state<string>('');

    let currentMethodConfig = $derived(
        recipientData.method
            ? paymentMethods.find(m => m.type_code === recipientData.method) || null
            : null
    );

    $effect.pre(() => {
        const available = paymentMethods.map(m => m.type_code);
        if (available.length > 0 && !available.includes(recipientData.method)) {
            recipientData.method = available[0];
        }
        
        if (currentMethodConfig) {
            currentMethodConfig.fields_config.forEach((field: any) => {
                if (recipientData[field.name] === undefined) {
                    recipientData[field.name] = '';
                }
            });
        }
        
        if (recipientData.concept === undefined) {
            recipientData.concept = '';
        }
    });

    let selectedContact = $derived(
        contacts.find(c => c.id === selectedContactId) || null
    );

    $effect(() => {
        if (activeTab === 'directory' && selectedContact) {
            const parts = selectedContact.name.split(' ');
            recipientData.firstName = parts[0] || '';
            recipientData.lastName = parts.slice(1).join(' ') || '';
            recipientData.country = selectedContact.countryId || selectedContact.country || '1'; 
            recipientData.isNew = false;
        } else if (activeTab === 'new') {
            recipientData.isNew = true;
            recipientData.saveAsContact = true; // Default behavior
        }
    });

    // Auto-select first bank when contact is chosen
    $effect(() => {
        if (activeTab === 'directory' && selectedContact && selectedContact.bankDetails?.length > 0) {
            if (!selectedBankId || !selectedContact.bankDetails.find((b: any) => b.id === selectedBankId)) {
                selectedBankId = selectedContact.bankDetails[0].id;
            }
        }
    });

    $effect(() => {
        if (activeTab === 'directory' && selectedBankId && selectedContact) {
            const bank = selectedContact.bankDetails.find((b: any) => b.id === selectedBankId);
            if (bank) {
                recipientData.method = bank.method;
                const config = paymentMethods.find(m => m.type_code === bank.method);
                if (config) {
                    for (const field of config.fields_config) {
                        recipientData[field.name] = bank[field.name] || '';
                    }
                }
            }
        }
    });

    let isValid = $derived.by(() => {
        if (activeTab === 'directory') {
            return !!selectedContactId && !!selectedBankId;
        } else {
            if (!recipientData.firstName || !recipientData.country || !recipientData.method) return false;
            if (!currentMethodConfig) return false;
            
            for (const field of currentMethodConfig.fields_config) {
                if (field.required && !recipientData[field.name]) {
                    return false;
                }
            }
            return true;
        }
    });
    function formatBankDetails(b: any) {
        const parts = [];
        const config = paymentMethods.find(m => m.type_code === b.method);
        if (config?.name) parts.push(config.name);
        if (b.bank) parts.push(b.bank);
        if (b.phone) parts.push(b.phone);
        if (b.accountNumber) parts.push(`Cta: ${b.accountNumber}`);
        if (b.document) parts.push(`Doc: ${b.document}`);
        if (b.email) parts.push(b.email);
        
        return parts.join(' • ') || 'Cuenta sin detalles';
    }
</script>

<div class="step-content">
    <div class="tabs-container">
        <button 
            type="button" 
            class="tab-btn {activeTab === 'directory' ? 'active' : ''}" 
            onclick={() => { activeTab = 'directory'; selectedContactId = ''; selectedBankId = ''; }}
        >
            Desde Directorio
        </button>
        <button 
            type="button" 
            class="tab-btn {activeTab === 'new' ? 'active' : ''}" 
            onclick={() => activeTab = 'new'}
        >
            Sin Registrar
        </button>
    </div>

    {#if activeTab === 'directory'}
        <Grid cols={1}>
            <Select
                label="Beneficiario"
                bind:value={selectedContactId}
                options={[
                    { value: '', label: '-- Seleccione --' },
                    ...contacts.map(c => ({ value: c.id, label: c.name }))
                ]}
            />

            {#if selectedContact && selectedContact.bankDetails?.length > 0}
                <Select
                    label="Cuenta de Recepción"
                    bind:value={selectedBankId}
                    options={selectedContact.bankDetails.map((b: any) => ({
                        value: b.id,
                        label: formatBankDetails(b)
                    }))}
                />
            {:else if selectedContact}
                <HintText text="Este contacto no tiene cuentas bancarias guardadas." />
            {/if}

            <Input label="Concepto (Opcional)" placeholder="Ej. Remesa mensual" bind:value={recipientData.concept} />
        </Grid>
    {:else}
        <Stack gap="var(--spacing-8)">
            <SectionAccordion title="Datos Personales">
                <Grid cols={2} colsSm={1}>
                    <Input label="Nombre(s)" type="text" format="name" placeholder="Ej. Juan Carlos" bind:value={recipientData.firstName} required />
                    <Input label="Apellido(s)" type="text" format="name" placeholder="Ej. Pérez Gómez" bind:value={recipientData.lastName} required />
                </Grid>
                
                <Grid cols={2} colsSm={1}>
                    <Select 
                        label="País de Residencia" 
                        placeholder="Selecciona una opción"
                        options={countries.map(c => ({ value: c.id, label: c.name }))}
                        bind:value={recipientData.country} 
                        required 
                    />
                    <Input label="Correo Electrónico (Opcional)" type="email" format="email" placeholder="Ej. juan.perez@email.com" bind:value={recipientData.email} />
                </Grid>
            </SectionAccordion>

            <SectionAccordion title="Datos Bancarios">
                {#if paymentMethods.length > 0}
                    <Grid cols={1}>
                        <Select 
                            label="Método de Pago" 
                            placeholder="Selecciona un método"
                            options={paymentMethods.map(m => ({ value: m.type_code, label: m.name }))}
                            bind:value={recipientData.method}
                        />
                    </Grid>

                    {#if currentMethodConfig}
                        <Grid cols={2}>
                            {#each currentMethodConfig.fields_config as field}
                                <div class="form-field-wrapper">
                                    <Input 
                                        label={field.label} 
                                        type={field.type}
                                        placeholder={field.placeholder || ''}
                                        bind:value={recipientData[field.name]} 
                                        required={field.required} 
                                    />
                                </div>
                            {/each}
                        </Grid>
                    {/if}
                {:else}
                    <HintText text="No hay métodos de pago disponibles actualmente." />
                {/if}
            </SectionAccordion>

            <SectionAccordion title="Detalles de Envío">
                <Grid cols={1}>
                    <Input label="Concepto (Opcional)" bind:value={recipientData.concept} />
                </Grid>
            </SectionAccordion>
        </Stack>
    {/if}

    <div class="actions">
        <Button variant="primary" disabled={!isValid} onclick={nextStep}>
            Continuar
        </Button>
    </div>
</div>

<style>
    .step-content {
        display: flex;
        flex-direction: column;
    }

    .tabs-container {
        display: flex;
        width: 100%;
        background-color: var(--white);
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-lg);
        overflow: hidden;
        margin-bottom: var(--spacing-8);
    }

    .tab-btn {
        flex: 1;
        padding: var(--spacing-3) var(--spacing-4);
        background: transparent;
        border: none;
        color: var(--gray-500);
        font-weight: 600;
        font-size: var(--text-sm);
        cursor: pointer;
        transition: all var(--transition-fast);
    }

    .tab-btn.active {
        background-color: var(--gray-900);
        color: var(--white);
    }

    /* Removed local layout CSS classes (.form-container, .form-row, .dynamic-fields, .single-col, .empty-state-note, .no-methods-alert) */

    .actions {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        gap: var(--spacing-4);
        margin-top: var(--spacing-8);
        width: 100%;
        border-top: 1px solid var(--gray-200);
        padding-top: var(--spacing-6);
    }
</style>

