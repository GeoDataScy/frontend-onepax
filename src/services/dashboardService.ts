const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface DashboardData {
  kpis: {
    passageiros_hoje: number;
    voos_hoje: number;
    variacao_pax: number | null;
    variacao_voos: number | null;
  };
  movimentacao: Record<string, { operadora: string; passageiros: number; voos: number }[]>;
  por_horario: { horario: string; embarques: number; desembarques: number }[];
  aeronaves: { aeronave: string; total: number }[];
  operadores: { operadora: string; passageiros: number; voos: number }[];
}

export interface OperadorData {
  kpis: {
    dias_operando: number;
    total_passageiros: number;
    total_voos: number;
    pax_por_voo: number;
  };
  mensal: { name: string; passageiros: number; voos: number }[];
  semanal: { name: string; passageiros: number; voos: number }[];
  anual: { name: string; passageiros: number; voos: number }[];
  rotas: { platform: string; passageiros: number }[];
}

export const dashboardService = {
  async getDashboard(): Promise<DashboardData> {
    const res = await fetch(`${API_URL}/api/central-analise/dashboard/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Erro ao carregar dashboard');
    return res.json();
  },

  async getOperador(operadora: string): Promise<OperadorData> {
    const res = await fetch(`${API_URL}/api/central-analise/operador/${encodeURIComponent(operadora)}/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Erro ao carregar dados do operador');
    return res.json();
  },
};
