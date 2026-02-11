const API_URL = 'https://onepax-onepax.7y6zlt.easypanel.host';

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

    async update(id: number, record: Partial<EmbarqueRecord>): Promise<EmbarqueRecord> {
        const response = await fetch(`${API_URL}/api/embarque/${id}/`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(record),
        });
        if (!response.ok) throw new Error('Erro ao atualizar registro de embarque');
        return response.json();
    },
};
