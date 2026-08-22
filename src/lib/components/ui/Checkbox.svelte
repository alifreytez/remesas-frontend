<script lang="ts">
    import { Check } from 'lucide-svelte';

    let {
        checked = $bindable(false),
        label = '',
        disabled = false,
        onchange
    }: {
        checked?: boolean;
        label?: string;
        disabled?: boolean;
        onchange?: (checked: boolean) => void;
    } = $props();

    function toggle() {
        if (!disabled) {
            checked = !checked;
            if (onchange) onchange(checked);
        }
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
    class="checkbox-wrapper {disabled ? 'disabled' : ''}" 
    onclick={toggle}
>
    <div class="checkbox {checked ? 'checked' : ''}" role="checkbox" aria-checked={checked} tabindex="0">
        {#if checked}
            <Check size={14} color="white" strokeWidth={3} />
        {/if}
    </div>
    {#if label}
        <span class="label-text">{label}</span>
    {/if}
</div>

<style>
    .checkbox-wrapper {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        user-select: none;
    }
    
    .checkbox-wrapper.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .checkbox {
        width: 20px;
        height: 20px;
        border-radius: 6px;
        border: 2px solid var(--gray-300, #cbd5e1);
        background-color: var(--white, #ffffff);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease-in-out;
        flex-shrink: 0;
    }

    .checkbox.checked {
        background-color: var(--accent-purple, #8b5cf6);
        border-color: var(--accent-purple, #8b5cf6);
    }

    .label-text {
        font-size: var(--text-sm, 14px);
        font-weight: 500;
        color: var(--text-main, #1e293b);
    }
</style>
