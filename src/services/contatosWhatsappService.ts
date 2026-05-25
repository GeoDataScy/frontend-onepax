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
const RELATORIO_MENSAL_URL = `${API_URL}/api/central-analise/relatorio-mensal/`;
const RELATORIO_MENSAL_RESUMO_URL = `${API_URL}/api/central-analise/relatorio-mensal-resumo/`;
const CONFIGURACAO_URL = `${API_URL}/api/central-analise/configuracao/`;

export interface RelatorioMensalResumo {
  ano: number;
  mes: number;
  mes_extenso: string;
  totais: {
    pax: number;
    pax_embarcados: number;
    pax_desembarcados: number;
    voos: number;
    voos_embarque: number;
    voos_desembarque: number;
    pax_por_voo: number;
  };
  comparativo: {
    mes_anterior_extenso: string;
    delta_pax_pct: number | null;
    delta_voos_pct: number | null;
  };
  insights: string[];
}

export interface ConfiguracaoRelatorio {
  horario_envio_diario: string | null;
  atualizado_em: string;
}

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

  async getRelatorioMensalResumo(ano?: number, mes?: number): Promise<RelatorioMensalResumo> {
    const params = new URLSearchParams();
    if (ano) params.set("ano", String(ano));
    if (mes) params.set("mes", String(mes));
    const qs = params.toString();
    const url = qs ? `${RELATORIO_MENSAL_RESUMO_URL}?${qs}` : RELATORIO_MENSAL_RESUMO_URL;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    return res.json();
  },

  /**
   * Baixa o PDF do relatório mensal. Dispara o download no navegador.
   * Retorna o nome do arquivo + mes por extenso (do header X-Onepax-Mes-Extenso).
   */
  async baixarRelatorioMensalPdf(ano: number, mes: number): Promise<{ filename: string; mesExtenso: string | null }> {
    const url = `${RELATORIO_MENSAL_URL}?ano=${ano}&mes=${mes}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await parseErrorMessage(res));

    const blob = await res.blob();
    const filename = `onepax_relatorio_${ano}_${String(mes).padStart(2, "0")}.pdf`;
    const mesExtenso = res.headers.get("X-Onepax-Mes-Extenso");

    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

    return { filename, mesExtenso };
  },

  async getConfiguracao(): Promise<ConfiguracaoRelatorio> {
    const res = await fetch(CONFIGURACAO_URL, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    return res.json();
  },

  async updateConfiguracao(data: Partial<{ horario_envio_diario: string | null }>): Promise<ConfiguracaoRelatorio> {
    const res = await fetch(CONFIGURACAO_URL, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    return res.json();
  },
};
