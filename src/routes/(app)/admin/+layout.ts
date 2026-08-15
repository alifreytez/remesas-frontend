import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/stores/auth.svelte';

export const load = async () => {
    // If not authenticated, redirect to login
    if (!auth.isAuthenticated) {
        throw redirect(302, '/');
    }

    // Await the permissions fetch if they haven't been loaded yet
    if (auth.permissions.length === 0 && auth.roles.length === 0) {
        await auth.fetchPermissions();
    }

    // Check if the user has the 'ADMIN' type to even access the admin ecosystem.
    if (auth.user?.type !== 'ADMIN') {
        throw redirect(302, '/client/home');
    }

    return {};
};
