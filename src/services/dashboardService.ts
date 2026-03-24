const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface FiltrosData {
  operadoras: string[];
  clientes_finais: string[];
  tipos_icao: string[];
  aeronaves: string[];
}

export interface PassageirosKpis {
  total_passageiros: number;
  total_decolagens: number;
  total_pousos: number;
}

export interface PassageirosDiario {
  date: string;
  embarque: number;
  desembarque: number;
}

export interface TabelaOperadora {
  operadora: string;
  meses: Record<string, number>;
  total_por_ano: Record<string, number>;
  total_geral: number;
}

export interface DashboardPassageirosData {
  kpis: PassageirosKpis;
  diario: PassageirosDiario[];
  tabela_operadoras: TabelaOperadora[];
}

export interface EmpresaMes {
  mes: string;
  empresas: Record<string, number>;
}

export interface MediaDiariaMes {
  mes: string;
  media: number;
}

export interface TabelaClienteMes {
  mes: string;
  clientes: Record<string, number>;
}

export interface DashboardOperacionalData {
  por_empresa_mes: EmpresaMes[];
  media_diaria_mes: MediaDiariaMes[];
  tabela_clientes: TabelaClienteMes[];
}

// Normaliza nomes inconsistentes do banco (acentos, caixa, typos)
const NOME_MAPA: Record<string, string> = {
  'bristow taxi aereo': 'Bristow',
  'bristow táxi aéreo': 'Bristow',
  'bristow táxi aereo': 'Bristow',
  'lider taxi aereo': 'Lider',
  'lider táxi aéreo': 'Lider',
  'lider taxi aéreo': 'Lider',
  'líder táxi aéreo': 'Lider',
  'lidder taxi aereo': 'Lider',
  'chc taxi aereo': 'CHC',
  'chc táxi aéreo': 'CHC',
  'chc táxi aereo': 'CHC',
  'omni taxi aereo': 'Omni',
  'omni táxi aéreo': 'Omni',
  'petrobras': 'Petrobras',
  'prio': 'Prio',
};

function normalizeName(name: string): string {
  return NOME_MAPA[name.toLowerCase().trim()] || name;
}

function mergeByNormalizedKey(obj: Record<string, number>): Record<string, number> {
  const merged: Record<string, number> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (!key) continue;
    const norm = normalizeName(key);
    merged[norm] = (merged[norm] || 0) + val;
  }
  return merged;
}

function normalizePassageirosData(data: DashboardPassageirosData): DashboardPassageirosData {
  const merged: Record<string, TabelaOperadora> = {};
  for (const row of data.tabela_operadoras) {
    const norm = normalizeName(row.operadora);
    if (!merged[norm]) {
      merged[norm] = { operadora: norm, meses: {}, total_por_ano: {}, total_geral: 0 };
    }
    for (const [m, v] of Object.entries(row.meses)) {
      merged[norm].meses[m] = (merged[norm].meses[m] || 0) + v;
    }
    for (const [y, v] of Object.entries(row.total_por_ano)) {
      merged[norm].total_por_ano[y] = (merged[norm].total_por_ano[y] || 0) + v;
    }
    merged[norm].total_geral += row.total_geral;
  }
  return { ...data, tabela_operadoras: Object.values(merged).sort((a, b) => a.operadora.localeCompare(b.operadora)) };
}

function normalizeOperacionalData(data: DashboardOperacionalData): DashboardOperacionalData {
  return {
    por_empresa_mes: data.por_empresa_mes.map((item) => ({
      mes: item.mes,
      empresas: mergeByNormalizedKey(item.empresas),
    })),
    media_diaria_mes: data.media_diaria_mes,
    tabela_clientes: data.tabela_clientes.map((item) => ({
      mes: item.mes,
      clientes: mergeByNormalizedKey(item.clientes),
    })),
  };
}

function normalizeFiltros(data: FiltrosData): FiltrosData {
  const unique = (arr: string[]) => [...new Set(arr.map(normalizeName).filter(Boolean))].sort();
  return {
    operadoras: unique(data.operadoras),
    clientes_finais: unique(data.clientes_finais),
    tipos_icao: data.tipos_icao.filter(Boolean).sort(),
    aeronaves: data.aeronaves.filter(Boolean).sort(),
  };
}

function buildQuery(params: Record<string, string | string[] | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!value) continue;
    if (Array.isArray(value) && value.length > 0) {
      searchParams.set(key, value.join(','));
    } else if (typeof value === 'string' && value.length > 0) {
      searchParams.set(key, value);
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export const dashboardService = {
  async getFiltros(): Promise<FiltrosData> {
    const res = await fetch(`${API_URL}/api/central-analise/dashboard/filtros/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Erro ao carregar filtros');
    const data = await res.json();
    return normalizeFiltros(data);
  },

  async getPassageiros(filters?: {
    data_inicio?: string;
    data_fim?: string;
    operadora?: string[];
    cliente_final?: string[];
    servico?: string;
    aeronave?: string[];
  }): Promise<DashboardPassageirosData> {
    const query = buildQuery({
      data_inicio: filters?.data_inicio,
      data_fim: filters?.data_fim,
      operadora: filters?.operadora,
      cliente_final: filters?.cliente_final,
      servico: filters?.servico,
      aeronave: filters?.aeronave,
    });
    const res = await fetch(`${API_URL}/api/central-analise/dashboard/passageiros/${query}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Erro ao carregar dashboard passageiros');
    const data = await res.json();
    return normalizePassageirosData(data);
  },

  async getOperacional(filters?: {
    data_inicio?: string;
    data_fim?: string;
    empresa?: string[];
    cliente_final?: string[];
    icao?: string[];
  }): Promise<DashboardOperacionalData> {
    const query = buildQuery({
      data_inicio: filters?.data_inicio,
      data_fim: filters?.data_fim,
      empresa: filters?.empresa,
      cliente_final: filters?.cliente_final,
      icao: filters?.icao,
    });
    const res = await fetch(`${API_URL}/api/central-analise/dashboard/operacional/${query}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Erro ao carregar dashboard operacional');
    const data = await res.json();
    return normalizeOperacionalData(data);
  },
};
