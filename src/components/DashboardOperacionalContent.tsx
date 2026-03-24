import { useState, useEffect, useCallback } from "react";
import {
  Calendar, ArrowUp, ArrowDown, BarChart3, Copy, Bell,
  Filter, Maximize2, MoreHorizontal, ChevronDown, ChevronRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LabelList, LineChart, Line,
} from "recharts";
import {
  dashboardService,
  type DashboardOperacionalData,
  type FiltrosData,
} from "@/services/dashboardService";

const CORES_EMPRESAS: Record<string, string> = {};
const PALETA = ["#CC0000", "#FF6600", "#33AA33", "#3366CC", "#9933CC", "#CC6699", "#339999", "#996633"];
const LINE_COLOR = "#990000";

function getCorEmpresa(empresa: string, index: number): string {
  if (!CORES_EMPRESAS[empresa]) {
    CORES_EMPRESAS[empresa] = PALETA[index % PALETA.length];
  }
  return CORES_EMPRESAS[empresa];
}

function mesLabel(mesKey: string): string {
  const [, m] = mesKey.split("-");
  const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return nomes[parseInt(m, 10) - 1] || mesKey;
}

function formatDateBR(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

const ToggleGroup = ({ label, items, selected, onToggle }: { label: string; items: string[]; selected: string[]; onToggle: (item: string) => void }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">{label}</span>
    <div className="flex gap-1">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onToggle(item)}
          className="px-3 py-1 text-xs rounded transition-colors"
          style={{ border: "1px solid #CCCCCC", backgroundColor: selected.includes(item) ? "#F0F0F0" : "#FFFFFF", color: "#333333" }}
        >
          {item}
        </button>
      ))}
    </div>
  </div>
);

const CustomStackedTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  const total = payload.reduce((s: number, p: any) => s + (p.value ?? 0), 0);
  return (
    <div className="bg-white border rounded p-2 shadow text-xs">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (<p key={p.dataKey} style={{ color: p.fill }}>{p.name}: {p.value?.toLocaleString("pt-BR")}</p>))}
      <p className="font-semibold mt-1">Total: {total.toLocaleString("pt-BR")}</p>
    </div>
  );
};

const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.[0]) return null;
  return (<div className="bg-black text-white rounded px-2 py-1 text-xs shadow">{label}: {payload[0].value?.toLocaleString("pt-BR")}</div>);
};

const CustomLineDot = (props: any) => {
  const { cx, cy, value } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="#000000" stroke="#FFFFFF" strokeWidth={2} />
      <rect x={cx - 18} y={cy - 26} width={36} height={18} rx={4} fill="#000000" />
      <text x={cx} y={cy - 14} textAnchor="middle" fill="#FFFFFF" fontSize={9} fontWeight="bold">{value?.toLocaleString("pt-BR")}</text>
    </g>
  );
};

const renderStackedLabel = (fill: string) => (props: any) => {
  const { x, y, width, height, value } = props;
  if (!value || height < 14) return null;
  const textColor = fill === "#FF6600" || fill === "#33AA33" ? "#000000" : "#FFFFFF";
  return (<text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle" fill={textColor} fontSize={9} fontWeight="bold">{(value / 1000).toFixed(1)}K</text>);
};

const DashboardOperacionalContent = () => {
  const [filtros, setFiltros] = useState<FiltrosData | null>(null);
  const [data, setData] = useState<DashboardOperacionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEmpresas, setSelectedEmpresas] = useState<string[]>([]);
  const [selectedClientes, setSelectedClientes] = useState<string[]>([]);
  const [selectedIcao, setSelectedIcao] = useState<string[]>([]);
  const [tableExpanded, setTableExpanded] = useState(true);

  const today = new Date();
  const [dateFrom] = useState(`${today.getFullYear()}-01-01`);
  const [dateTo] = useState(`${today.getFullYear()}-12-31`);

  const toggleItem = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  useEffect(() => {
    dashboardService.getFiltros().then(setFiltros).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getOperacional({
        data_inicio: dateFrom,
        data_fim: dateTo,
        empresa: selectedEmpresas.length > 0 ? selectedEmpresas : undefined,
        cliente_final: selectedClientes.length > 0 ? selectedClientes : undefined,
        icao: selectedIcao.length > 0 ? selectedIcao : undefined,
      });
      setData(result);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, selectedEmpresas, selectedClientes, selectedIcao]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build list of all unique empresas from the data
  const todasEmpresas = data?.por_empresa_mes.length
    ? [...new Set(data.por_empresa_mes.flatMap((m) => Object.keys(m.empresas)))].sort()
    : [];

  // Transform data for stacked bar chart: each row = { mes: "Jan", empresa1: val, empresa2: val, ... }
  const barData = data?.por_empresa_mes.map((item) => {
    const row: Record<string, any> = { mes: mesLabel(item.mes) };
    todasEmpresas.forEach((emp) => {
      row[emp] = item.empresas[emp] ?? 0;
    });
    return row;
  }) ?? [];

  const lineData = data?.media_diaria_mes.map((item) => ({
    mes: mesLabel(item.mes),
    media: Math.round(item.media),
  })) ?? [];

  // Build table data from tabela_clientes
  const todosClientes = data?.tabela_clientes.length
    ? [...new Set(data.tabela_clientes.flatMap((m) => Object.keys(m.clientes)))].sort()
    : [];

  const currentYear = today.getFullYear().toString();

  const empresas = filtros?.operadoras ?? [];
  const clientesFinais = filtros?.clientes_finais ?? [];
  const tiposIcao = filtros?.tipos_icao ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* Filter Bar */}
      <div className="flex items-center gap-5 px-6 py-3 overflow-x-auto border-b" style={{ borderColor: "#E8E8E8" }}>
        <ToggleGroup label="Empresa" items={empresas} selected={selectedEmpresas} onToggle={(item) => toggleItem(selectedEmpresas, item, setSelectedEmpresas)} />
        <div className="h-5 w-px bg-gray-200" />
        <ToggleGroup label="Cliente Final" items={clientesFinais} selected={selectedClientes} onToggle={(item) => toggleItem(selectedClientes, item, setSelectedClientes)} />
        <div className="h-5 w-px bg-gray-200" />
        <ToggleGroup label="Tipo ICAO" items={tiposIcao} selected={selectedIcao} onToggle={(item) => toggleItem(selectedIcao, item, setSelectedIcao)} />
        <div className="h-5 w-px bg-gray-200" />
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-muted-foreground">Date</span>
          <div className="flex items-center gap-1 border rounded px-2 py-1" style={{ borderColor: "#CCCCCC" }}>
            <Calendar size={12} className="text-muted-foreground" />
            <span>{formatDateBR(dateFrom)}</span>
          </div>
          <span className="text-muted-foreground">-</span>
          <div className="flex items-center gap-1 border rounded px-2 py-1" style={{ borderColor: "#CCCCCC" }}>
            <Calendar size={12} className="text-muted-foreground" />
            <span>{formatDateBR(dateTo)}</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Carregando...</div>
      )}
      {error && (
        <div className="flex items-center justify-center py-20 text-sm text-red-600">{error}</div>
      )}

      {!loading && !error && data && (
        <div className="flex flex-1 overflow-hidden">
          {/* Left Table */}
          <div className="w-[260px] flex-shrink-0 border-r overflow-y-auto" style={{ borderColor: "#E8E8E8" }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ backgroundColor: "#F5F5F5" }}>
                  <th className="text-left px-3 py-2 font-semibold" style={{ color: "#222" }}>Ano</th>
                  <th className="text-left px-2 py-2 font-semibold" style={{ color: "#222" }}>Mes</th>
                  {todosClientes.map((cl) => (
                    <th key={cl} className="text-right px-2 py-2 font-semibold" style={{ color: "#222" }}>{cl}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="cursor-pointer hover:bg-gray-50" onClick={() => setTableExpanded(!tableExpanded)}>
                  <td className="px-3 py-2 font-semibold flex items-center gap-1" style={{ color: "#222" }}>
                    {tableExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    {currentYear}
                  </td>
                  <td></td>
                  {todosClientes.map((cl) => <td key={cl}></td>)}
                </tr>
                {tableExpanded && data.tabela_clientes.map((row) => (
                  <tr key={row.mes} className="hover:bg-gray-50">
                    <td className="px-3 py-1.5" style={{ color: "#666" }}></td>
                    <td className="px-2 py-1.5 capitalize" style={{ color: "#444" }}>{mesLabel(row.mes)}</td>
                    {todosClientes.map((cl) => (
                      <td key={cl} className="text-right px-2 py-1.5 tabular-nums" style={{ color: "#444" }}>
                        {(row.clientes[cl] ?? 0).toLocaleString("pt-BR")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right Charts */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6">
            {/* Stacked Bar Chart */}
            <div className="bg-white rounded-md border p-5" style={{ borderColor: "#E8E8E8" }}>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={barData} barCategoryGap="18%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
                    <XAxis dataKey="mes" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)} Mil`} />
                    <Tooltip content={<CustomStackedTooltip />} />
                    <Legend verticalAlign="top" align="left" iconType="circle" iconSize={8} wrapperStyle={{ paddingBottom: 16, fontSize: 12 }} />
                    {todasEmpresas.map((emp, i) => {
                      const cor = getCorEmpresa(emp, i);
                      const isLast = i === todasEmpresas.length - 1;
                      return (
                        <Bar key={emp} dataKey={emp} name={emp} stackId="a" fill={cor} radius={isLast ? [4, 4, 0, 0] : undefined}>
                          <LabelList content={renderStackedLabel(cor)} />
                        </Bar>
                      );
                    })}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-10">Nenhum dado no periodo selecionado</p>
              )}
            </div>

            {/* Line Chart */}
            <div className="bg-white rounded-md border p-5" style={{ borderColor: "#E8E8E8" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold" style={{ color: "#222222" }}>Media Diaria de Passageiros</h3>
                <div className="flex items-center gap-1">
                  {[ArrowUp, ArrowDown, BarChart3, Copy, Bell, Filter, Maximize2, MoreHorizontal].map((Icon, i) => (
                    <button key={i} className="p-1 rounded hover:bg-gray-100"><Icon size={14} className="text-muted-foreground" /></button>
                  ))}
                </div>
              </div>
              {lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
                    <XAxis dataKey="mes" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v.toLocaleString("pt-BR")} />
                    <Tooltip content={<CustomLineTooltip />} />
                    <Line type="monotone" dataKey="media" stroke={LINE_COLOR} strokeWidth={2} dot={<CustomLineDot />} activeDot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-10">Nenhum dado no periodo selecionado</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOperacionalContent;
