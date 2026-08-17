import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { auth } from '$lib/stores/auth.svelte';
import { USER_TYPES } from '$lib/constants/auth';

export const load = async () => {
    if (browser) {
        if (!auth.isAuthenticated) {
            throw redirect(302, '/login');
        }
        if (auth.user?.userType === USER_TYPES.ADMIN) {
            throw redirect(302, '/admin/home');
        } else {
            throw redirect(302, '/client/home');
        }
    }
    
    // Fallback if not running in browser
    throw redirect(302, '/client/home');
};
