<script lang="ts">
    import { goto } from '$app/navigation';
    import { api } from '$lib/utils/api';
    import { REGEX } from '$lib/constants/regex';
    import Input from '$lib/components/ui/Input.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Alert from '$lib/components/ui/Alert.svelte';

    let username = $state('');
    let code = $state('');
    let password = $state('');
    let confirmPassword = $state('');
    let loading = $state(false);
    let error = $state<string | null>(null);
    let success = $state(false);

    let isFormValid = $derived(
        REGEX.USERNAME.test(username) &&
        code.trim().length === 8 &&
        REGEX.PASSWORD.test(password) &&
        password === confirmPassword
    );

    async function handleReset(e: Event) {
        e.preventDefault();
        loading = true;
        error = null;
        success = false;

        if (password !== confirmPassword) {
            error = 'Las contraseñas no coinciden.';
            loading = false;
            return;
        }

        try {
            // Nota: El backend requiere dos pasos (verifyResetCode -> resetPassword), pero aquí
            // en el frontend simularemos que se envían ambas validaciones para completar la UI de prueba.
            // Primero verificamos:
            const { data } = await api.post('/auth/verify-reset-code', { username, code });
            // Luego cambiamos con el token recibido:
            await api.post('/auth/reset-password', { username, token: data.resetToken, password });
            
            success = true;
            setTimeout(() => goto('/login'), 3000);
        } catch (err: any) {
            error = err.message || 'Error al intentar restablecer la contraseña. Revisa el código.';
        } finally {
            loading = false;
        }
    }
</script>

<div class="reset-container">
    <div class="header">
        <button class="back-btn" onclick={() => goto('/login')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Volver
        </button>
        <div class="header-divider"></div>
        <h2>Nueva Contraseña</h2>
    </div>

    {#if success}
        <Alert variant="success" title="¡Clave Restablecida!">
            Tu contraseña ha sido actualizada con éxito. Redirigiendo al inicio de sesión...
        </Alert>
    {:else}
        <p class="description">Ingresa el código de 8 dígitos que te enviamos y tu nueva contraseña.</p>

        {#if error}
            <Alert variant="danger" title="Error">
                {error}
            </Alert>
            <div class="spacer"></div>
        {/if}

        <form onsubmit={handleReset} class="reset-form">
            <Input 
                label="Usuario" 
                type="text" 
                format="document"
                bind:value={username} 
                placeholder="Ej: 12345678ab" 
                required 
            />

            <Input 
                label="Código de Verificación" 
                type="text"
                bind:value={code} 
                placeholder="Ej: 12345678" 
                required 
            />

            <Input 
                label="Nueva Contraseña" 
                type="password" 
                bind:value={password} 
                placeholder="Mínimo 8 caracteres" 
                required 
            />

            <Input 
                label="Confirmar Contraseña" 
                type="password" 
                bind:value={confirmPassword} 
                placeholder="Repite la contraseña" 
                required 
            />
            
            <Button type="submit" variant="primary" fullWidth {loading} disabled={loading || !isFormValid}>
                Confirmar Cambio
            </Button>
        </form>
    {/if}
</div>

<style>
    .reset-container {
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

    .reset-form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3);
    }
    
    .spacer {
        height: var(--spacing-4);
    }
</style>
