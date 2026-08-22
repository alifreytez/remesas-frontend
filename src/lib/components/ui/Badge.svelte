<script lang="ts">
    let {
        text = '',
        variant = 'info' // 'info', 'success', 'warning', 'danger'
    } = $props();
</script>

<span class="badge badge-{variant}">
    {text}
</span>

<style>
    .badge {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        min-width: 85px; /* Ensures ACTIVO and INACTIVO have the same size */
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        white-space: nowrap;
    }

    .badge-info {
        background-color: #e0f2fe; /* Light Blue */
        color: #0284c7;
    }

    .badge-success {
        background-color: #dcfce7; /* Light Green */
        color: #166534;
    }

    .badge-warning {
        background-color: #fef08a; /* Light Yellow */
        color: #a16207;
    }

    .badge-danger {
        background-color: #fee2e2; /* Light Red */
        color: #b91c1c;
    }
</style>

