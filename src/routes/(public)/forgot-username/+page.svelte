<script lang="ts">
    import { goto } from '$app/navigation';
    import { api } from '$lib/utils/api';
    import { REGEX } from '$lib/constants/regex';
    import Input from '$lib/components/ui/Input.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Alert from '$lib/components/ui/Alert.svelte';

    let email = $state('');
    let loading = $state(false);
    let error = $state<string | null>(null);
    let success = $state(false);

    let isFormValid = $derived(
        REGEX.EMAIL.test(email)
    );

    async function handleForgot(e: Event) {
        e.preventDefault();
        loading = true;
        error = null;
        success = false;

        try {
            await api.post('/auth/forgot-username', { email });
            success = true;
        } catch (err: any) {
            error = err.message || 'Ocurrió un error al intentar enviar el correo.';
        } finally {
            loading = false;
        }
    }
</script>

<div class="forgot-container">
    <div class="header">
        <button class="back-btn" onclick={() => goto('/login')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Volver
        </button>
        <div class="header-divider"></div>
        <h2>Recordar Usuario</h2>
    </div>

    {#if success}
        <Alert variant="success" title="Correo enviado">
            Si el correo <b>{email}</b> existe en nuestro sistema, recibirás un mensaje con la lista de usuarios vinculados a esta dirección.
        </Alert>
        <div class="spacer"></div>
        <Button variant="secondary" fullWidth onclick={() => goto('/login')}>
            Volver al inicio de sesión
        </Button>
    {:else}
        <p class="description">Ingresa tu correo electrónico y te enviaremos la lista de usuarios asociados a tu cuenta.</p>

        {#if error}
            <Alert variant="danger" title="Error">
                {error}
            </Alert>
            <div class="spacer"></div>
        {/if}

        <form onsubmit={handleForgot} class="forgot-form">
            <Input 
                label="Correo Electrónico" 
                type="email" 
                format="email"
                bind:value={email} 
                placeholder="ejemplo@correo.com" 
                required 
            />
            <Button type="submit" variant="primary" fullWidth {loading} disabled={loading || !isFormValid}>
                Recordar Usuario
            </Button>
        </form>
    {/if}
</div>

<style>
    .forgot-container {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .header {
        display: flex;
        align-items: center;
        margin-bottom: 40px;
        gap: var(--spacing-3);
    }

    .back-btn {
        background: none;
        border: none;
        color: var(--gray-500);
        cursor: pointer;
        display: flex;
        align-items: center;
        font-size: 13px;
        padding: 0;
        transition: color var(--transition-fast);
    }
    
    .back-btn:hover {
        color: var(--gray-900);
    }

    .header-divider {
        width: 1px;
        height: 20px;
        background-color: var(--gray-300);
    }

    .header h2 {
        margin: 0;
        font-size: 20px;
        color: var(--gray-900);
    }

    .description {
        color: var(--gray-600);
        font-size: 14px;
        margin: 0 0 32px 0;
    }

    .forgot-form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3);
    }
    
    .spacer {
        height: var(--spacing-4);
    }
</style>

