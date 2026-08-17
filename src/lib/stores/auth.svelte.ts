import { browser } from '$app/environment';
import { api } from '../utils/api';

interface UserData {
    id: string;
    email: string;
    [key: string]: any;
}

class AuthStore {
    user = $state<UserData | null>(null);
    token = $state<string | null>(null);
    refreshToken = $state<string | null>(null);
    roles = $state<string[]>([]);
    permissions = $state<string[]>([]);
    
    isAuthenticated = $derived(!!this.token);

    constructor() {
        if (browser) {
            const savedToken = localStorage.getItem('auth_token');
            const savedRefreshToken = localStorage.getItem('auth_refresh_token');
            const savedUser = localStorage.getItem('auth_user');
            
            if (savedToken && savedUser) {
                try {
                    this.token = savedToken;
                    this.refreshToken = savedRefreshToken;
                    this.user = JSON.parse(savedUser);
                    // Fetch permissions in background to hydrate roles and permissions
                    // Usamos setTimeout para evitar dependencias circulares de inicialización con api.ts
                    setTimeout(() => {
                        this.fetchPermissions();
                    }, 0);
                } catch (e) {
                    console.error('Error parseando datos de sesión', e);
                    this.logout();
                }
            }
        }
    }

    async fetchPermissions() {
        if (!this.token) return;
        try {
            // Set header manually just in case the api interceptor is not picking up the token in time
            const response = await api.get<{ data: { roles: any[], permissions: any[] } }>('/users/me/permissions', {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            });
            
            this.roles = (response.data.roles || []).map((r: any) => typeof r === 'string' ? r.toUpperCase() : (r.code || r.name || '').toUpperCase());
            this.permissions = (response.data.permissions || []).map((p: any) => typeof p === 'string' ? p.toUpperCase() : (p.code || p.name || '').toUpperCase());
        } catch (error) {
            console.error('Error fetching permissions', error);
        }
    }

    async login(credentials: { username: string; password: string }) {
        const response = await api.post<{ data: { user: UserData, tokens?: { accessToken: string, refreshToken: string } } }>('/auth/login', credentials);
        
        const backendUser = response.data.user;
        const accessToken = response.data.tokens?.accessToken;
        const refreshTk = response.data.tokens?.refreshToken;

        if (!accessToken) {
            throw new Error('La API no devolvió un accessToken. Revisa la cabecera x-client-channel');
        }

        this.user = backendUser;
        this.token = accessToken;
        this.refreshToken = refreshTk || null;

        if (browser) {
            localStorage.setItem('auth_token', this.token);
            if (this.refreshToken) {
                localStorage.setItem('auth_refresh_token', this.refreshToken);
            }
            localStorage.setItem('auth_user', JSON.stringify(this.user));
        }

        await this.fetchPermissions();
    }

    private refreshPromise: Promise<string> | null = null;

    async doRefresh(): Promise<string> {
        if (!this.refreshToken) {
            console.error('[AuthStore] No refresh token available in state');
            throw new Error('No refresh token available');
        }

        if (this.refreshPromise) {
            console.log('[AuthStore] Returning cached refresh promise');
            return this.refreshPromise;
        }

        console.log('[AuthStore] Starting token refresh request');
        this.refreshPromise = (async () => {
            try {
                const response = await api.post<{ data: { user: UserData, tokens?: { accessToken: string, refreshToken: string } } }>('/auth/refresh', {
                    refreshToken: this.refreshToken
                });

                console.log('[AuthStore] Refresh response successful');
                const accessToken = response.data?.tokens?.accessToken;
                const newRefreshTk = response.data?.tokens?.refreshToken;

                if (accessToken) {
                    this.token = accessToken;
                    if (newRefreshTk) this.refreshToken = newRefreshTk;
                    
                    if (browser) {
                        localStorage.setItem('auth_token', this.token);
                        if (this.refreshToken) {
                            localStorage.setItem('auth_refresh_token', this.refreshToken);
                        }
                    }
                    console.log('[AuthStore] Token refreshed successfully');
                    return accessToken;
                }
                
                console.error('[AuthStore] API returned success but accessToken is missing in payload', response.data);
                throw new Error('Failed to refresh token: missing accessToken in payload');
            } catch (err) {
                console.error('[AuthStore] Error during api.post(/auth/refresh):', err);
                throw err;
            } finally {
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    }

    logout() {
        this.user = null;
        this.token = null;
        this.refreshToken = null;
        this.roles = [];
        this.permissions = [];
        if (browser) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_refresh_token');
            localStorage.removeItem('auth_user');
        }
    }

    hasPermission(permission: string): boolean {
        if (this.hasRole('SUPERADMIN')) return true;
        return this.permissions.includes(permission.toUpperCase());
    }

    hasAnyPermission(permissions: string[]): boolean {
        return permissions.some(p => this.hasPermission(p));
    }

    hasRole(role: string): boolean {
        return this.roles.includes(role.toUpperCase());
    }
}

export const auth = new AuthStore();
