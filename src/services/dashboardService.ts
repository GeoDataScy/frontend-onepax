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
    return res.json();
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
    return res.json();
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
    return res.json();
  },
};
