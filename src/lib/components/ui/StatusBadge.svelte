<script lang="ts">
    let { status = '' } = $props<{ status: string }>();

    let badgeClass = $derived.by(() => {
        const s = status.toLowerCase();
        if (s.includes('completada') || s.includes('aprobada')) return 'badge-success';
        if (s.includes('cancelada') || s.includes('rechazada') || s.includes('devuelta')) return 'badge-danger';
        if (s.includes('proceso') || s.includes('pendiente')) return 'badge-warning';
        return 'badge-info';
    });
</script>

<span class="status-badge {badgeClass}">
    {status}
</span>

<style>
    .status-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 6px 14px;
        border-radius: 9999px; /* Pill shape */
        font-size: 13px;
        font-weight: 700;
        white-space: nowrap;
        text-transform: capitalize;
    }

    .badge-success {
        background-color: #ecfdf5; /* emerald-50 */
        color: #047857; /* emerald-700 */
    }

    .badge-danger {
        background-color: #fef2f2; /* red-50 */
        color: #b91c1c; /* red-700 */
    }

    .badge-warning {
        background-color: #fffbeb; /* amber-50 */
        color: #b45309; /* amber-700 */
    }

    .badge-info {
        background-color: #eff6ff; /* blue-50 */
        color: #1d4ed8; /* blue-700 */
    }
</style>


