import { redirect } from '@sveltejs/kit';

export const load = async () => {
    // Redirige siempre la ruta principal (/) hacia el layout privado
    // El guardia de rutas en (app)/+layout.ts se encargará de enviarlo a /login si no está autenticado
    throw redirect(302, '/client/home');
};
