const API_URL = 'https://onepax-onepax.7y6zlt.easypanel.host';

export interface TransporteRecord {
    id?: number;
    empresa_solicitante: string;
    cliente_final: string;
    data: string;
    numero_voo: number;
    prefixo_aeronave: string;
    prefixo_manual: string;
    horario: string;
    servico: string;
}

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
}

export const transporteService = {
    async list(): Promise<TransporteRecord[]> {
        const response = await fetch(`${API_URL}/api/transporte/`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Erro ao buscar registros de transporte');
        return response.json();
    },

    async create(record: Omit<TransporteRecord, 'id'>): Promise<TransporteRecord> {
        const response = await fetch(`${API_URL}/api/transporte/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(record),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || 'Erro ao criar registro de transporte');
        }
        return response.json();
    },

    async update(id: number, record: Partial<TransporteRecord>): Promise<TransporteRecord> {
        const response = await fetch(`${API_URL}/api/transporte/${id}/`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(record),
        });
        if (!response.ok) throw new Error('Erro ao atualizar registro de transporte');
        return response.json();
    },
};
