<script lang="ts">
    let {
        label = '',
        placeholder = '',
        value = $bindable(''),
        disabled = false,
        rows = 4
    } = $props();
</script>

<div class="input-group">
    {#if label}
        <label>{label}</label>
    {/if}
    <textarea {placeholder} bind:value {disabled} {rows}></textarea>
</div>

<style>
    .input-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
    }

    label {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-main);
    }

    textarea {
        font-family: inherit;
        background-color: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 14px 16px;
        font-size: 14px;
        color: var(--text-main);
        outline: none;
        resize: vertical;
        min-height: 100px; /* Instead of fixed rows or height */
        transition: border-color 0.2s, background-color 0.2s;
    }

    textarea:focus {
        border-color: var(--text-main);
        background-color: var(--bg-primary);
    }

    textarea:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
