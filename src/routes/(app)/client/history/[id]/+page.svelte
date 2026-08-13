<script lang="ts">
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import Card from '$lib/components/ui/Card.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import { ArrowLeft, CheckCircle, Clock, MapPin, Landmark, FileText, Download } from 'lucide-svelte';

    let remittanceId = $derived(page.params.id);

    // Mock Data
    let remittance = {
        id: 'RM-1030',
        date: '11 Ago 2026, 14:30',
        status: 'Pendiente Pago',
        beneficiary: {
            name: 'Juan Pérez',
            document: 'V-12345678',
            phone: '+58 412 1234567',
            country: 'Venezuela'
        },
        method: 'Pago Móvil',
        financial: {
            sendAmount: '100.00',
            currencySend: 'USD',
            exchangeRate: '42.50',
            commission: '5.00',
            totalPaid: '105.00',
            receiveAmount: '4250.00',
            currencyReceive: 'Bs'
        }
    };
</script>

<div class="remittance-details">
    <div class="header-section">
        <button class="back-button" onclick={() => goto('/client/history')}>
            <ArrowLeft size={20} /> Volver al Historial
        </button>
        <div class="title-row">
            <h1 class="page-title">Detalle de Remesa {remittance.id}</h1>
            <span class="status-badge status-info">{remittance.status}</span>
        </div>
    </div>

    <div class="details-grid">
        <div class="main-details">
            <Card padding="24px">
                <h3 class="section-title"><Clock size={18} /> Estado Actual</h3>
                <div class="timeline">
                    <div class="timeline-item active">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <strong>Registrada</strong>
                            <span>11 Ago 2026, 14:30</span>
                        </div>
                    </div>
                    <div class="timeline-item active">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <strong>Esperando Pago</strong>
                            <span>Sube tu comprobante para continuar</span>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <strong>En Proceso</strong>
                            <span>Validación administrativa</span>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <strong>Completada</strong>
                            <span>Dinero entregado al beneficiario</span>
                        </div>
                    </div>
                </div>
            </Card>

            <Card padding="24px">
                <h3 class="section-title"><Landmark size={18} /> Beneficiario y Método</h3>
                <div class="info-grid">
                    <div class="info-group">
                        <span class="label">Beneficiario</span>
                        <span class="value">{remittance.beneficiary.name}</span>
                    </div>
                    <div class="info-group">
                        <span class="label">Documento</span>
                        <span class="value">{remittance.beneficiary.document}</span>
                    </div>
                    <div class="info-group">
                        <span class="label">Teléfono</span>
                        <span class="value">{remittance.beneficiary.phone}</span>
                    </div>
                    <div class="info-group">
                        <span class="label">Destino</span>
                        <span class="value">{remittance.beneficiary.country}</span>
                    </div>
                    <div class="info-group full-width mt-2">
                        <span class="label">Método de Recepción</span>
                        <span class="value highlight">{remittance.method}</span>
                    </div>
                </div>
            </Card>
        </div>

        <div class="financial-details">
            <Card padding="24px" class="receipt-card">
                <h3 class="section-title"><FileText size={18} /> Desglose Financiero</h3>
                
                <div class="receipt-body">
                    <div class="receipt-row">
                        <span>Monto Enviado</span>
                        <strong>{remittance.financial.currencySend} {remittance.financial.sendAmount}</strong>
                    </div>
                    <div class="receipt-row">
                        <span>Tasa de Cambio</span>
                        <span>1 USD = {remittance.financial.exchangeRate} Bs</span>
                    </div>
                    <div class="receipt-row">
                        <span>Comisión por Envío</span>
                        <span>{remittance.financial.currencySend} {remittance.financial.commission}</span>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="receipt-row total">
                        <span>Total Pagado</span>
                        <strong>{remittance.financial.currencySend} {remittance.financial.totalPaid}</strong>
                    </div>

                    <div class="receipt-row receive">
                        <span>Destinatario Recibe</span>
                        <strong>{remittance.financial.currencyReceive} {remittance.financial.receiveAmount}</strong>
                    </div>
                </div>

                <div class="actions">
                    <Button variant="outline" style="width: 100%;">
                        <span class="flex justify-center items-center gap-2">
                            <Download size={16} /> Descargar Recibo
                        </span>
                    </Button>
                </div>
            </Card>
        </div>
    </div>
</div>

<style>
    .remittance-details {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding-top: 16px;
        max-width: 1000px;
        margin: 0 auto;
        width: 100%;
    }

    .header-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
    }

    .back-button {
        display: flex;
        align-items: center;
        gap: 8px;
        background: transparent;
        border: none;
        color: var(--gray-500);
        font-weight: 500;
        cursor: pointer;
        padding: 0;
        font-size: 14px;
        transition: color 0.2s;
    }

    .back-button:hover {
        color: var(--gray-900);
    }

    .title-row {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
    }

    .page-title {
        font-size: 24px;
        font-weight: 700;
        color: var(--gray-900);
        margin: 0;
    }

    .status-badge {
        font-size: 12px;
        font-weight: 600;
        padding: 4px 12px;
        border-radius: 9999px;
    }

    .status-info {
        background-color: #e0f2fe;
        color: #0369a1;
    }

    .details-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 24px;
    }

    @media (max-width: 860px) {
        .details-grid {
            grid-template-columns: 1fr;
        }
    }

    .main-details {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 700;
        color: var(--gray-900);
        margin: 0 0 20px 0;
        border-bottom: 1px solid var(--gray-200);
        padding-bottom: 12px;
    }

    /* Timeline */
    .timeline {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .timeline-item {
        display: flex;
        gap: 16px;
        position: relative;
    }

    .timeline-item:not(:last-child)::before {
        content: '';
        position: absolute;
        left: 7px;
        top: 24px;
        bottom: -16px;
        width: 2px;
        background-color: var(--gray-200);
    }

    .timeline-item.active:not(:last-child)::before {
        background-color: var(--primary-600);
    }

    .timeline-dot {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: var(--gray-200);
        margin-top: 4px;
        z-index: 1;
        flex-shrink: 0;
    }

    .timeline-item.active .timeline-dot {
        background-color: var(--primary-600);
        box-shadow: 0 0 0 4px #f3e8ff;
    }

    .timeline-content {
        display: flex;
        flex-direction: column;
        padding-bottom: 8px;
    }

    .timeline-content strong {
        font-size: 15px;
        color: var(--gray-900);
    }

    .timeline-content span {
        font-size: 13px;
        color: var(--gray-500);
    }

    /* Info Grid */
    .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }

    .info-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .full-width {
        grid-column: 1 / -1;
    }

    .mt-2 { margin-top: 8px; }

    .info-group .label {
        font-size: 12px;
        color: var(--gray-500);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .info-group .value {
        font-size: 15px;
        color: var(--gray-900);
        font-weight: 500;
    }

    .info-group .highlight {
        font-weight: 700;
        color: var(--primary-600);
    }

    /* Receipt */
    .receipt-card {
        background-color: var(--gray-50) !important;
    }

    .receipt-body {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .receipt-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        color: var(--gray-600);
    }

    .receipt-row strong {
        color: var(--gray-900);
        font-size: 15px;
    }

    .divider {
        height: 1px;
        background-color: var(--gray-200);
        margin: 4px 0;
    }

    .receipt-row.total {
        font-size: 16px;
        color: var(--gray-900);
    }

    .receipt-row.total strong {
        font-size: 18px;
    }

    .receipt-row.receive {
        background-color: #f3e8ff;
        padding: 16px;
        border-radius: 8px;
        color: var(--primary-700);
        font-weight: 600;
        margin-top: 8px;
    }

    .receipt-row.receive strong {
        color: var(--primary-700);
        font-size: 20px;
    }

    .actions {
        margin-top: 32px;
    }

    .flex { display: flex; }
    .justify-center { justify-content: center; }
    .items-center { align-items: center; }
    .gap-2 { gap: 8px; }
</style>
