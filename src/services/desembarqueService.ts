const API_URL = 'https://onepax-onepax.7y6zlt.easypanel.host';

export interface DesembarqueRecord {
    id?: number;
    flight_number: string;
    aeronave: string;
    operadora: string;
    arrival_date: string;
    arrival_time: string;
    origin: string;
    cliente_final: string;
    passengers_disembarked: number;
    observacao: string;
}

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
}

export const desembarqueService = {
    async list(): Promise<DesembarqueRecord[]> {
        const response = await fetch(`${API_URL}/api/desembarque/`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Erro ao buscar registros de desembarque');
        return response.json();
    },

    async update(id: number, record: Partial<DesembarqueRecord>): Promise<DesembarqueRecord> {
        const response = await fetch(`${API_URL}/api/desembarque/${id}/`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(record),
        });
        if (!response.ok) throw new Error('Erro ao atualizar registro de desembarque');
        return response.json();
    },
};
