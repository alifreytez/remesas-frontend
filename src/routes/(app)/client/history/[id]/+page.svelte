<script lang="ts">
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { setHeader } from '$lib/stores/header.svelte';
    import Card from '$lib/components/ui/Card.svelte';
    import Section from '$lib/components/layout/Section.svelte';
    import SectionTitle from '$lib/components/layout/SectionTitle.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import { CheckCircle, Clock, MapPin, Landmark, FileText, Download } from 'lucide-svelte';
    import { api } from '$lib/utils/api';
    import { onMount } from 'svelte';

    let remittanceId = $derived(page.params.id);

    let paymentMethods = $state<any[]>([]);
    let remittance = $state<any>(null);
    let loading = $state(true);

    let currentMethodConfig = $derived(
        remittance && paymentMethods.length > 0
            ? paymentMethods.find(m => m.id === remittance.paymentMethod || m.type_code === remittance._RecipientDetails?.method) || null
            : null
    );

    let bankFieldsCount = $derived(
        1 + (currentMethodConfig && currentMethodConfig.fields_config ? currentMethodConfig.fields_config.length : 0)
    );
    let bankGridClass = $derived(bankFieldsCount >= 3 ? 'grid-cols-3' : 'grid-cols-2');

    $effect(() => {
        if (remittance) {
            setHeader(
                `Detalle de Remesa #${remittance.id}`, 
                true, 
                '/client/history', 
                null, 
                { text: remittance.status }
            );
        } else {
            setHeader('Cargando Detalle...', true, '/client/history', null);
        }

        return () => {
            setHeader('', false, '', null);
        };
    });

    onMount(async () => {
        try {
            loading = true;
            
            const [remRes, pmRes] = await Promise.all([
                api.get<{data: any}>(`/remittances/${remittanceId}`),
                api.get<{data: any}>('/remittances/options')
            ]);
            
            remittance = remRes.data;
            paymentMethods = pmRes.data.paymentMethods || [];
        } catch (error) {
            console.error('Error fetching remittance:', error);
            goto('/client/history');
        } finally {
            loading = false;
        }
    });

    function getMethodName(methodCode: string | undefined) {
        if (!methodCode) return 'Desconocido';
        const m = paymentMethods.find(x => x.type_code === methodCode);
        return m ? m.name : methodCode;
    }

    function formatDate(dateStr: string | null | undefined) {
        if (!dateStr) return 'Pendiente';
        return new Date(dateStr).toLocaleString();
    }
</script>

<div class="remittance-detail-page">
    {#if loading}
        <div class="loading-state">
            <p>Cargando detalles de la remesa...</p>
        </div>
    {:else if remittance}
        {#if remittance.status === 'REJECTED' || remittance.status === 'RECHAZADA'}
            <div class="status-alert rejected">
                <div class="alert-icon"><FileText size={20} /></div>
                <div class="alert-content">
                    <h4>Remesa Cancelada o Rechazada</h4>
                    <p>{remittance.rejectionReason || 'No se especificó motivo de rechazo.'}</p>
                </div>
            </div>
        {/if}

        <div class="detail-grid">
            <div class="main-column">
                <!-- Timeline de Estados -->
                <Section class="detail-section">
                    <SectionTitle title="Estado del Envío" />
                    <Card padding="var(--spacing-6)">
                        <div class="status-timeline">
                            <div class="timeline-step completed">
                                <div class="step-icon"><CheckCircle size={20} /></div>
                                <div class="step-info">
                                    <strong>Registrada</strong>
                                    <span>{formatDate(remittance.createdAt)}</span>
                                </div>
                            </div>
                            
                            <div class={`timeline-line ${remittance.status !== 'PENDING' && remittance.status !== 'PENDIENTE DE REVISION' ? 'completed' : ''}`}></div>
                            
                            <div class={`timeline-step ${remittance.status !== 'PENDING' && remittance.status !== 'PENDIENTE DE REVISION' ? 'completed' : remittance.status === 'REJECTED' ? 'rejected' : 'active'}`}>
                                <div class="step-icon"><Clock size={20} /></div>
                                <div class="step-info">
                                    <strong>Validación</strong>
                                    <span>
                                        {#if remittance.status === 'REJECTED'}
                                            Rechazada
                                        {:else if remittance.status === 'APPROVED'}
                                            Completada
                                        {:else}
                                            En proceso
                                        {/if}
                                    </span>
                                </div>
                            </div>

                            <div class={`timeline-line ${remittance.status === 'APPROVED' ? 'completed' : ''}`}></div>

                            <div class={`timeline-step ${remittance.status === 'APPROVED' ? 'completed' : 'pending'}`}>
                                <div class="step-icon"><Landmark size={20} /></div>
                                <div class="step-info">
                                    <strong>Completada</strong>
                                    <span>{formatDate(remittance.updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Section>

                <!-- Detalles Financieros -->
                <Section class="detail-section">
                    <SectionTitle title="Detalle Financiero" />
                    <Card padding="0">
                        <div class="financial-summary">
                            <div class="fin-row">
                                <span class="fin-label">Monto Enviado</span>
                                <span class="fin-value">{remittance.amountSent} {remittance._OriginCountry?.currencyCode || ''}</span>
                            </div>
                            <div class="fin-row">
                                <span class="fin-label">Comisión e Impuestos</span>
                                <span class="fin-value text-danger">+ {remittance.totalFees || '0.00'} {remittance._OriginCountry?.currencyCode || ''}</span>
                            </div>
                            <div class="fin-row highlight-row">
                                <span class="fin-label">Total Pagado</span>
                                <strong class="fin-value">{remittance.amountToPay || remittance.amountSent} {remittance._OriginCountry?.currencyCode || ''}</strong>
                            </div>
                            
                            <div class="fin-divider"></div>
                            
                            <div class="fin-row">
                                <span class="fin-label">Tasa de Cambio</span>
                                <span class="fin-value">{remittance.exchangeRateValue || 'N/A'}</span>
                            </div>
                            <div class="fin-row receive-row">
                                <span class="fin-label">Monto a Recibir</span>
                                <strong class="fin-value receive-value">{remittance.amountReceived || 'N/A'} {remittance._DestinationCountry?.currencyCode || ''}</strong>
                            </div>
                        </div>
                    </Card>
                </Section>

                <!-- Informacion del Beneficiario y Banco -->
                <Section class="detail-section">
                    <SectionTitle title="Datos del Destinatario" />
                    <Card padding="var(--spacing-6)">
                        <div class="info-group-container">
                            <div class="info-group">
                                <div class="info-icon"><MapPin size={20} /></div>
                                <div class="info-content">
                                    <h5>Beneficiario</h5>
                                    <p>{remittance._RecipientDetails?.contactName || 'Desconocido'}</p>
                                    <span class="sub-text">{remittance._DestinationCountry?.name || ''}</span>
                                </div>
                            </div>

                            <hr class="section-divider" />
                            
                            <div class="info-group">
                                <div class="info-icon"><Landmark size={20} /></div>
                                <div class="info-content w-full">
                                    <h5>Detalles Bancarios</h5>
                                    <div class={`bank-grid ${bankGridClass}`}>
                                        <div class="bank-field">
                                            <span class="field-label">Método</span>
                                            <span class="field-value">{getMethodName(remittance._RecipientDetails?.method)}</span>
                                        </div>
                                        
                                        {#if currentMethodConfig && currentMethodConfig.fields_config}
                                            {#each currentMethodConfig.fields_config as field}
                                                <div class="bank-field">
                                                    <span class="field-label">{field.label}</span>
                                                    <span class="field-value">{remittance._RecipientDetails?.[field.name] || 'N/A'}</span>
                                                </div>
                                            {/each}
                                        {:else}
                                            <!-- Fallback if method config not found -->
                                            {#each Object.entries(remittance._RecipientDetails || {}).filter(([k]) => k !== 'method' && k !== 'contactName' && k !== 'saveContact') as [k, v]}
                                                <div class="bank-field">
                                                    <span class="field-label">{k}</span>
                                                    <span class="field-value">{v as any}</span>
                                                </div>
                                            {/each}
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Section>
            </div>

            <!-- Columna lateral para Recibos y Soporte -->
            <div class="side-column">
                <Section class="detail-section">
                    <SectionTitle title="Documentos" />
                    <Card padding="var(--spacing-4)">
                        <div class="docs-list">
                            <button class="doc-btn">
                                <div class="doc-icon"><FileText size={18} /></div>
                                <div class="doc-text">
                                    <span>Comprobante de Envío</span>
                                    <small>PDF (Automático)</small>
                                </div>
                                <Download size={16} class="doc-download" />
                            </button>
                            
                            <!-- Comprobante del usuario -->
                            {#if remittance._Receipts && remittance._Receipts.length > 0}
                                {#each remittance._Receipts as receipt}
                                    <button class="doc-btn">
                                        <div class="doc-icon"><FileText size={18} /></div>
                                        <div class="doc-text">
                                            <span>Baucher de Pago</span>
                                            <small>{new Date(receipt.createdAt).toLocaleDateString()}</small>
                                        </div>
                                        <Download size={16} class="doc-download" />
                                    </button>
                                {/each}
                            {/if}
                        </div>
                    </Card>
                </Section>
            </div>
        </div>
    {/if}
</div>

<style>
    .remittance-detail-page {
        
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-6);
    }

    .detail-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--spacing-6);
        align-items: start;
    }

    @media (min-width: 1024px) {
        .detail-grid {
            grid-template-columns: 2fr 1fr;
        }
    }

    .main-column, .side-column {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-6);
    }

    :global(.detail-section) {
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    /* Status Alert */
    .status-alert {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-4);
        padding: var(--spacing-4);
        border-radius: var(--radius-lg);
        background-color: var(--color-white);
        border: 1px solid var(--neutral-200);
    }

    .status-alert.rejected {
        background-color: #fef2f2;
        border-color: #fecaca;
    }
    .status-alert.rejected .alert-icon {
        color: #ef4444;
    }
    .status-alert.rejected h4 {
        color: #991b1b;
    }

    .alert-content h4 {
        margin: 0 0 4px 0;
        font-size: var(--text-base);
        font-weight: 600;
    }
    
    .alert-content p {
        margin: 0;
        font-size: var(--text-sm);
        color: var(--neutral-600);
    }

    /* Timeline */
    .status-timeline {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        position: relative;
        padding: 0 var(--spacing-4);
    }

    @media (max-width: 600px) {
        .status-timeline {
            flex-direction: column;
            gap: var(--spacing-6);
            padding: 0;
        }
        .timeline-line {
            display: none;
        }
    }

    .timeline-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: var(--spacing-2);
        z-index: 2;
        position: relative;
        background: var(--color-white);
    }

    @media (max-width: 600px) {
        .timeline-step {
            flex-direction: row;
            text-align: left;
            width: 100%;
        }
    }

    .step-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: var(--neutral-100);
        color: var(--neutral-400);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--color-white);
    }

    .timeline-step.completed .step-icon {
        background-color: var(--primary-100);
        color: var(--primary-600);
    }

    .timeline-step.active .step-icon {
        background-color: var(--primary-600);
        color: var(--color-white);
        box-shadow: 0 0 0 4px var(--primary-50);
    }

    .timeline-step.rejected .step-icon {
        background-color: #ef4444;
        color: var(--color-white);
        box-shadow: 0 0 0 4px #fef2f2;
    }

    .step-info strong {
        display: block;
        font-size: var(--text-sm);
        color: var(--neutral-900);
    }

    .step-info span {
        font-size: 12px;
        color: var(--neutral-500);
    }

    .timeline-line {
        flex: 1;
        height: 2px;
        background-color: var(--neutral-200);
        margin-top: 20px;
        min-width: 20px;
    }

    .timeline-line.completed {
        background-color: var(--primary-500);
    }

    /* Financial Summary */
    .financial-summary {
        display: flex;
        flex-direction: column;
    }

    .fin-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-4) var(--spacing-6);
        border-bottom: 1px solid var(--neutral-100);
    }
    
    .fin-row:last-child {
        border-bottom: none;
    }

    .fin-label {
        font-size: var(--text-sm);
        color: var(--neutral-500);
    }

    .fin-value {
        font-size: var(--text-base);
        font-weight: 500;
        color: var(--neutral-900);
    }

    .text-danger { color: #ef4444; }

    .highlight-row {
        background-color: var(--neutral-50);
    }

    .receive-row {
        background-color: var(--primary-50);
    }
    
    .receive-value {
        color: var(--primary-700);
        font-size: var(--text-lg);
        font-weight: 700;
    }

    .fin-divider {
        height: 1px;
        background-color: var(--neutral-200);
        width: 100%;
    }

    /* Beneficiary Info */
    .info-group-container {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-5);
    }

    .info-group {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-4);
    }

    .info-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-full);
        background-color: var(--neutral-50);
        color: var(--neutral-500);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .info-content h5 {
        margin: 0 0 4px 0;
        font-size: var(--text-sm);
        color: var(--neutral-500);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .info-content p {
        margin: 0;
        font-size: var(--text-base);
        font-weight: 500;
        color: var(--neutral-900);
    }

    .sub-text {
        font-size: var(--text-sm);
        color: var(--neutral-500);
    }

    .section-divider {
        border: none;
        border-top: 1px dashed var(--neutral-200);
        margin: 0;
    }

    .w-full { width: 100%; }

    .bank-grid {
        display: grid;
        gap: var(--spacing-4);
        margin-top: var(--spacing-3);
    }

    .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
    .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }

    @container section (max-width: 500px) {
        .bank-grid { grid-template-columns: 1fr; }
    }

    .bank-field {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .field-label {
        font-size: 12px;
        color: var(--neutral-500);
    }

    .field-value {
        font-size: var(--text-sm);
        color: var(--neutral-900);
        font-weight: 500;
    }

    /* Docs List */
    .docs-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
    }

    .doc-btn {
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
        padding: var(--spacing-3);
        background-color: var(--neutral-50);
        border: 1px solid var(--neutral-200);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all 0.2s;
        width: 100%;
        text-align: left;
    }

    .doc-btn:hover {
        background-color: var(--primary-50);
        border-color: var(--primary-200);
    }
    
    .doc-btn:hover .doc-download {
        color: var(--primary-600);
    }

    .doc-icon {
        color: var(--primary-600);
    }

    .doc-text {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .doc-text span {
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--neutral-900);
    }

    .doc-text small {
        font-size: 12px;
        color: var(--neutral-500);
    }

    .doc-download {
        color: var(--neutral-400);
    }

    .loading-state {
        text-align: center;
        padding: 64px 0;
        color: var(--gray-500);
    }
</style>
