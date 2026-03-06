const API_URL = import.meta.env.VITE_API_URL;

export interface EmbarqueRecord {
    id?: number;
    flight_number: string;
    aeronave: string;
    operadora: string;
    departure_date: string;
    departure_time: string;
    platform: string;
    icao: string;
    cliente_final: string;
    passengers_boarded: number;
    observacao: string;
}

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
}

export const embarqueService = {
    async list(): Promise<EmbarqueRecord[]> {
        const response = await fetch(`${API_URL}/api/embarque/`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Erro ao buscar registros de embarque');
        return response.json();
    },

    async create(record: Omit<EmbarqueRecord, 'id'>): Promise<EmbarqueRecord> {
        const response = await fetch(`${API_URL}/api/embarque/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(record),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || 'Erro ao criar registro de embarque');
        }
        return response.json();
    },

    async update(id: number, record: Partial<EmbarqueRecord>): Promise<EmbarqueRecord> {
        const response = await fetch(`${API_URL}/api/embarque/${id}/`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(record),
        });
        if (!response.ok) throw new Error('Erro ao atualizar registro de embarque');
        return response.json();
    },

    async delete(id: number): Promise<void> {
        const response = await fetch(`${API_URL}/api/embarque/${id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Erro ao deletar registro de embarque');
    },
};
