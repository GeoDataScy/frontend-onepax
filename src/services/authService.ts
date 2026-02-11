const API_URL = 'https://onepax-onepax.7y6zlt.easypanel.host';

export interface LoginResponse {
    access: string;
    refresh: string;
    role: string;
    username: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
}

export const authService = {
    /**
     * Faz login e retorna os tokens JWT
     */
    async login(username: string, password: string): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/api/token/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Erro ao fazer login');
        }

        const data = await response.json();

        // Salvar tokens no localStorage
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        return data;
    },

    /**
     * Busca dados do usuário autenticado
     */
    async getCurrentUser(): Promise<User> {
        const token = localStorage.getItem('access_token');

        if (!token) {
            throw new Error('Token não encontrado');
        }

        const response = await fetch(`${API_URL}/api/auth/me/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar dados do usuário');
        }

        return response.json();
    },

    /**
     * Atualiza o access token usando o refresh token
     */
    async refreshToken(): Promise<string> {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
            throw new Error('Refresh token não encontrado');
        }

        const response = await fetch(`${API_URL}/api/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            this.logout();
            throw new Error('Sessão expirada');
        }

        const data = await response.json();
        localStorage.setItem('access_token', data.access);

        return data.access;
    },

    /**
     * Faz logout removendo os tokens
     */
    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },

    /**
     * Verifica se o usuário está autenticado
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('access_token');
    },

    /**
     * Retorna o token de acesso
     */
    getAccessToken(): string | null {
        return localStorage.getItem('access_token');
    },
};
