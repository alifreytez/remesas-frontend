import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/stores/auth.svelte';

export const load = async () => {
    if (browser) {
        // En CSR puro, el store AuthStore ya se inicializó leyendo localStorage
        if (!auth.isAuthenticated) {
            throw redirect(302, '/login');
        }
    }
    
    return {};
};
