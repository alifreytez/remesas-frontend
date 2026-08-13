<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import Button from '$lib/components/ui/Button.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import Select from '$lib/components/ui/Select.svelte';
    import Section from '$lib/components/layout/Section.svelte';
    import SectionTitle from '$lib/components/layout/SectionTitle.svelte';
    import { Save, AlertCircle, ShieldCheck, Info, Plus, Trash2, CreditCard, Smartphone } from 'lucide-svelte';
    import { setHeader } from '$lib/stores/header.svelte';

    let contactId = $derived(page.params.id);
    let isNew = $derived(contactId === 'new');

    let loading = $state(false);
    let saving = $state(false);

    $effect(() => {
        // Set the global header back button for this page
        setHeader(
            isNew ? 'Nuevo Contacto' : 'Editar Contacto',
            true, // showBack
            '/client/agenda' // backUrl
        );

        return () => {
            // Clean up when unmounting (the layout will reset the title on navigation anyway)
            setHeader('', false, '', null);
        };
    });

    let formData = $state({
        firstName: '',
        lastName: '',
        documentNumber: '',
        phone: '',
        email: '',
        country: '',
        bankDetails: [] as any[]
    });

    let newBankDetail = $state({
        method: 'pago_movil',
        bank: '',
        document: '',
        phone: '',
        accountNumber: '',
        accountType: 'corriente'
    });

    let showAddBankForm = $state(false);

    function addBankDetail() {
        if (!newBankDetail.bank) return;
        formData.bankDetails = [...formData.bankDetails, { ...newBankDetail, id: Date.now().toString() }];
        // Reset form and hide
        newBankDetail = {
            method: 'pago_movil',
            bank: '',
            document: '',
            phone: '',
            accountNumber: '',
            accountType: 'corriente'
        };
        showAddBankForm = false;
    }

    function removeBankDetail(id: string) {
        formData.bankDetails = formData.bankDetails.filter(b => b.id !== id);
    }

    let countries = $state<any[]>([
        { id: 1, name: 'Venezuela' },
        { id: 2, name: 'Colombia' },
        { id: 3, name: 'Perú' },
        { id: 4, name: 'Chile' }
    ]);

    onMount(async () => {
        // Load countries from API ideally
        if (!isNew) {
            loading = true;
            // Fetch contact details mock
            setTimeout(() => {
                formData = {
                    firstName: 'Juan',
                    lastName: 'Pérez',
                    documentNumber: 'V-12345678',
                    phone: '+584121234567',
                    email: 'juan@example.com',
                    country: '1',
                    bankDetails: [
                        { id: '1', method: 'pago_movil', bank: 'Banesco', document: 'V-12345678', phone: '04121234567' },
                        { id: '2', method: 'transferencia', bank: 'Mercantil', accountNumber: '01050000000000000000', accountType: 'corriente', document: 'V-12345678' }
                    ]
                };
                loading = false;
            }, 500);
        }
    });

    async function handleSave() {
        saving = true;
        // Mock save
        setTimeout(() => {
            saving = false;
            goto('/client/agenda');
        }, 800);
    }
</script>

<div class="agenda-form-page">
    {#if loading}
        <div class="loading-state">
            <p>Cargando información del contacto...</p>
        </div>
    {:else}
        <form class="contact-form-container" onsubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <Section class="form-section">
                <SectionTitle title="Datos Personales" />
                
                <div class="form-fields">
                    <div class="form-row">
                        <Input 
                            label="Nombre(s)" 
                            bind:value={formData.firstName}
                            required
                        />
                        <Input 
                            label="Apellido(s)" 
                            bind:value={formData.lastName}
                            required
                        />
                    </div>

                <div class="form-row">
                    <Input 
                        label="Documento de Identidad" 
                        bind:value={formData.documentNumber}
                        required
                    />
                    <Select 
                        label="País de Residencia" 
                        options={countries.map(c => ({ value: c.id.toString(), label: c.name }))}
                        bind:value={formData.country}
                        required
                    />
                </div>
                
                <div class="form-row">
                    <Input 
                        label="Teléfono Móvil" 
                        bind:value={formData.phone}
                        required
                    />
                    <Input 
                        label="Correo Electrónico (Opcional)" 
                        type="email"
                        bind:value={formData.email}
                    />
                </div>
                </div> <!-- END form-fields -->

                <div class="section-actions">
                    <Button variant="primary" type="submit" disabled={saving}>
                        {#if saving}
                            Guardando...
                        {:else}
                            <Save size={16} /> Guardar
                        {/if}
                    </Button>
                </div>
            </Section>

            <Section class="form-section">
                <SectionTitle title="Datos Bancarios">
                    {#snippet action()}
                        {#if !showAddBankForm}
                            <Button variant="outline" type="button" onclick={() => showAddBankForm = true}>
                                <Plus size={16} /> Agregar Cuenta
                            </Button>
                        {/if}
                    {/snippet}
                </SectionTitle>
                
                <div class="banks-container">
                    {#if formData.bankDetails.length > 0}
                        <div class="bank-list">
                            {#each formData.bankDetails as bank}
                                <div class="bank-card">
                                    <div class="bank-card-icon">
                                        {#if bank.method === 'pago_movil'}
                                            <Smartphone size={24} color="var(--primary-600)" />
                                        {:else}
                                            <CreditCard size={24} color="var(--primary-600)" />
                                        {/if}
                                    </div>
                                    <div class="bank-card-info">
                                        <strong>{bank.bank}</strong>
                                        <span>
                                            {#if bank.method === 'pago_movil'}
                                                Pago Móvil • {bank.phone} • {bank.document}
                                            {:else}
                                                Transferencia • {bank.accountNumber}
                                            {/if}
                                        </span>
                                    </div>
                                    <button type="button" class="remove-bank-btn" onclick={() => removeBankDetail(bank.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <p class="empty-banks">No hay cuentas bancarias registradas para este contacto.</p>
                    {/if}

                    {#if showAddBankForm}
                    <div class="add-bank-inline">
                        <h4>Agregar Nueva Cuenta</h4>
                        <div class="form-row" style="margin-bottom: 16px;">
                            <Select 
                                label="Método de Recepción" 
                                options={[
                                    { value: 'pago_movil', label: 'Pago Móvil' },
                                    { value: 'transferencia', label: 'Transferencia Bancaria' }
                                ]}
                                bind:value={newBankDetail.method}
                            />
                            <Input 
                                label="Banco" 
                                bind:value={newBankDetail.bank}
                            />
                        </div>
                        
                        {#if newBankDetail.method === 'pago_movil'}
                            <div class="form-row">
                                <Input 
                                    label="Cédula del Titular" 
                                    bind:value={newBankDetail.document}
                                />
                                <Input 
                                    label="Teléfono Afiliado" 
                                    bind:value={newBankDetail.phone}
                                />
                            </div>
                        {:else}
                            <div class="form-row" style="margin-bottom: 16px;">
                                <Input 
                                    label="Número de Cuenta (20 dígitos)" 
                                    bind:value={newBankDetail.accountNumber}
                                />
                            </div>
                            <div class="form-row">
                                <Input 
                                    label="Cédula del Titular" 
                                    bind:value={newBankDetail.document}
                                />
                                <Select 
                                    label="Tipo de Cuenta" 
                                    options={[
                                        { value: 'corriente', label: 'Corriente' },
                                        { value: 'ahorro', label: 'Ahorro' }
                                    ]}
                                    bind:value={newBankDetail.accountType}
                                />
                            </div>
                        {/if}
                        
                        <div class="add-bank-actions">
                            <Button variant="outline" type="button" onclick={() => showAddBankForm = false} style="margin-right: 12px;">
                                Cancelar
                            </Button>
                            <Button variant="primary" type="button" onclick={addBankDetail} disabled={!newBankDetail.bank}>
                                <Plus size={16} /> Guardar Cuenta
                            </Button>
                        </div>
                    </div>
                {/if}
                </div> <!-- END banks-container -->
            </Section>
        </form>

        <!-- Right Side: Tips and Security -->
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
                            <strong>Verifica el documento</strong>
                            <p>Asegúrate de que el número de identificación coincida exactamente con el registrado en su cuenta bancaria.</p>
                        </div>
                    </li>
                    <li>
                        <Info size={16} class="li-icon" />
                        <div>
                            <strong>Teléfono válido</strong>
                            <p>Ingresa un número móvil activo. Enviaremos notificaciones SMS cuando su dinero esté disponible.</p>
                        </div>
                    </li>
                    <li>
                        <ShieldCheck size={16} class="li-icon" />
                        <div>
                            <strong>Cuentas seguras</strong>
                            <p>No guardes información si no confías en el destinatario. Tus transacciones son monitoreadas por seguridad.</p>
                        </div>
                    </li>
                </ul>
            </Section>
        </div>
    {/if}
</div>

<style>
    .agenda-form-page {
        display: grid;
        grid-template-columns: 1fr;
        gap: 24px;
        max-width: 100%;
        width: 100%;
    }

    @media (min-width: 1024px) {
        .agenda-form-page {
            grid-template-columns: 7fr 3fr;
            align-items: start;
        }
    }

    /* Container Queries para el formulario */
    .contact-form-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
        width: 100%;
    }

    :global(.form-section) {
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    .form-fields, .banks-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .section-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--gray-900);
        border-bottom: 1px solid var(--gray-200);
        padding-bottom: 8px;
        margin: 0;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
    }

    @container section (max-width: 600px) {
        .form-row {
            grid-template-columns: 1fr;
            gap: 16px;
        }
    }

    .section-actions {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid var(--gray-200);
    }

    /* Tips Section CSS */
    .tips-container {
        position: sticky;
        top: 24px;
    }

    :global(.tips-section) {
        background: linear-gradient(145deg, var(--white) 0%, var(--gray-50) 100%);
    }

    .tips-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
        border-bottom: 1px solid var(--gray-200);
        padding-bottom: 16px;
    }

    .tips-header h3 {
        font-size: 18px;
        font-weight: 700;
        color: var(--gray-900);
        margin: 0;
    }

    .tips-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .tips-list li {
        display: flex;
        gap: 12px;
        align-items: flex-start;
    }

    .li-icon {
        color: var(--primary-500);
        flex-shrink: 0;
        margin-top: 2px;
    }

    /* Bank Details UI */
    .bank-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .bank-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border: 1px solid var(--gray-200);
        border-radius: 12px;
        background-color: var(--white);
    }

    .bank-card-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background-color: var(--primary-50);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .bank-card-info {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .bank-card-info strong {
        font-size: 15px;
        color: var(--gray-900);
        margin-bottom: 4px;
    }

    .bank-card-info span {
        font-size: 13px;
        color: var(--gray-500);
    }

    .remove-bank-btn {
        background: transparent;
        border: none;
        color: var(--gray-400);
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
        transition: all 0.2s;
    }

    .remove-bank-btn:hover {
        color: #ef4444;
        background-color: #fef2f2;
    }

    .empty-banks {
        font-size: 14px;
        color: var(--gray-500);
        font-style: italic;
    }

    .add-bank-inline {
        background-color: var(--gray-50);
        border: 1px dashed var(--gray-300);
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 16px;
    }

    .add-bank-inline h4 {
        font-size: 16px;
        font-weight: 600;
        color: var(--gray-900);
        margin: 0 0 16px 0;
    }

    .add-bank-actions {
        display: flex;
        justify-content: flex-start;
        margin-top: 20px;
    }

    .tips-list strong {
        display: block;
        font-size: 14px;
        color: var(--gray-900);
        margin-bottom: 4px;
    }

    .tips-list p {
        font-size: 13px;
        color: var(--gray-500);
        margin: 0;
        line-height: 1.5;
    }

    .loading-text {
        text-align: center;
        color: var(--gray-500);
        padding: 48px;
    }
</style>
