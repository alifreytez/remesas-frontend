<script lang="ts">
    import { goto } from '$app/navigation';
    import { CheckCircle, ArrowRight, Plus, CreditCard, Smartphone } from 'lucide-svelte';
    import Button from '$lib/components/ui/Button.svelte';
    
    let { contacts, selectedContactId = $bindable(), selectedBankDetailId = $bindable(), selectedMethodId = $bindable(), nextStep }: {
        contacts: any[];
        selectedContactId: string;
        selectedBankDetailId: string;
        selectedMethodId: string;
        nextStep: () => void;
    } = $props();

    function selectContact(id: string) {
        selectedContactId = id;
        selectedBankDetailId = '';
        selectedMethodId = '';
    }

    function selectBankDetail(detailId: string, methodId: string) {
        selectedBankDetailId = detailId;
        selectedMethodId = methodId;
    }
</script>

<div class="step-content">
    <h2 class="step-title">¿A quién envías el dinero?</h2>
    <p class="step-desc">Selecciona un contacto de tu directorio o crea uno nuevo.</p>

    <div class="contacts-list">
        {#each contacts as contact}
            <div class="contact-wrapper">
                <button 
                    class="contact-option {selectedContactId === contact.id ? 'selected' : ''}"
                    onclick={() => selectContact(contact.id)}
                >
                    <div class="avatar">{contact.name[0]}</div>
                    <div class="info">
                        <strong>{contact.name}</strong>
                        <span>{contact.document} • {contact.country}</span>
                    </div>
                    {#if selectedContactId === contact.id}
                        <CheckCircle class="check-icon" size={20} />
                    {/if}
                </button>

                {#if selectedContactId === contact.id}
                    <div class="bank-details-list">
                        <p class="bank-details-title">Selecciona la cuenta destino:</p>
                        {#if contact.bankDetails && contact.bankDetails.length > 0}
                            {#each contact.bankDetails as bank}
                                <button 
                                    class="bank-option {selectedBankDetailId === bank.id ? 'selected' : ''}"
                                    onclick={() => selectBankDetail(bank.id, bank.method)}
                                >
                                    <div class="bank-icon">
                                        {#if bank.method === 'pago_movil'}
                                            <Smartphone size={20} />
                                        {:else}
                                            <CreditCard size={20} />
                                        {/if}
                                    </div>
                                    <div class="bank-info">
                                        <strong>{bank.bank}</strong>
                                        <span>
                                            {#if bank.method === 'pago_movil'}
                                                Pago Móvil • {bank.phone}
                                            {:else}
                                                Transferencia • {bank.accountNumber}
                                            {/if}
                                        </span>
                                    </div>
                                    {#if selectedBankDetailId === bank.id}
                                        <div class="selected-dot"></div>
                                    {/if}
                                </button>
                            {/each}
                        {:else}
                            <div class="no-banks">
                                <p>Este contacto no tiene cuentas bancarias guardadas.</p>
                                <Button variant="outline" size="sm" onclick={() => goto(`/client/agenda/${contact.id}`)}>
                                    Agregar Cuenta Bancaria
                                </Button>
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>
        {/each}
        <Button variant="outline" onclick={() => goto('/client/agenda/new')} style="width: 100%; border-style: dashed; justify-content: center; border-color: var(--gray-300); color: var(--primary-600);">
            <Plus size={18} /> Agregar Nuevo Contacto
        </Button>
    </div>

    <div class="actions">
        <Button variant="primary" disabled={!selectedContactId || !selectedBankDetailId} onclick={nextStep}>
            Continuar <ArrowRight size={16} />
        </Button>
    </div>
</div>

<style>
    .step-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .step-title {
        font-size: 20px;
        font-weight: 700;
        color: var(--gray-900);
        margin: 0;
    }

    .step-desc {
        color: var(--gray-500);
        margin: 0 0 24px 0;
        font-size: 14px;
    }

    .contacts-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .contact-option {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border: 2px solid var(--gray-200);
        border-radius: 12px;
        background: transparent;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
    }

    .contact-option:hover {
        border-color: var(--gray-300);
    }

    .contact-option.selected {
        border-color: var(--primary-600);
        background-color: #f3e8ff;
    }

    .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: var(--primary-600);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
    }

    .info {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .info strong {
        color: var(--gray-900);
        font-size: 16px;
    }

    .info span {
        color: var(--gray-500);
        font-size: 13px;
    }

    .check-icon {
        color: var(--primary-600);
    }

    /* Bank Details Inline UI */
    .contact-wrapper {
        display: flex;
        flex-direction: column;
    }

    .bank-details-list {
        margin-top: 12px;
        margin-left: 20px;
        padding-left: 24px;
        border-left: 2px solid var(--gray-200);
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .bank-details-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--gray-600);
        margin: 0 0 4px 0;
    }

    .bank-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: 1px solid var(--gray-200);
        border-radius: 8px;
        background: var(--white);
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
    }

    .bank-option:hover {
        border-color: var(--gray-300);
        background: var(--gray-50);
    }

    .bank-option.selected {
        border-color: var(--primary-500);
        background: #fdf4ff; /* light accent */
    }

    .bank-icon {
        color: var(--gray-500);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .bank-option.selected .bank-icon {
        color: var(--primary-600);
    }

    .bank-info {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .bank-info strong {
        font-size: 14px;
        color: var(--gray-900);
    }

    .bank-info span {
        font-size: 12px;
        color: var(--gray-500);
    }

    .selected-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--primary-600);
    }

    .no-banks {
        background: var(--gray-50);
        padding: 16px;
        border-radius: 8px;
        border: 1px dashed var(--gray-300);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .no-banks p {
        margin: 0;
        font-size: 13px;
        color: var(--gray-600);
    }

    .actions {
        margin-top: 32px;
        display: flex;
        justify-content: flex-end;
    }
</style>
