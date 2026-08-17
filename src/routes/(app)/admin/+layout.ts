import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/stores/auth.svelte';
import { USER_TYPES } from '$lib/constants/auth';

export const load = async () => {
    // If not authenticated, redirect to login
    if (!auth.isAuthenticated) {
        throw redirect(302, '/');
    }

    // Await the permissions fetch if they haven't been loaded yet
    if (auth.permissions.length === 0 && auth.roles.length === 0) {
        await auth.fetchPermissions();
    }

    // Check if the user has the 'Administrador' type to even access the admin ecosystem.
    if (auth.user?.userType !== USER_TYPES.ADMIN) {
        throw redirect(302, '/client/home');
    }

    return {};
};
