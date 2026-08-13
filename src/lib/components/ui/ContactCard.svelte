<script lang="ts">
    import { MapPin, Phone, Edit, Trash2 } from 'lucide-svelte';
    import { goto } from '$app/navigation';

    let { 
        id, 
        firstName, 
        lastName, 
        country, 
        phone 
    }: {
        id: string | number;
        firstName: string;
        lastName: string;
        country: string;
        phone: string;
    } = $props();

    function handleEdit() {
        goto(`/client/agenda/${id}`);
    }

    function handleDelete() {
        // Here we'd add delete logic or open a confirmation modal
        console.log(`Delete contact ${id}`);
    }
</script>

<div class="contact-card">
    <div class="card-left">
        <div class="contact-avatar">
            {firstName[0]}{lastName[0]}
        </div>
        <div class="contact-info">
            <div class="contact-name">{firstName} {lastName}</div>
            <div class="contact-meta">
                <span class="meta-item"><MapPin size={12} /> {country || 'N/A'}</span>
                <span class="meta-item"><Phone size={12} /> {phone}</span>
            </div>
        </div>
    </div>
    <div class="card-actions">
        <button class="icon-btn edit-btn" onclick={handleEdit} title="Editar">
            <Edit size={16} />
        </button>
        <button class="icon-btn delete-btn" onclick={handleDelete} title="Eliminar">
            <Trash2 size={16} />
        </button>
    </div>
</div>

<style>
    .contact-card {
        background-color: var(--white);
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-lg);
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
    }

    .card-left {
        display: flex;
        align-items: center;
        gap: 16px;
        flex: 1;
        overflow: hidden;
    }

    .contact-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background-color: var(--primary-600);
        color: var(--white);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 16px;
        flex-shrink: 0;
    }

    .contact-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        overflow: hidden;
    }

    .contact-name {
        font-weight: 600;
        color: var(--gray-900);
        font-size: 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .contact-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--gray-500);
        font-size: 12px;
        flex-wrap: wrap;
    }

    .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
    }

    .card-actions {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: none;
        background-color: var(--gray-50);
        color: var(--gray-500);
        cursor: pointer;
        transition: all 0.2s;
    }

    .icon-btn:hover {
        background-color: var(--gray-200);
        color: var(--gray-900);
    }

    .delete-btn:hover {
        background-color: var(--danger-50);
        color: var(--danger-600);
    }
</style>
