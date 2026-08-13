<script lang="ts">
    import { goto } from '$app/navigation';
    import { api } from '$lib/utils/api';
    import { REGEX } from '$lib/constants/regex';
    import Input from '$lib/components/ui/Input.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Alert from '$lib/components/ui/Alert.svelte';
    import { onDestroy } from 'svelte';

    let step = $state(1); // 1 = Request, 2 = Code, 3 = Reset

    // Step 1: Request Code
    let username = $state('');
    let email = $state('');
    let loadingRequest = $state(false);
    let requestError = $state<string | null>(null);
    let isCodeExpired = $state(false);

    let isRequestValid = $derived(
        REGEX.USERNAME.test(username) &&
        REGEX.EMAIL.test(email)
    );

    // Step 2: Validate Code
    let code = $state('');
    let loadingCode = $state(false);
    let codeError = $state<string | null>(null);
    let resetToken = $state('');
    let timeLeft = $state(0);
    let timerInterval: ReturnType<typeof setInterval>;

    let isCodeValid = $derived(code.trim().length > 0);
    let formattedTime = $derived(`${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`);

    // Step 3: Reset Password
    let newPassword = $state('');
    let confirmPassword = $state('');
    let loadingReset = $state(false);
    let resetError = $state<string | null>(null);
    let resetSuccess = $state(false);

    let isResetValid = $derived(
        newPassword === confirmPassword && 
        newPassword.length > 0 &&
        REGEX.PASSWORD.test(newPassword)
    );

    async function handleForgot(e: Event) {
        e.preventDefault();
        
        // El usuario solicitó transición incondicional inmediata al hacer click
        // Sin embargo, para obtener el TTL real del backend, debemos disparar la petición.
        // Dado que el backend procesa el email en workers, la respuesta es inmediata (~20ms).
        loadingRequest = true;
        requestError = null;
        isCodeExpired = false;

        try {
            const res = await api.post('/auth/forgot-password', { username, email });
            const ttlSeconds = res.data?.ttlSeconds || 1800; // default 30m fallback
            
            timeLeft = ttlSeconds;
            startTimer();
            step = 2; // Avanzar al paso 2
        } catch (err: any) {
            requestError = err.message || 'Ocurrió un error al intentar solicitar el código.';
        } finally {
            loadingRequest = false;
        }
    }

    function startTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft -= 1;
            } else {
                clearInterval(timerInterval);
                isCodeExpired = true;
                step = 1; // Go back to step 1
                // Limpiar estados de seguridad
                code = '';
                newPassword = '';
                confirmPassword = '';
            }
        }, 1000);
    }

    async function handleVerifyCode(e: Event) {
        e.preventDefault();
        loadingCode = true;
        codeError = null;

        try {
            const res = await api.post('/auth/verify-reset-code', { username, code });
            resetToken = res.data?.resetToken;
            clearInterval(timerInterval);
            step = 3;
        } catch (err: any) {
            codeError = err.message || 'Código inválido o expirado.';
        } finally {
            loadingCode = false;
        }
    }

    async function handleResetPassword(e: Event) {
        e.preventDefault();
        loadingReset = true;
        resetError = null;

        try {
            await api.post('/auth/reset-password', { username, token: resetToken, password: newPassword });
            resetSuccess = true;
        } catch (err: any) {
            resetError = err.message || 'Error al restablecer la contraseña.';
        } finally {
            loadingReset = false;
        }
    }

    onDestroy(() => {
        clearInterval(timerInterval);
    });
</script>

<div class="forgot-container">
    <div class="header">
        {#if !resetSuccess}
            <button class="back-btn" onclick={() => {
                if (step > 1) {
                    clearInterval(timerInterval);
                    step = 1;
                    isCodeExpired = false;
                } else {
                    goto('/login');
                }
            }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Volver
            </button>
            <div class="header-divider"></div>
        {/if}
        <h2>Restablecer Clave</h2>
    </div>

    {#if resetSuccess}
        <Alert variant="success" title="¡Contraseña actualizada!">
            Tu contraseña ha sido modificada con éxito. Ya puedes iniciar sesión con tu nueva clave.
        </Alert>
        <div class="spacer"></div>
        <Button variant="primary" fullWidth onclick={() => goto('/login')}>
            Ir al Inicio de Sesión
        </Button>
    {:else}
        {#if step === 1}
            <p class="description">Ingresa tu usuario y correo para recibir un código de restablecimiento.</p>

            {#if isCodeExpired}
                <Alert variant="danger" title="Tiempo agotado">
                    El tiempo para ingresar el código se ha agotado. Por favor, solicita uno nuevo.
                </Alert>
                <div class="spacer"></div>
            {/if}

            {#if requestError}
                <Alert variant="danger" title="Error">
                    {requestError}
                </Alert>
                <div class="spacer"></div>
            {/if}

            <form onsubmit={handleForgot} class="forgot-form">
                <Input 
                    label="Usuario" 
                    type="text" 
                    format="document"
                    bind:value={username} 
                    placeholder="Ej: 12345678ab" 
                    required 
                />
                <Input 
                    label="Correo Electrónico" 
                    type="email" 
                    format="email"
                    bind:value={email} 
                    placeholder="ejemplo@correo.com" 
                    required 
                />
                <Button type="submit" variant="primary" fullWidth loading={loadingRequest} disabled={loadingRequest || !isRequestValid}>
                    Enviar
                </Button>
            </form>
        {/if}

        {#if step === 2}
            <p class="description">
                Si el usuario y correo coinciden en nuestro sistema, hemos enviado un código a tu correo.
            </p>
            <div class="spacer"></div>

            {#if codeError}
                <Alert variant="danger" title="Error">
                    {codeError}
                </Alert>
                <div class="spacer"></div>
            {/if}

            <form onsubmit={handleVerifyCode} class="forgot-form">
                <Input 
                    label="Código de Verificación" 
                    type="text" 
                    bind:value={code} 
                    placeholder="Ingresa el código" 
                    required 
                >
                    {#snippet labelRight()}
                        <div class="timer-inline">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span>Expira en <b>{formattedTime}</b></span>
                        </div>
                    {/snippet}
                </Input>
                <Button type="submit" variant="primary" fullWidth loading={loadingCode} disabled={loadingCode || !isCodeValid}>
                    Confirmar Código
                </Button>
            </form>
        {/if}

        {#if step === 3}
            <p class="description">Ingresa tu nueva contraseña para finalizar.</p>

            {#if resetError}
                <Alert variant="danger" title="Error">
                    {resetError}
                </Alert>
                <div class="spacer"></div>
            {/if}

            <form onsubmit={handleResetPassword} class="forgot-form">
                <Input 
                    label="Nueva Contraseña" 
                    type="password" 
                    bind:value={newPassword} 
                    placeholder="Escribe tu nueva clave" 
                    required 
                />
                <Input 
                    label="Confirmar Contraseña" 
                    type="password" 
                    bind:value={confirmPassword} 
                    placeholder="Repite la clave" 
                    required 
                />
                <Button type="submit" variant="primary" fullWidth loading={loadingReset} disabled={loadingReset || !isResetValid}>
                    Restablecer Contraseña
                </Button>
            </form>
        {/if}
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

    .timer-inline {
        display: flex;
        align-items: center;
        gap: 4px;
        color: var(--gray-500);
        font-size: 13px;
        font-weight: 500;
    }

    .timer-inline svg {
        color: var(--gray-400);
    }

    .timer-inline b {
        color: var(--text-main);
        font-variant-numeric: tabular-nums;
    }
</style>
