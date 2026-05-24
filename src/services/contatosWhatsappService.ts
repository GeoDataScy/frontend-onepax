const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface ContatoWhatsapp {
  id: number;
  nome: string;
  telefone: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export type ContatoWhatsappInput = {
  nome: string;
  telefone: string;
  ativo?: boolean;
};

const BASE = `${API_URL}/api/central-analise/contatos-whatsapp/`;
const RELATORIO_URL = `${API_URL}/api/central-analise/relatorio-diario/`;

export interface RelatorioDiario {
  data: string;
  texto: string;
  dados: {
    data: string;
    total_passageiros: number;
    total_embarques_pax: number;
    total_desembarques_pax: number;
    voos_embarque: number;
    voos_desembarque: number;
    por_operadora: Record<string, number>;
    por_cliente_final: Record<string, number>;
  };
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.detail === "string") return body.detail;
    if (body?.detail && typeof body.detail === "object") {
      const first = Object.values(body.detail).flat()[0];
      if (typeof first === "string") return first;
    }
  } catch {
    // ignore
  }
  return `Erro ${res.status}`;
}

export const contatosWhatsappService = {
  async list(): Promise<ContatoWhatsapp[]> {
    const res = await fetch(BASE, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    return res.json();
  },

  async create(data: ContatoWhatsappInput): Promise<ContatoWhatsapp> {
    const res = await fetch(BASE, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    return res.json();
  },

  async update(id: number, data: Partial<ContatoWhatsappInput>): Promise<ContatoWhatsapp> {
    const res = await fetch(`${BASE}${id}/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    return res.json();
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${BASE}${id}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
  },

  async getRelatorioDiario(data?: string): Promise<RelatorioDiario> {
    const url = data ? `${RELATORIO_URL}?data=${encodeURIComponent(data)}` : RELATORIO_URL;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    return res.json();
  },
};
