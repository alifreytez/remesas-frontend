import { browser } from '$app/environment';
import { api } from '../utils/api';

type UserRole = 'ADMIN' | 'CLIENT' | null;

interface UserData {
    id: string;
    email: string;
    role: UserRole; 
    [key: string]: any;
}

class AuthStore {
    user = $state<UserData | null>(null);
    token = $state<string | null>(null);
    isAuthenticated = $derived(!!this.token);

    constructor() {
        // Inicializar el store desde localStorage solo si estamos en el cliente
        if (browser) {
            const savedToken = localStorage.getItem('auth_token');
            const savedUser = localStorage.getItem('auth_user');
            
            if (savedToken && savedUser) {
                try {
                    this.token = savedToken;
                    this.user = JSON.parse(savedUser);
                } catch (e) {
                    console.error('Error parseando datos de sesión', e);
                    this.logout();
                }
            }
        }
    }

    async login(credentials: { username: string; password: string }) {
        // Invocamos el API. Nota: ajustaremos el tipo de respuesta a la estructura de la api real
        // Como indicaste, la API por ahora no devuelve rol, lo "simularemos"
        const response = await api.post<{ data: { user: UserData, tokens?: { accessToken: string } } }>('/auth/login', credentials);
        
        const backendUser = response.data.user;
        const accessToken = response.data.tokens?.accessToken;

        if (!accessToken) {
            throw new Error('La API no devolvió un accessToken. Revisa la cabecera x-client-channel');
        }

        // Simulación de roles "en caliente" (Si el username contiene admin es ADMIN, si no CLIENT)
        const computedRole: UserRole = (backendUser.username || backendUser.email)?.includes('admin') ? 'ADMIN' : 'CLIENT';

        this.user = { ...backendUser, role: computedRole };
        this.token = accessToken;

        if (browser) {
            localStorage.setItem('auth_token', this.token);
            localStorage.setItem('auth_user', JSON.stringify(this.user));
        }
    }

    logout() {
        this.user = null;
        this.token = null;
        if (browser) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
        }
    }
}

// Exportamos un singleton
export const auth = new AuthStore();
