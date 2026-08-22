<script lang="ts">
    import type { Snippet } from 'svelte';
    import { Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-svelte';

    let {
        variant = 'info', // 'info', 'warning', 'success', 'danger'
        title = '',
        children
    }: {
        variant?: 'info' | 'warning' | 'success' | 'danger';
        title?: string;
        children: Snippet;
    } = $props();

    const icons = {
        info: Info,
        warning: AlertTriangle,
        success: CheckCircle,
        danger: XCircle
    };
</script>

<div class="alert alert-{variant}">
    <div class="icon">
        <svelte:component this={icons[variant]} size={20} />
    </div>
    <div class="content">
        {#if title}
            <div class="title">{title}</div>
        {/if}
        <div class="body">
            {@render children()}
        </div>
    </div>
</div>

<style>
    .alert {
        display: flex;
        gap: 12px;
        padding: 16px;
        border-radius: 12px;
        border: 1px solid;
        margin-bottom: 20px;
    }

    .icon {
        flex-shrink: 0;
        margin-top: 2px;
    }

    .content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
    }

    .title {
        font-weight: 700;
        font-size: 15px;
    }

    .body {
        font-size: 14px;
        line-height: 1.5;
    }

    /* Variants */
    .alert-info {
        background-color: #f0f9ff;
        border-color: #bae6fd;
        color: #0369a1;
    }

    .alert-warning {
        background-color: #fefce8;
        border-color: #fef08a;
        color: #a16207;
    }

    .alert-success {
        background-color: #f0fdf4;
        border-color: #bbf7d0;
        color: #15803d;
    }

    .alert-danger {
        background-color: #fef2f2;
        border-color: #fecaca;
        color: #b91c1c;
    }
</style>

