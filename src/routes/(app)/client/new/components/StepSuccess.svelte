<script lang="ts">
    import { CheckCircle, Upload } from 'lucide-svelte';
    import Button from '$lib/components/ui/Button.svelte';
    
    let { 
        totalToPay,
        finish 
    }: {
        totalToPay: string;
        finish: () => void;
    } = $props();
</script>

<div class="step-content text-center">
    <div class="success-icon-wrapper">
        <CheckCircle size={48} color="var(--accent-green)" />
    </div>
    <h2 class="step-title">¡Remesa Registrada!</h2>
    <p class="step-desc mb-6">Tu código de seguimiento es: <strong>RM-1030</strong></p>

    <div class="payment-instructions text-left">
        <h4>Instrucciones de Pago</h4>
        <p>Por favor realiza una transferencia Zelle por el monto exacto de <strong>USD {totalToPay}</strong> a la siguiente dirección:</p>
        <div class="zelle-box">
            pagos@remesas.com
        </div>
    </div>

    <div class="upload-box mt-6">
        <Upload size={24} color="var(--gray-400)" />
        <p>Sube tu comprobante de pago aquí (opcional por ahora)</p>
        <Button variant="outline" size="sm" class="mt-2">Seleccionar Archivo</Button>
    </div>

    <div class="actions center mt-6">
        <Button variant="primary" onclick={finish}>
            Ir al Dashboard
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
        margin: 0;
        font-size: 14px;
    }

    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .mb-6 { margin-bottom: 24px; }
    .mt-6 { margin-top: 24px; }
    .mt-2 { margin-top: 8px; }

    .success-icon-wrapper {
        display: flex;
        justify-content: center;
        margin-bottom: 16px;
    }

    .payment-instructions {
        background-color: var(--gray-50);
        padding: 24px;
        border-radius: 12px;
        border: 1px solid var(--gray-200);
    }

    .payment-instructions h4 {
        margin: 0 0 8px 0;
    }

    .zelle-box {
        background-color: var(--white);
        border: 2px dashed var(--gray-300);
        padding: 16px;
        border-radius: 8px;
        text-align: center;
        font-weight: 700;
        font-size: 18px;
        color: var(--primary-600);
        margin-top: 16px;
    }

    .upload-box {
        border: 2px dashed var(--gray-300);
        border-radius: 12px;
        padding: 32px 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: var(--gray-500);
        font-size: 14px;
    }

    .actions {
        margin-top: 32px;
        display: flex;
        justify-content: center;
    }
</style>
