<script lang="ts">
    import { auth } from '$lib/stores/auth.svelte';
    import type { Snippet } from 'svelte';
    
    let { 
        permission, 
        permissions, 
        role, 
        children 
    }: {
        /** Permiso único requerido. Ej: 'UI:VIEW:DASHBOARD' */
        permission?: string;
        /** Array de permisos (el usuario debe tener AL MENOS UNO). Ej: ['UI:EDIT:USERS', 'UI:DELETE:USERS'] */
        permissions?: string[];
        /** Rol específico requerido. Ej: 'ADMIN' */
        role?: string;
        /** Contenido a renderizar si se cumple la autorización */
        children?: Snippet;
    } = $props();

    let hasAccess = $derived.by(() => {
        // Si no está autenticado, no hay acceso.
        if (!auth.isAuthenticated) return false;
        
        // Si se proveen condiciones de acceso, se asume 'no autorizado' hasta probar lo contrario,
        // pero si no se provee ninguna, es un pass-through (valid = true).
        // Sin embargo, normalmente se proveerá al menos uno.
        let isAuthorized = true;
        let conditionsChecked = false;
        
        if (permission) {
            conditionsChecked = true;
            if (!auth.hasPermission(permission)) {
                isAuthorized = false;
            }
        }
        
        if (isAuthorized && permissions && permissions.length > 0) {
            conditionsChecked = true;
            if (!auth.hasAnyPermission(permissions)) {
                isAuthorized = false;
            }
        }
        
        if (isAuthorized && role) {
            conditionsChecked = true;
            if (!auth.hasRole(role)) {
                isAuthorized = false;
            }
        }
        
        // Si no se proveyó ninguna regla de permiso (raro), se permite. 
        // Si se proveyó al menos una y isAuthorized sigue siendo true, se permite.
        return conditionsChecked ? isAuthorized : true;
    });
</script>

{#if hasAccess}
    {@render children?.()}
{/if}
