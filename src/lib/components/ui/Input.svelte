<script lang="ts">
    let {
        label = '',
        placeholder = '',
        type = 'text',
        value = $bindable(''),
        disabled = false
    } = $props();
</script>

<div class="input-group">
    {#if label}
        <label>{label}</label>
    {/if}
    <input {type} {placeholder} bind:value {disabled} />
</div>

<style>
    .input-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        margin-bottom: 16px;
    }

    label {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-main);
    }

    input {
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

    input:focus {
        border-color: var(--text-main);
        background-color: var(--bg-primary);
    }

    input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
