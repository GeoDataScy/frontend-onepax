const API_URL = 'https://onepax-onepax.7y6zlt.easypanel.host';

export interface BriefingRecord {
    id?: number;
    companhia_aerea: string;
    cliente_final: string;
    data: string;           // "DD/MM/AAAA"
    prefixo_aeronave?: string; // máx 50 caracteres, opcional
    numero_voo: number;
    unidade_maritima: string;
    horario: string;        // "HH:MM"
    servico: string;
    solicitante: string;
}

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
}

export const briefingService = {
    async list(): Promise<BriefingRecord[]> {
        const response = await fetch(`${API_URL}/api/briefing/`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar registros de briefing');
        }

        return response.json();
    },

    async create(record: Omit<BriefingRecord, 'id'>): Promise<BriefingRecord> {
        const response = await fetch(`${API_URL}/api/briefing/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(record),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || 'Erro ao criar registro de briefing');
        }

        return response.json();
    },

    async update(id: number, record: Partial<BriefingRecord>): Promise<BriefingRecord> {
        const response = await fetch(`${API_URL}/api/briefing/${id}/`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(record),
        });
        if (!response.ok) throw new Error('Erro ao atualizar registro de briefing');
        return response.json();
    },
};
