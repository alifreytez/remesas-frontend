<script lang="ts">
    import Stack from '$lib/components/ui/Stack.svelte';
    import SectionAccordion from '$lib/components/ui/SectionAccordion.svelte';
    import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
    import { FileText, Download, X, Image as ImageIcon } from 'lucide-svelte';

    let { remittance } = $props<{
        remittance: any;
    }>();

    let selectedImage = $state<string | null>(null);

    function openLightbox(url: string) {
        selectedImage = url;
    }

    function closeLightbox() {
        selectedImage = null;
    }

    // Mock for destination data fields which depend on the selected payment method
    // In a real scenario, this will be generated dynamically from the database schema
    const destinationFields = remittance?.destinationFields || [
        { label: 'NRO. CUENTA', value: '0134-1099-21-0000001234' },
        { label: 'DOCUMENTO DE IDENTIDAD', value: 'V-12345678' }
    ];

    // Mock for price modifiers (formerly commissions)
    const priceModifiers = remittance?.priceModifiers || [
        { name: '', amount: '+$2.00 USD', type: '5%' },
        { name: '', amount: '+$5.00 USD', type: 'Fija' },
        { name: '', amount: '-$0.40 USD', type: 'Fija' },
        { name: 'Descuento Semana Santa Larga', amount: '-$1.00 USD', type: '10%' },
        { name: '', amount: '-$1.73 USD', type: '16%' }
    ];

    const fees = $derived(priceModifiers.filter((m: any) => m.amount.startsWith('+')));
    const discounts = $derived(priceModifiers.filter((m: any) => m.amount.startsWith('-')));

    // Mock timeline data
    const timeline = [
        { status: 'CREADA', date: '2026-08-08 10:00 AM', description: 'El cliente creó la solicitud por el portal.', user: 'Ali Freytez' },
        { status: 'EN REVISIÓN', date: '2026-08-08 10:15 AM', description: 'La solicitud fue tomada por un operador.', user: 'Operador 1' },
        { status: 'PENDIENTE DE REVISIÓN', date: '2026-08-08 10:30 AM', description: 'Se solicitó evidencia adicional al cliente.', user: 'Operador 1' }
    ];

    function getBadgeColor(status: string) {
        if (status === 'CREADA') return '#3b82f6';
        if (status === 'APROBADA') return '#10b981';
        if (status === 'RECHAZADA') return '#ef4444';
        return '#f59e0b';
    }
</script>

<div class="remittance-detail">
    <Stack gap="var(--spacing-8)">
        
        <!-- Detalles Generales -->
        <SectionAccordion title="Detalles Generales" open={true}>
            <div class="info-grid">
                <!-- Fila 1: Metadatos -->
                <div class="info-item">
                    <span class="info-label">NÚMERO DE SOLICITUD</span>
                    <span class="info-value">{remittance?.solicitud || '#106'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">FECHA</span>
                    <span class="info-value">{remittance?.fecha || '08/08/2026'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">ESTADO</span>
                    <StatusBadge status={remittance?.estado || 'PENDIENTE'} />
                </div>

                <!-- Fila 2: Enrutamiento y Cliente -->
                <div class="info-item" style="grid-column: 1;">
                    <span class="info-label">PAÍS ORIGEN</span>
                    <span class="info-value">{remittance?.origen || 'Chile'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">CLIENTE (REMITENTE)</span>
                    <span class="info-value">{remittance?.cliente || 'Ali Freytez'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">PAÍS DESTINO</span>
                    <span class="info-value">{remittance?.destino || 'Venezuela'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">DESTINATARIO</span>
                    <span class="info-value">{remittance?.destinatario || 'Juan Pérez'}</span>
                </div>
            </div>
        </SectionAccordion>

        <!-- Datos de Destino -->
        <SectionAccordion title="Datos de Destino" open={true}>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">MÉTODO DE PAGO</span>
                    <span class="info-value">{remittance?.metodo_pago || 'Transferencia Bancaria'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">BANCO DESTINO</span>
                    <span class="info-value">{remittance?.banco_destino || 'Banesco'}</span>
                </div>
                {#each destinationFields as field}
                    <div class="info-item">
                        <span class="info-label">{field.label}</span>
                        <span class="info-value">{field.value}</span>
                    </div>
                {/each}
            </div>
        </SectionAccordion>

        <!-- Detalles Financieros -->
        <SectionAccordion title="Detalles Financieros" open={true}>
            <div class="info-grid financial-grid" style="padding-top: 0;">
                <div class="info-item">
                    <span class="info-label">MONTO PAGADO</span>
                    <span class="info-value">{remittance?.monto_pagado || '$1,380,000 CLP'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">TASA DE CAMBIO</span>
                    <span class="info-value">{remittance?.tasa || '920 CLP/USD'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">MONTO A RECIBIR</span>
                    <span class="info-value" style="font-weight: 700; font-size: 15px;">{remittance?.monto_recibir || '$1,495.00 USD'}</span>
                </div>
                {#if fees.length > 0}
                    <div class="info-item">
                        <span class="info-label">TARIFA</span>
                        <div class="info-value-list">
                            {#each fees as fee}
                                <div class="modifier-row">
                                    <span class="modifier-amount">{fee.amount}</span>
                                    <span class="modifier-type">({fee.type})</span>
                                    {#if fee.name}
                                        <span class="modifier-name">({fee.name})</span>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
                {#if discounts.length > 0}
                    <div class="info-item">
                        <span class="info-label">DESCUENTO</span>
                        <div class="info-value-list">
                            {#each discounts as discount}
                                <div class="modifier-row">
                                    <span class="modifier-amount">{discount.amount}</span>
                                    <span class="modifier-type">({discount.type})</span>
                                    {#if discount.name}
                                        <span class="modifier-name">({discount.name})</span>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
        </SectionAccordion>

        <!-- Evidencias y Comprobantes -->
        <SectionAccordion title="Evidencias y Comprobantes" open={true}>
            <div class="evidences-grid">
                <div class="evidence-column">
                    <span class="evidence-subtitle">Evidencia del Solicitante</span>
                    <div class="attachments-list">
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div class="attachment-card clickable" onclick={() => openLightbox('https://fakeimg.pl/800x600?text=Comprobante')}>
                            <div class="attachment-thumb">
                                <ImageIcon size={18} color="var(--primary-600)" />
                            </div>
                            <div class="attachment-info">
                                <span class="attachment-name" title="comprobante_transferencia_bancaria_super_largo.pdf">comprobante_transferencia_bancaria_super_largo.pdf</span>
                                <span class="attachment-date">08/08/2026 10:00 AM</span>
                            </div>
                            <button class="action-btn" onclick={(e) => { e.stopPropagation(); console.log('Download') }} title="Descargar"><Download size={16} /></button>
                        </div>
                    </div>
                </div>
                
                <div class="divider-line"></div>
                
                <div class="evidence-column">
                    <span class="evidence-subtitle">Evidencia Administrativa</span>
                    <div class="attachments-list">
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div class="attachment-card clickable" onclick={() => openLightbox('https://fakeimg.pl/800x600?text=Soporte+1')}>
                            <div class="attachment-thumb">
                                <ImageIcon size={18} color="var(--primary-600)" />
                            </div>
                            <div class="attachment-info">
                                <span class="attachment-name" title="soporte_operador_01.jpg">soporte_operador_01.jpg</span>
                                <span class="attachment-date">08/08/2026 10:15 AM</span>
                            </div>
                            <button class="action-btn" onclick={(e) => { e.stopPropagation(); console.log('Download') }} title="Descargar"><Download size={16} /></button>
                        </div>
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div class="attachment-card clickable" onclick={() => openLightbox('https://fakeimg.pl/800x600?text=Validacion')}>
                            <div class="attachment-thumb">
                                <ImageIcon size={18} color="var(--primary-600)" />
                            </div>
                            <div class="attachment-info">
                                <span class="attachment-name" title="validacion_banco.pdf">validacion_banco.pdf</span>
                                <span class="attachment-date">08/08/2026 10:25 AM</span>
                            </div>
                            <button class="action-btn" onclick={(e) => { e.stopPropagation(); console.log('Download') }} title="Descargar"><Download size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </SectionAccordion>

        <!-- Historial de Estados -->
        <SectionAccordion title="Historial" open={true}>
            <div class="history-timeline">
                {#each timeline as event, index}
                    <div class="history-item">
                        <div class="history-date">{event.date}</div>
                        <div class="history-marker">
                            <div class="marker-dot" style="background-color: {getBadgeColor(event.status)}"></div>
                            {#if index !== timeline.length - 1}
                                <div class="marker-line"></div>
                            {/if}
                        </div>
                        <div class="history-content">
                            <span class="history-desc">{event.description}</span>
                            <span class="history-user">({event.user})</span>
                        </div>
                    </div>
                {/each}
            </div>
        </SectionAccordion>

    </Stack>
</div>

{#if selectedImage}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="lightbox-overlay" onclick={closeLightbox}>
        <button class="lightbox-close" onclick={closeLightbox}>
            <X size={24} />
        </button>
        <div class="lightbox-content" onclick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Evidencia ampliada" />
        </div>
    </div>
{/if}

<style>
    .remittance-detail {
        padding: var(--spacing-4) 0;
        width: 100%;
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--spacing-6);
        row-gap: var(--spacing-8);
        padding-top: var(--spacing-2);
        padding-bottom: var(--spacing-4);
    }

    .financial-grid {
        grid-template-columns: repeat(5, 1fr);
    }

    .info-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .info-label {
        font-size: 11px;
        color: var(--gray-500);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
        margin-bottom: 8px;
        display: block;
    }

    .info-value {
        font-size: 14px;
        color: var(--text-main);
        font-weight: 500;
        line-height: 1.4;
    }

    .info-value-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .modifier-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        line-height: 1.4;
    }

    .modifier-amount {
        color: var(--text-main);
        font-weight: 600;
    }

    .modifier-type, .modifier-name {
        color: var(--gray-500);
        font-size: 12px;
    }

    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background-color: var(--gray-100);
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-main);
        width: fit-content;
    }

    .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
    }

    .evidences-grid {
        display: grid;
        grid-template-columns: 1fr 1px 1fr;
        gap: var(--spacing-6);
        padding-top: var(--spacing-2);
        padding-bottom: var(--spacing-4);
    }
    
    .divider-line {
        background-color: var(--border-color);
        width: 1px;
        height: 100%;
    }
    
    .evidence-column {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .evidence-subtitle {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-main);
    }

    .attachments-list {
        display: flex;
        gap: var(--spacing-4);
        flex-wrap: wrap;
        flex-direction: column;
    }

    .attachment-card {
        display: flex;
        align-items: center;
        gap: 12px;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 10px 14px;
        background-color: var(--white);
        max-width: 280px;
        width: max-content;
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    .attachment-card.clickable {
        cursor: pointer;
    }

    .attachment-card.clickable:not(:has(.action-btn:hover)):hover {
        border-color: var(--primary-300);
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .attachment-thumb {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        background-color: var(--primary-50);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .attachment-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0; /* Important for ellipsis */
    }

    .attachment-name {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-main);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
        max-width: 100%;
    }

    .attachment-date {
        font-size: 11px;
        color: var(--gray-500);
    }

    .action-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--gray-500);
        padding: 6px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }
    
    .action-btn:hover {
        background-color: var(--gray-100);
        color: var(--gray-700);
    }

    /* Lightbox Styles */
    .lightbox-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.85);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
    }

    .lightbox-close {
        position: absolute;
        top: 24px;
        right: 24px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.2s;
    }

    .lightbox-close:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .lightbox-content {
        max-width: 90vw;
        max-height: 90vh;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .lightbox-content img {
        display: block;
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
    }

    /* History Timeline */
    .history-timeline {
        display: flex;
        flex-direction: column;
        padding-top: var(--spacing-2);
    }

    .history-item {
        display: flex;
        gap: var(--spacing-4);
        min-height: 48px; /* space between nodes */
    }

    .history-date {
        width: 130px;
        font-size: 13px;
        color: var(--text-main);
        font-weight: 400;
        text-align: right;
        padding-top: 2px;
    }

    .history-marker {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 16px;
        flex-shrink: 0;
    }

    .marker-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        z-index: 2;
        margin-top: 6px;
        box-shadow: 0 0 0 4px var(--white);
    }

    .marker-line {
        width: 1px;
        background-color: var(--border-color);
        flex: 1;
        margin-top: -2px;
        margin-bottom: -2px;
    }

    .history-content {
        flex: 1;
        display: flex;
        align-items: flex-start;
        gap: 6px;
        padding-top: 2px;
    }

    .history-desc {
        font-size: 13px;
        color: var(--text-main);
    }

    .history-user {
        font-size: 13px;
        color: var(--gray-500);
    }
</style>

