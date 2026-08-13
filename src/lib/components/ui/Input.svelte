<script lang="ts">
    import type { Snippet } from 'svelte';
    let {
        label = '',
        placeholder = '',
        type = 'text',
        format = 'default',
        value = $bindable(''),
        disabled = false,
        required = false,
        labelRight
    }: {
        label?: string;
        placeholder?: string;
        type?: string;
        format?: string;
        value?: string;
        disabled?: boolean;
        required?: boolean;
        labelRight?: Snippet;
    } = $props();

    function handleInput(e: Event) {
        const input = e.target as HTMLInputElement;
        let val = input.value;
        
        switch (format) {
            case 'name':
                // Solo letras y espacios (incluye acentos)
                val = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                break;
            case 'phone':
                // Solo números, +, - (SIN espacios)
                val = val.replace(/[^0-9+\-]/g, '');
                break;
            case 'document':
                // Solo números y letras (y guiones) - sin puntos
                val = val.replace(/[^a-zA-Z0-9\-]/g, '');
                break;
            case 'email':
                // Eliminar espacios de forma explícita y luego filtrar caracteres de email
                val = val.replace(/\s/g, '').replace(/[^a-zA-Z0-9@.\-_]/g, '');
                break;
        }

        if (input.value !== val) {
            input.value = val; // Force UI update if char was forbidden
        }
        value = val; // Update bound state
    }

    function handleKeydown(e: KeyboardEvent) {
        // Bloquear explícitamente la barra espaciadora en correo y teléfono
        if ((format === 'email' || format === 'phone') && e.key === ' ') {
            e.preventDefault();
        }
    }

    let isPasswordVisible = $state(false);

    function togglePasswordVisibility() {
        isPasswordVisible = !isPasswordVisible;
    }

    let currentType = $derived(type === 'password' ? (isPasswordVisible ? 'text' : 'password') : type);
</script>

<div class="input-group">
    {#if label || labelRight}
        <div class="label-container">
            <label>
                {label}
                {#if required}
                    <span class="asterisk">*</span>
                {/if}
            </label>
            {#if labelRight}
                <div class="label-right">
                    {@render labelRight()}
                </div>
            {/if}
        </div>
    {/if}
    <div class="input-wrapper">
        <input 
            type={currentType} 
            {placeholder} 
            {value}
            oninput={handleInput} 
            onkeydown={handleKeydown}
            {disabled} 
            {required} 
        />
        {#if type === 'password'}
            <button type="button" class="toggle-password" onclick={togglePasswordVisibility} tabindex="-1">
                {#if isPasswordVisible}
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                {/if}
            </button>
        {/if}
    </div>
</div>

<style>
    .input-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        min-width: 0;
        margin-bottom: 10px;
    }

    label {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-main);
    }

    .label-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    .label-right {
        font-size: 13px;
        color: var(--gray-600);
    }

    .asterisk {
        color: var(--danger-600);
        margin-left: 2px;
    }

    input {
        width: 100%;
        box-sizing: border-box;
        font-family: inherit;
        background-color: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 14px 16px;
        font-size: 14px;
        color: var(--text-main);
        outline: none;
        transition: border-color 0.2s, background-color 0.2s;
    }

    .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
    }

    .input-wrapper:has(.toggle-password) input {
        padding-right: 46px; /* space for the icon */
    }

    .toggle-password {
        position: absolute;
        right: 14px;
        background: transparent;
        border: none;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--gray-500, #6B7280);
        transition: color 0.2s;
    }

    .toggle-password:hover {
        color: var(--gray-800, #1F2937);
    }

    input:focus {
        border-color: var(--text-main);
        background-color: var(--bg-primary);
    }

    input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
