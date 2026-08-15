<script lang="ts">
    import { goto } from '$app/navigation';
    import { api } from '$lib/utils/api';
    import { auth } from '$lib/stores/auth.svelte';
    import { REGEX } from '$lib/constants/regex';
    import Input from '$lib/components/ui/Input.svelte';
    import Select from '$lib/components/ui/Select.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Alert from '$lib/components/ui/Alert.svelte';

    let formData = $state({
        firstName: '',
        lastName: '',
        document: '',
        phone: '',
        email: '',
        password: '',
        country: ''
    });

    let loading = $state(false);
    let error = $state<string | null>(null);
    let success = $state<boolean>(false);
    let generatedUsername = $state<string>('');

    let isFormValid = $derived(
        REGEX.PERSON_NAME.test(formData.firstName) &&
        REGEX.PERSON_NAME.test(formData.lastName) &&
        REGEX.DOCUMENT_NUMBER.test(formData.document) &&
        REGEX.EMAIL.test(formData.email) &&
        REGEX.PASSWORD.test(formData.password) &&
        formData.country.trim().length > 0 &&
        (!formData.phone || REGEX.PHONE_NUMBER.test(formData.phone))
    );

    async function handleRegister(e: Event) {
        e.preventDefault();
        loading = true;
        error = null;
        success = false;
        generatedUsername = '';

        try {
            const response: any = await api.post('/auth/register', formData);
            generatedUsername = response?.data?.username || response?.username || `${formData.document}ax`; // Fallback in case format changes
            success = true;
        } catch (err: any) {
            error = err.message || 'Error al intentar registrar el usuario.';
        } finally {
            loading = false;
        }
    }

    async function handleAccept() {
        loading = true;
        try {
            await auth.login({ username: generatedUsername, password: formData.password });
            if (auth.user?.role === 'ADMIN') {
                goto('/admin/home');
            } else {
                goto('/client/home');
            }
        } catch (err: any) {
            error = 'Registro exitoso, pero hubo un error al iniciar sesión automáticamente. Por favor ingresa manualmente.';
            success = false;
        } finally {
            loading = false;
        }
    }
</script>

<div class="register-container">
    <div class="header">
        <button class="back-btn" onclick={() => goto('/login')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Volver
        </button>
        <div class="header-divider"></div>
        <h2>Registro de Cliente</h2>
    </div>

    {#if success}
        <Alert variant="success" title="Registro Exitoso">
            Tu cuenta ha sido creada. Tu usuario para iniciar sesión es: <b style="font-size: 1.1em; color: var(--primary-color);">{generatedUsername}</b>. 
            <br/><br/>
            Por favor, asegúrate de guardar o memorizar este usuario, ya que lo necesitarás para ingresar de ahora en adelante.
        </Alert>
        <div class="spacer"></div>
        <Button type="button" variant="primary" fullWidth onclick={handleAccept} {loading}>
            Aceptar e Iniciar Sesión
        </Button>
    {:else}
        {#if error}
            <Alert variant="danger" title="Error">
                {error}
            </Alert>
            <div class="spacer"></div>
        {/if}

        <form onsubmit={handleRegister} class="register-form">
            <div class="grid-2">
                <Input label="Nombres" format="name" bind:value={formData.firstName} placeholder="Ej: Juan Pablo" required />
                <Input label="Apellidos" format="name" bind:value={formData.lastName} placeholder="Ej: Pérez Gómez" required />
            </div>
            
            <div class="grid-2">
                <Input label="Nro. Documento" format="document" bind:value={formData.document} placeholder="Ej: 12345678" required />
                <Input label="Teléfono" type="tel" format="phone" bind:value={formData.phone} placeholder="Ej: +58 412 1234567" />
            </div>

            <Input label="Correo Electrónico" type="email" format="email" bind:value={formData.email} placeholder="ejemplo@correo.com" required />
            <Input label="Contraseña" type="password" bind:value={formData.password} placeholder="••••••••" required />
            
            <Select 
                label="País de Residencia"
                options={[
                    { value: 'VE', label: 'Venezuela' },
                    { value: 'PE', label: 'Perú' },
                    { value: 'CL', label: 'Chile' },
                    { value: 'US', label: 'Estados Unidos' }
                ]}
                bind:value={formData.country}
                placeholder="Selecciona tu país"
                required
            />

            <Button type="submit" variant="primary" fullWidth {loading} disabled={loading || !isFormValid}>
                Registrarse
            </Button>
        </form>
    {/if}
</div>

<style>
    .register-container {
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

    .register-form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
    }
    
    .spacer {
        height: var(--spacing-4);
    }

    .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-4);
    }

    @media (max-width: 480px) {
        .grid-2 {
            grid-template-columns: 1fr;
        }
    }
</style>
