<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import Button from '$lib/components/ui/Button.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import Select from '$lib/components/ui/Select.svelte';
    import Grid from '$lib/components/ui/Grid.svelte';
    import Section from '$lib/components/layout/Section.svelte';
    import SectionTitle from '$lib/components/layout/SectionTitle.svelte';
    import { Save, AlertCircle, ShieldCheck, Info, Plus, Trash2, CreditCard, Smartphone } from 'lucide-svelte';
    import { setHeader } from '$lib/stores/header.svelte';
    import { api } from '$lib/utils/api';
    import { confirm, alertMsg } from '$lib/stores/confirm.svelte';
    
    let paymentMethods = $state<any[]>([]);
    let countries = $state<any[]>([]);
    let banks = $state<any[]>([]);

    let contactId = $derived(page.params.id);
    let isNew = $derived(contactId === 'new');

    let loading = $state(true);
    let saving = $state(false);

    $effect(() => {
        setHeader(
            isNew ? 'Nuevo Contacto' : 'Editar Contacto',
            true, 
            '/client/agenda' 
        );

        return () => {
            setHeader('', false, '', null);
        };
    });

    let formData = $state({
        firstName: '',
        lastName: '',
        email: '',
        country: '',
        bankDetails: [] as any[]
    });

    let newBankDetail = $state<Record<string, any>>({
        method: ''
    });

    let showAddBankForm = $state(false);
    
    let availableMethods = $derived(paymentMethods.map(m => m.type_code));

    let currentMethodConfig = $derived(
        newBankDetail.method 
            ? paymentMethods.find(m => m.type_code === newBankDetail.method) || null
            : null
    );

    $effect(() => {
        if (!showAddBankForm) {
            newBankDetail = { method: availableMethods[0] || '' };
        }
        
        if (currentMethodConfig) {
            currentMethodConfig.fields_config?.forEach((field: any) => {
                if (newBankDetail[field.name] === undefined) {
                    newBankDetail[field.name] = '';
                }
            });
        }
    });

    onMount(async () => {
        try {
            loading = true;
            // Fetch Catalogs
            const optionsRes = await api.get<{data: any}>('/remittances/options');
            countries = optionsRes.data.countries || [];
            paymentMethods = optionsRes.data.paymentMethods || [];

            if (!isNew) {
                // Fetch contact details
                const contactRes = await api.get<{data: any}>(`/users/me/contacts/${contactId}`);
                const contact = contactRes.data;
                if (contact) {
                    formData = {
                        firstName: contact.firstName || '',
                        lastName: contact.lastName || '',
                        email: contact.email || '',
                        country: contact.country || '',
                        bankDetails: contact.contact_data?.bankDetails || []
                    };
                }
            }
        } catch (error: any) {
            console.error('Error fetching data:', error);
            alertMsg('Error', error.message || 'No se pudo cargar la informaci\u00f3n', 'error');
            goto('/client/agenda');
        } finally {
            loading = false;
        }
    });

    async function addBankDetail() {
        // Validate required fields
        if (currentMethodConfig && currentMethodConfig.fields_config) {
            for (const field of currentMethodConfig.fields_config) {
                if (field.required && !newBankDetail[field.name]) {
                    alertMsg('Campos incompletos', `Por favor completa el campo: ${field.label}`, 'warning');
                    return;
                }
            }
        }

        const newBank = {
            id: Date.now().toString(),
            ...newBankDetail
        };
        
        formData.bankDetails = [...formData.bankDetails, newBank];
        showAddBankForm = false;
        
        // Reset form to default
        newBankDetail = { method: availableMethods[0] || '' };
        
        if (!isNew) {
            // Si es edici\u00f3n, guardamos inmediatamente el contacto para persistir la nueva cuenta
            await handleSave();
        }
    }

    async function removeBankDetail(id: string) {
        if (await confirm('Eliminar Cuenta', '\u00bfEst\u00e1s seguro de eliminar esta cuenta bancaria?')) {
            formData.bankDetails = formData.bankDetails.filter(b => b.id !== id);
            if (!isNew) {
                await handleSave();
            }
        }
    }

    async function handleSave() {
        if (!formData.firstName || !formData.lastName || !formData.country) {
            alertMsg('Datos incompletos', 'Por favor completa los datos personales obligatorios.', 'warning');
            return;
        }

        try {
            saving = true;
            
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                country: Number(formData.country),
                contact_data: {
                    bankDetails: formData.bankDetails
                }
            };

            if (isNew) {
                await api.post('/users/me/contacts', payload);
                alertMsg('\u00c9xito', 'Contacto guardado exitosamente', 'success');
                goto('/client/agenda');
            } else {
                await api.patch(`/users/me/contacts/${contactId}`, payload);
                alertMsg('\u00c9xito', 'Contacto actualizado exitosamente', 'success');
                // Al actualizar, nos quedamos en la p\u00e1gina
            }
        } catch (error: any) {
            console.error('Error saving contact:', error);
            alertMsg('Error', error.message || 'No se pudo guardar el contacto', 'error');
        } finally {
            saving = false;
        }
    }
</script>

{#snippet personalFields()}
    <SectionTitle title="Datos Personales" />
    <div class="form-fields">
        <div class="form-row">
            <Input 
                label="Nombre(s)" 
                id="firstName" 
                bind:value={formData.firstName} 
                placeholder="Ej. Juan" 
                required 
            />
            <Input 
                label="Apellido(s)" 
                id="lastName" 
                bind:value={formData.lastName} 
                placeholder="Ej. Pérez" 
                required 
            />
        </div>
        
        <div class="form-row">
            <Select 
                label="País de Residencia" 
                id="country" 
                bind:value={formData.country} 
                options={countries.map(c => ({ value: c.id, label: c.name }))}
                required 
            />
            <Input 
                label="Correo Electrónico (Opcional)" 
                type="email" 
                id="email" 
                bind:value={formData.email} 
                placeholder="juan@example.com" 
            />
        </div>
    </div>
{/snippet}

{#snippet bankFields()}
    <SectionTitle title="Datos Bancarios">
        {#snippet action()}
            {#if !showAddBankForm}
                <Button variant="secondary" type="button" onclick={() => showAddBankForm = true}>
                    <Plus size={16} style="margin-right: 8px;" />
                    Agregar Cuenta
                </Button>
            {/if}
        {/snippet}
    </SectionTitle>
    
    <div class="banks-container">
        {#if formData.bankDetails.length > 0}
            <Grid cols={2} colsSm={1} gap="16px">
                {#each formData.bankDetails as bank}
                    <div class="bank-card">
                        <div class="bank-card-icon">
                            {#if bank.method === 'PAGO_MOVIL' || bank.method === 'NEQUI'}
                                <Smartphone size={24} color="var(--primary-600)" />
                            {:else}
                                <CreditCard size={24} color="var(--primary-600)" />
                            {/if}
                        </div>
                        <div class="bank-card-info">
                            <strong>{paymentMethods.find(m => m.type_code === bank.method)?.name || 'Cuenta'}</strong>
                            <span>
                                {#if bank.accountNumber} &bull; {bank.accountNumber} {/if}
                                {#if bank.phone} &bull; {bank.phone} {/if}
                            </span>
                        </div>
                        <button type="button" class="remove-bank-btn" onclick={() => removeBankDetail(bank.id)}>
                            <Trash2 size={18} />
                        </button>
                    </div>
                {/each}
            </Grid>
        {:else if !showAddBankForm}
            <div class="empty-state clickable" onclick={() => showAddBankForm = true} onkeydown={(e) => e.key === 'Enter' && (showAddBankForm = true)} role="button" tabindex="0">
                <AlertCircle size={16} />
                No hay cuentas registradas. Haz clic para agregar una.
            </div>
        {/if}

        {#if showAddBankForm}
        <div class="add-bank-section">
            {#if formData.bankDetails.length > 0}
                <hr class="banks-divider" />
            {/if}
            
            <div class="add-bank-inline">
                <h4>Nueva Cuenta Bancaria</h4>
                
                {#if availableMethods.length > 0}
                <div class="form-fields">
                    <Select 
                        label="Método de Pago" 
                        id="method" 
                        bind:value={newBankDetail.method} 
                        options={paymentMethods.map(m => ({ value: m.type_code, label: m.name }))}
                        required 
                    />
                    
                    {#if currentMethodConfig && currentMethodConfig.fields_config}
                        <Grid cols={2} colsSm={1} gap="16px">
                            {#each currentMethodConfig.fields_config as field}
                                <Input 
                                    label={field.label} 
                                    id={field.name} 
                                    type={field.type || 'text'}
                                    bind:value={newBankDetail[field.name]} 
                                    required={field.required}
                                />
                            {/each}
                        </Grid>
                    {/if}
                </div>
                {:else}
                    <div class="no-methods-alert">
                        <p>No hay métodos disponibles actualmente.</p>
                    </div>
                {/if}
                
                <hr style="border: none; border-top: 1px solid var(--gray-200); margin: 24px 0 16px 0;" />
                <div class="add-bank-actions">
                    <Button variant="secondary" type="button" onclick={() => showAddBankForm = false}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="button" onclick={addBankDetail} disabled={!newBankDetail.method}>
                        Guardar Cuenta
                    </Button>
                </div>
            </div>
        </div>
        {/if}
    </div>
{/snippet}

<div class="agenda-form-page">
    {#if loading}
        <div class="loading-state">
            <p class="loading-text">Cargando información...</p>
        </div>
    {:else}
        <div class="contact-form-container">
            {#if isNew}
                <form onsubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <Section class="form-section">
                        {@render personalFields()}
                        
                        <hr class="section-separator" />
                        
                        {@render bankFields()}
                        
                        <div class="section-actions bottom-actions">
                            <Button variant="primary" type="submit" disabled={saving}>
                                <Save size={16} style="margin-right: 8px;" />
                                {saving ? 'Guardando...' : 'Guardar Contacto'}
                            </Button>
                        </div>
                    </Section>
                </form>
            {:else}
                <form onsubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <Section class="form-section">
                        {@render personalFields()}
                        
                        <div class="section-actions bottom-actions">
                            <Button variant="secondary" type="button" onclick={() => goto('/client/agenda')} disabled={saving}>
                                Regresar
                            </Button>
                            <Button variant="primary" type="submit" disabled={saving}>
                                <Save size={16} style="margin-right: 8px;" />
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </div>
                    </Section>
                </form>

                <Section class="form-section">
                    {@render bankFields()}
                </Section>
            {/if}
        </div>

        <div class="tips-container">
            <Section class="tips-section">
                <div class="tips-header">
                    <ShieldCheck size={24} class="tips-icon text-primary" />
                    <h3>Consejos de Seguridad</h3>
                </div>
                
                <ul class="tips-list">
                    <li>
                        <AlertCircle size={16} class="li-icon" />
                        <div>
                            <strong>Nombres exactos</strong>
                            <p>Asegúrate de registrar los nombres y apellidos tal como aparecen en la cuenta bancaria de destino.</p>
                        </div>
                    </li>
                    <li>
                        <Info size={16} class="li-icon" />
                        <div>
                            <strong>Correo electrónico</strong>
                            <p>Si proporcionas un correo, podremos enviar notificaciones y comprobantes de la transacción.</p>
                        </div>
                    </li>
                    <li>
                        <ShieldCheck size={16} class="li-icon" />
                        <div>
                            <strong>Cuentas seguras</strong>
                            <p>Revisa minuciosamente los números de cuenta. Errores tipográficos pueden retrasar el envío.</p>
                        </div>
                    </li>
                </ul>
            </Section>
        </div>
    {/if}
</div>

<style>
    .agenda-form-page { display: grid; grid-template-columns: 1fr; gap: 24px; max-width: 100%; width: 100%; }
    @media (min-width: 1024px) { .agenda-form-page { grid-template-columns: 7fr 3fr; align-items: start; } }
    .contact-form-container { display: flex; flex-direction: column; gap: 24px; width: 100%; }
    :global(.form-section) { width: 100%; display: flex; flex-direction: column; }
    .form-fields, .banks-container { display: flex; flex-direction: column; gap: 20px; }
    .form-row, .dynamic-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @container section (max-width: 600px) {
        .form-row, .dynamic-fields { grid-template-columns: 1fr; gap: 16px; }
        .add-bank-actions, .section-actions { flex-direction: column-reverse; }
        .add-bank-actions :global(button), .section-actions :global(button) { width: 100%; }
    }
    .section-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--gray-200); }
    .section-separator { border: none; border-top: 1px solid var(--gray-200); margin: 32px 0 24px 0; width: 100%; }
    .tips-container { position: sticky; top: 24px; }
    :global(.tips-section) { background: linear-gradient(145deg, var(--white) 0%, var(--gray-50) 100%); }
    .tips-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid var(--gray-200); padding-bottom: 16px; }
    .tips-header h3 { font-size: 18px; font-weight: 700; color: var(--gray-900); margin: 0; }
    .tips-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 20px; }
    .tips-list li { display: flex; gap: 12px; align-items: flex-start; }
    .li-icon { color: var(--primary-500); flex-shrink: 0; margin-top: 2px; }
    .bank-card { display: flex; align-items: center; gap: 16px; padding: 16px; border: 1px solid var(--gray-200); border-radius: 12px; background-color: var(--white); }
    .bank-card-icon { width: 48px; height: 48px; border-radius: 12px; background-color: var(--primary-50); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .bank-card-info { flex: 1; display: flex; flex-direction: column; }
    .bank-card-info strong { font-size: 15px; color: var(--gray-900); margin-bottom: 4px; }
    .bank-card-info span { font-size: 13px; color: var(--gray-500); }
    .remove-bank-btn { background: transparent; border: none; color: var(--gray-400); cursor: pointer; padding: 8px; border-radius: 8px; transition: all 0.2s; }
    .remove-bank-btn:hover { color: #ef4444; background-color: #fef2f2; }
    .empty-state { display: flex; align-items: center; gap: 8px; padding: 16px; color: var(--text-muted, var(--gray-500)); font-size: 13px; font-style: italic; }
    .empty-state.clickable { cursor: pointer; transition: opacity 0.2s; }
    .empty-state.clickable:hover { opacity: 0.8; }
    .add-bank-section { display: flex; flex-direction: column; }
    .banks-divider { border: none; border-top: 1px solid var(--gray-200); margin: 4px 0 24px 0; }
    .add-bank-inline { background-color: var(--gray-50); border: 1px dashed var(--gray-300); border-radius: 12px; padding: 24px 24px 16px 24px; margin-bottom: 0; }
    .add-bank-inline h4 { font-size: 16px; font-weight: 600; color: var(--gray-900); margin: 0 0 16px 0; }
    .add-bank-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 4px; }
    .no-methods-alert { padding: 16px; background-color: #fef2f2; color: #ef4444; border-radius: 8px; border: 1px solid #fecaca; font-size: 14px; }
    .tips-list strong { display: block; font-size: 14px; color: var(--gray-900); margin-bottom: 4px; }
    .tips-list p { font-size: 13px; color: var(--gray-500); margin: 0; line-height: 1.5; }
    .loading-text { text-align: center; color: var(--gray-500); padding: 48px; }
</style>
