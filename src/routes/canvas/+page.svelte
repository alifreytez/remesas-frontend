<script lang="ts">
    import Header from '$lib/components/layout/Header.svelte';
    import Sidebar from '$lib/components/layout/Sidebar.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Card from '$lib/components/ui/Card.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import Textarea from '$lib/components/ui/Textarea.svelte';
    import Select from '$lib/components/ui/Select.svelte';
    import Tabs from '$lib/components/ui/Tabs.svelte';
    import Table from '$lib/components/ui/Table.svelte';
    import Badge from '$lib/components/ui/Badge.svelte';
    import ActionCard from '$lib/components/ui/ActionCard.svelte';
    import Alert from '$lib/components/ui/Alert.svelte';
    import FileViewer from '$lib/components/ui/FileViewer.svelte';
    import DashboardStats from '$lib/components/features/DashboardStats.svelte';
    import { Plus } from 'lucide-svelte';

    let activeTab = $state(0);

    const tableColumns = [
        { key: 'id', label: 'ID', width: '50px' },
        { key: 'name', label: 'Nombre' },
        { key: 'status', label: 'Estado' }
    ];

    const tableColumnsV2: any[] = [
        { key: 'id', label: 'ID', width: '80px', filterType: 'text' },
        { key: 'name', label: 'Nombre Destinatario', filterType: 'text' },
        { key: 'amount', label: 'Monto', format: 'currency', currencyKey: 'currency' },
        { key: 'active', label: 'Activo', format: 'switch' },
        { 
            key: 'status', 
            label: 'Estado', 
            filterType: 'select', 
            filterOptions: [
                { value: '', label: 'Todos los estados' },
                { value: 'Aprobada', label: 'Aprobada' },
                { value: 'Pendiente', label: 'Pendiente' },
                { value: 'Rechazada', label: 'Rechazada' }
            ],
            format: 'badge', 
            badgeMap: { 'Aprobada': 'success', 'Pendiente': 'warning', 'Rechazada': 'danger' } 
        }
    ];

    const tableData = [
        { id: '1', name: 'Transferencia a Banco de Chile', amount: 150500.99, currency: 'CLP', active: true, status: 'Aprobada' },
        { id: '2', name: 'Envío a BCP Perú', amount: 2450.50, currency: 'PEN', active: true, status: 'Pendiente' },
        { id: '3', name: 'Remesa a Banesco Venezuela', amount: 35800.25, currency: 'VES', active: false, status: 'Aprobada' },
        { id: '4', name: 'Pago Proveedor Externo', amount: 1250.75, currency: 'USD', active: true, status: 'Rechazada' }
    ];
</script>

<svelte:head>
    <title>UI Canva - Remesas</title>
</svelte:head>

<div class="canva-layout">
    <!-- Showcase Sidebar on the left to show how it looks -->
    <div class="sidebar-wrapper">
        <Sidebar />
    </div>

    <div class="main-content-wrapper">
        <Header userName="Diseñador" subtitle="Canvas de Componentes UI (Flat Design)" />

        <div class="canva-container">
            
            <!-- 1. Tipografía -->
            <section class="showcase-section">
                <h4 class="section-title">1. Tipografía</h4>
                <Card padding="20px">
                    <h1>Título H1 (28px Bold)</h1>
                    <h2>Título H2 (24px Bold)</h2>
                    <h3>Título H3 (20px Bold)</h3>
                    <p style="margin-top: 8px;">Texto de Párrafo (Body Regular 16px)</p>
                    <p style="color: var(--text-muted); font-size: 14px; margin-top: 4px;">Texto Secundario (Muted 14px)</p>
                </Card>
            </section>

            <!-- 2. Botones & Badges -->
            <section class="showcase-section">
                <h4 class="section-title">2. Botones & Estados (Badges)</h4>
                <Card padding="20px">
                    <div class="flex-col">
                        <Button variant="primary">Botón Primario</Button>
                        <Button variant="secondary">Botón Secundario (Outline)</Button>
                        <div style="display: flex; gap: 16px; margin-top: 8px; align-items: center;">
                            <Button variant="icon">
                                <Plus size={24} />
                            </Button>
                            <span style="font-size: 14px; color: var(--text-muted);">Botón Icono Acción</span>
                        </div>
                        <div style="display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap;">
                            <Badge text="Pendiente" variant="warning" />
                            <Badge text="Aprobada" variant="success" />
                            <Badge text="Rechazada" variant="danger" />
                            <Badge text="Informativo" variant="info" />
                        </div>
                    </div>
                </Card>
            </section>

            <!-- 3. Elementos de Formulario -->
            <section class="showcase-section">
                <h4 class="section-title">3. Elementos de Formulario</h4>
                <Card padding="20px">
                    <Input label="Correo Electrónico" placeholder="ejemplo@correo.com" type="email" />
                    <Select 
                        label="País Destino" 
                        options={[
                            { value: 'CL', label: 'Chile' },
                            { value: 'PE', label: 'Perú' }
                        ]} 
                    />
                    <Textarea label="Motivo de Rechazo (Opcional)" placeholder="Escribe aquí las observaciones..." />
                    <FileViewer label="Subir Comprobante de Pago (PDF/JPG)" />
                </Card>
            </section>

            <!-- 4. Componentes Móviles (Action Cards) -->
            <section class="showcase-section">
                <h4 class="section-title">4. Tarjetas de Resumen (Mobile List Item)</h4>
                <div style="max-width: 400px;">
                    <ActionCard 
                        clientName="Ali Freytez"
                        id="105"
                        originCountry="Chile"
                        destCountry="Colombia"
                        recipientName="Juan Perez" 
                        date="08/08/2026" 
                        amount="$100.00" 
                        status="pending" 
                    />
                    <ActionCard 
                        clientName="Maria Paz"
                        id="104"
                        originCountry="Perú"
                        destCountry="Chile"
                        recipientName="Carlos Paz" 
                        date="07/08/2026" 
                        amount="50.00 PEN" 
                        status="approved" 
                    />
                </div>
            </section>

            <!-- 5. Alertas / InfoBoxes -->
            <section class="showcase-section">
                <h4 class="section-title">5. Cajas de Información (Alerts)</h4>
                <Alert variant="warning" title="Atención: Datos de Pago Local">
                    Transfiere exactamente el monto indicado a nuestra cuenta <b>Banco Estado (Chile)</b>.<br>
                    Cta Corriente: 9999999 | RUT: 77.777.777-7
                </Alert>
                <Alert variant="danger" title="Error en la transacción">
                    El comprobante subido no es legible. Por favor, intenta de nuevo.
                </Alert>
            </section>

            <!-- 6. Pestañas (Tabs) -->
            <section class="showcase-section">
                <h4 class="section-title">6. Pestañas (Tabs)</h4>
                <Card padding="20px">
                    <Tabs tabs={['Pendientes', 'Aprobadas', 'Rechazadas']} bind:activeTab />
                </Card>
            </section>

            <!-- 7. Tablas -->
            <section class="showcase-section">
                <h4 class="section-title">7. Tablas Dinámicas (Escritorio)</h4>
                
                <p class="table-title">Tabla Versión 2 (Listado Compacto/Admin con Filtros y Sticky Actions)</p>
                <Table columns={tableColumnsV2} data={tableData} variant="v2" paginated={true} hasActions={true} />
            </section>

        </div>
    </div>
</div>

<style>
    .canva-layout {
        display: flex;
        width: 100%;
        min-height: 100vh;
    }

    .sidebar-wrapper {
        flex-shrink: 0;
        border-right: 1px solid var(--border-color);
        background: var(--bg-primary);
    }

    .main-content-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow-x: hidden;
    }

    .canva-container {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 40px;
    }

    .showcase-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .section-title {
        font-size: 18px;
        font-weight: 700;
        color: var(--accent-purple);
        border-bottom: 2px solid var(--accent-purple);
        padding-bottom: 8px;
        margin-bottom: 4px;
    }

    .flex-col {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
    }

    .table-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--text-muted);
    }
</style>

