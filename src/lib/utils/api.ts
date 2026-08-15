/**
 * api.ts
 * Wrapper nativo sobre fetch para consumo estandarizado de la API del Backend.
 * Implementa la inyección automática del token de autorización y manejo centralizado de errores.
 */
import { auth } from '../stores/auth.svelte';
import { PUBLIC_API_URL } from '$env/static/public';

const API_BASE_URL = PUBLIC_API_URL;

type FetchOptions = RequestInit & {
    headers?: Record<string, string>;
};

class ApiError extends Error {
    public status: number;
    public data: any;
    
    constructor(status: number, message: string, data?: any) {
        super(message);
        this.status = status;
        this.data = data;
        this.name = 'ApiError';
    }
}

function getDeviceId(): string {
    if (typeof window === 'undefined') return ''; // Evitar error en SSR
    
    let deviceId = localStorage.getItem('x-device-id');
    if (!deviceId) {
        deviceId = (crypto.randomUUID && crypto.randomUUID()) || 
                   Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('x-device-id', deviceId);
    }
    return deviceId;
}

async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = new Headers(options.headers);
    
    // Inyección del token si está autenticado
    if (auth.isAuthenticated && auth.token) {
        headers.set('Authorization', `Bearer ${auth.token}`);
    }
    
    // Cabeceras por defecto
    headers.set('Content-Type', 'application/json');
    // Cabecera clave para que el backend nos devuelva el token en JSON y no asuma uso de cookies
    headers.set('x-client-channel', 'app'); 
    
    // Inyección del ID del dispositivo
    const deviceId = getDeviceId();
    if (deviceId) {
        headers.set('x-device-id', deviceId);
    }
    
    const config: RequestInit = {
        ...options,
        headers
    };

    try {
        const response = await fetch(url, config);
        
        // Manejar respuesta 204 No Content
        if (response.status === 204) {
            return null as unknown as T;
        }

        const data = await response.json();

        if (!response.ok) {
            // Manejo global de expiración de sesión (Unauthorized)
            if (response.status === 401) {
                if (endpoint !== '/auth/refresh' && !window.location.pathname.startsWith('/forgot')) {
                    if (auth.refreshToken) {
                        try {
                            const newToken = await auth.doRefresh();
                            // Reintentar la petición original con el nuevo token
                            headers.set('Authorization', `Bearer ${newToken}`);
                            const retryResponse = await fetch(url, { ...config, headers });
                            
                            if (retryResponse.status === 204) return null as unknown as T;
                            const retryData = await retryResponse.json();
                            if (!retryResponse.ok) throw new ApiError(retryResponse.status, retryData.message || 'Error en reintento', retryData);
                            return retryData as T;
                        } catch (refreshErr) {
                            // Si falla el refresh, cerramos sesión definitivamente
                            auth.logout();
                            if (window.location.pathname !== '/login') window.location.href = '/login';
                            throw new ApiError(401, 'Sesión expirada. Por favor, inicia sesión nuevamente.', refreshErr);
                        }
                    } else {
                        // Si no hay refresh token, cerramos sesión directo
                        auth.logout();
                        if (window.location.pathname !== '/login') {
                            window.location.href = '/login';
                        }
                    }
                }
            }
            
            throw new ApiError(
                response.status, 
                data.message || 'Error en la petición', 
                data
            );
        }

        return data as T;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // Error de red (CORS, backend caído, etc)
        throw new ApiError(0, 'No se pudo conectar con el servidor', error);
    }
}

export const api = {
    get: <T>(endpoint: string, options?: FetchOptions) => request<T>(endpoint, { ...options, method: 'GET' }),
    post: <T>(endpoint: string, body: any, options?: FetchOptions) => request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
    patch: <T>(endpoint: string, body: any, options?: FetchOptions) => request<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
    delete: <T>(endpoint: string, options?: FetchOptions) => request<T>(endpoint, { ...options, method: 'DELETE' }),
};
