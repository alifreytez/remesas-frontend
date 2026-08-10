<script lang="ts">
    let {
        checked = $bindable(false),
        disabled = false,
        onchange
    }: {
        checked?: boolean;
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
    class="switch {checked ? 'checked' : ''} {disabled ? 'disabled' : ''}" 
    onclick={toggle}
    role="switch"
    aria-checked={checked}
    tabindex="0"
>
    <div class="thumb"></div>
</div>

<style>
    .switch {
        position: relative;
        width: 44px;
        height: 24px;
        background-color: var(--text-muted);
        border-radius: 20px;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
        display: inline-flex;
        align-items: center;
        padding: 2px;
        box-sizing: border-box;
    }

    .switch.checked {
        background-color: var(--accent-purple);
    }

    .switch.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .thumb {
        width: 20px;
        height: 20px;
        background-color: white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: transform 0.2s ease-in-out;
        transform: translateX(0);
    }

    .switch.checked .thumb {
        transform: translateX(20px);
    }
</style>
