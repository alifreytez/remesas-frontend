<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth.svelte';
	import { USER_TYPES } from '$lib/constants/auth';
	import { REGEX } from '$lib/constants/regex';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';

	let username = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);

	let isFormValid = $derived(REGEX.USERNAME.test(username) && REGEX.PASSWORD.test(password));

	async function handleLogin(e: Event) {
		e.preventDefault();
		loading = true;
		error = null;

		try {
			await auth.login({ username, password });

			if (auth.user?.userType === USER_TYPES.ADMIN) {
				goto('/admin/home');
			} else {
				goto('/client/home');
			}
		} catch (err: any) {
			error = err.message || 'Credenciales inválidas o error de conexión';
		} finally {
			loading = false;
		}
	}
</script>

<div class="login-container">
	<div class="logo-area">
		<h1>Remesas Inc</h1>
		<p>Inicia sesión para continuar</p>
	</div>

	{#if error}
		<Alert variant="danger" title="Error de autenticación">
			{error}
		</Alert>
		<div class="spacer"></div>
	{/if}

	<form onsubmit={handleLogin} class="login-form">
		<Input
			label="Usuario"
			type="text"
			format="document"
			bind:value={username}
			placeholder="Ej: 12345678"
			required
		/>

		<Input
			label="Contraseña"
			type="password"
			bind:value={password}
			placeholder="••••••••"
			required
		/>

		<Button type="submit" variant="primary" fullWidth {loading} disabled={loading || !isFormValid}>
			Ingresar
		</Button>
	</form>

	<div class="auth-links">
		<p class="text-sm">
			¿No tienes cuenta? <a href="/register" class="link primary">Regístrate</a>
		</p>
		<div class="forgot-links">
			<a href="/forgot" class="link secondary">Olvidé mi contraseña</a>
			<span class="link-separator">•</span>
			<a href="/forgot-username" class="link secondary">¿Olvidaste tu usuario?</a>
		</div>
	</div>
</div>

<style>
	.login-container {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.logo-area {
		text-align: center;
		margin-bottom: 48px;
	}

	.logo-area h1 {
		color: var(--gray-900);
		margin: 0 0 var(--spacing-2) 0;
		font-size: 24px;
		letter-spacing: -0.5px;
	}

	.logo-area p {
		color: var(--gray-500);
		margin: 0;
		font-size: 14px;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-4);
	}

	.spacer {
		height: var(--spacing-4);
	}

	.auth-links {
		margin-top: 48px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-3);
	}

	.text-sm {
		font-size: 14px;
		color: var(--gray-600);
		margin: 0;
	}

	.link {
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.link.primary {
		color: var(--primary-600);
		font-weight: 600;
	}

	.link.primary:hover {
		color: var(--primary-700);
		text-decoration: underline;
	}

	.link.secondary {
		font-size: 14px;
		color: var(--gray-500);
		font-weight: 500;
	}

	.link.secondary:hover {
		color: var(--gray-900);
	}

	.forgot-links {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
		margin-top: var(--spacing-1);
	}

	.link-separator {
		color: var(--gray-400);
		font-size: 14px;
	}
</style>

