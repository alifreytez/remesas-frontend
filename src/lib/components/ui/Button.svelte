<script lang="ts">
    import type { Snippet } from 'svelte';

    let {
        variant = 'primary', // 'primary' | 'outline' | 'icon'
        type = 'button',
        onclick,
        disabled = false,
        fullWidth = false,
        children,
        class: className = '',
        style = ''
    }: {
        variant?: 'primary' | 'outline' | 'icon';
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
    class="btn-pill {variant === 'outline' ? 'btn-pill-outline' : ''} {variant === 'icon' ? 'btn-icon' : ''} {fullWidth ? 'btn-full-width' : ''} {className}"
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
        transition: opacity 0.2s, transform 0.1s;
    }

    button:active:not(:disabled) {
        transform: scale(0.98);
    }

    button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        pointer-events: none;
    }

    /* Botón Primario Píldora */
    .btn-pill {
        background-color: var(--bg-inverted);
        color: white;
        border: 1.5px solid transparent;
        border-radius: 9999px;
        padding: 12px 24px;
        font-size: 16px;
        font-weight: 500;
        width: fit-content;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        line-height: 1;
    }

    /* Botón Secundario Outline */
    .btn-pill-outline {
        background-color: transparent;
        color: var(--text-main);
        border: 1.5px solid var(--text-main);
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
