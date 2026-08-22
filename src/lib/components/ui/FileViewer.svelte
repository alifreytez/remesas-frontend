<script lang="ts">
    import { UploadCloud, FileImage } from 'lucide-svelte';

    let {
        label = 'Subir Comprobante',
        imageUrl = '',
        disabled = false
    } = $props();
</script>

<div class="file-uploader {disabled ? 'disabled' : ''}">
    {#if imageUrl}
        <div class="image-viewer">
            <img src={imageUrl} alt="Comprobante" />
            {#if !disabled}
                <button class="remove-btn">Cambiar</button>
            {/if}
        </div>
    {:else}
        <div class="upload-placeholder">
            <UploadCloud size={32} color="var(--text-muted)" />
            <p class="upload-text">{label}</p>
            <p class="upload-subtext">Arrastra el archivo o haz clic para buscar</p>
            <!-- Input file oculto interactivo -->
            <input type="file" {disabled} accept="image/*,application/pdf" />
        </div>
    {/if}
</div>

<style>
    .file-uploader {
        width: 100%;
        border: 2px dashed var(--border-color);
        border-radius: 12px;
        background-color: var(--bg-secondary);
        position: relative;
        overflow: hidden;
        transition: border-color 0.2s, background-color 0.2s;
    }

    .file-uploader:hover:not(.disabled) {
        border-color: var(--accent-purple);
        background-color: var(--bg-primary);
    }

    .file-uploader.disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .upload-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        text-align: center;
        position: relative;
    }

    .upload-placeholder input[type="file"] {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
    }

    .upload-text {
        font-weight: 600;
        color: var(--text-main);
        margin-top: 12px;
        font-size: 15px;
    }

    .upload-subtext {
        font-size: 13px;
        color: var(--text-muted);
        margin-top: 4px;
    }

    .image-viewer {
        width: 100%;
        height: 200px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #000;
    }

    .image-viewer img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }

    .remove-btn {
        position: absolute;
        bottom: 16px;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
</style>

