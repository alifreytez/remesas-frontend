<script lang="ts">
    import type { Snippet } from 'svelte';

    let {
        variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon'
        type = 'button',
        onclick,
        disabled = false,
        fullWidth = false,
        children,
        class: className = '',
        style = ''
    }: {
        variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
        type?: 'button' | 'submit' | 'reset';
        onclick?: (event: MouseEvent) => void;
        disabled?: boolean;
        fullWidth?: boolean;
        children?: Snippet;
        class?: string;
        style?: string;
    } = $props();
</script>

<button
    {type}
    class="btn-pill {className}"
    class:btn-primary={variant === 'primary'}
    class:btn-secondary={variant === 'secondary'}
    class:btn-danger={variant === 'danger'}
    class:btn-ghost={variant === 'ghost'}
    class:btn-full-width={fullWidth}
    {style}
    {onclick}
    {disabled}
>
    {@render children?.()}
</button>

<style>
    button {
        font-family: inherit;
        cursor: pointer;
        /* Transición integral para todas las propiedades visuales y un clic rápido */
        transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease, transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
    }

    button:active:not(:disabled) {
        transform: scale(0.96);
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
    }

    /* Base Estructural (se aplica a todos excepto icon que lo sobrescribe) */
    .btn-pill {
        border-radius: 9999px;
        padding: 0 24px;
        height: 46px;
        font-size: 16px;
        font-weight: 500;
        width: fit-content;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        line-height: 1;
        box-sizing: border-box;
        border: 1.5px solid transparent;
    }

    /* Variantes */
    .btn-primary {
        background-color: var(--bg-inverted, #111827);
        color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
        opacity: 0.85;
    }

    .btn-secondary {
        background-color: transparent;
        color: var(--text-main);
        border-color: var(--text-main);
    }

    .btn-secondary:hover:not(:disabled) {
        background-color: var(--bg-secondary, #f3f4f6);
    }

    .btn-danger {
        background-color: var(--danger-600, #dc2626);
        color: white;
    }
    
    .btn-danger:hover:not(:disabled) {
        background-color: var(--danger-700, #b91c1c);
    }

    .btn-ghost {
        background-color: transparent;
        color: var(--text-main);
    }

    .btn-ghost:hover:not(:disabled) {
        background-color: var(--bg-secondary, #f3f4f6);
    }

    /* Ancho Completo (Adaptable) */
    .btn-full-width {
        width: 100%;
    }

    /* Botón Ícono Redondo */
    .btn-icon {
        background-color: var(--accent-green);
        color: white;
        border: none;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>

