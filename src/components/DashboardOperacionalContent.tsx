import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar, ChevronDown, ChevronRight, Building2, Users, BarChart3,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LabelList, LineChart, Line,
} from "recharts";
import {
  dashboardService,
  type DashboardOperacionalData,
  type DashboardPassageirosData,
  type FiltrosData,
  expandOriginals,
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

const CustomStackedTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  const total = payload.reduce((s: number, p: any) => s + (p.value ?? 0), 0);
  return (
    <div className="bg-white border rounded-lg p-3 shadow-lg text-xs" style={{ border: "1px solid #E0E0E0" }}>
      <p className="font-semibold mb-1.5" style={{ color: "#222" }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.fill }} />
          <span style={{ color: p.fill }}>{p.name}: {p.value?.toLocaleString("pt-BR")}</span>
        </div>
      ))}
      <p className="font-semibold mt-1.5 pt-1.5" style={{ borderTop: "1px solid #eee", color: "#222" }}>Total: {total.toLocaleString("pt-BR")}</p>
    </div>
  );
};

const renderStackedLabel = (fill: string) => (props: any) => {
  const { x, y, width, height, value } = props;
  if (!value || height < 14) return null;
  const textColor = fill === "#FF6600" || fill === "#33AA33" ? "#000000" : "#FFFFFF";
  return (<text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle" fill={textColor} fontSize={9} fontWeight="bold">{value.toLocaleString("pt-BR")}</text>);
};

const DashboardOperacionalContent = () => {
  const [filtros, setFiltros] = useState<FiltrosData | null>(null);
  const [data, setData] = useState<DashboardOperacionalData | null>(null);
  const [paxData, setPaxData] = useState<DashboardPassageirosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEmpresas, setSelectedEmpresas] = useState<string[]>([]);
  const [selectedClientes, setSelectedClientes] = useState<string[]>([]);
  const [selectedIcao, setSelectedIcao] = useState<string[]>([]);
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());

  const today = new Date();
  const [dateFrom, setDateFrom] = useState("2024-01-01");
  const [dateTo, setDateTo] = useState(today.toISOString().slice(0, 10));

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
      const [opResult, paxResult] = await Promise.all([
        dashboardService.getOperacional({
          data_inicio: dateFrom,
          data_fim: dateTo,
          empresa: selectedEmpresas.length > 0
            ? expandOriginals(selectedEmpresas, filtros?._originais_operadoras ?? {})
            : undefined,
          cliente_final: selectedClientes.length > 0
            ? expandOriginals(selectedClientes, filtros?._originais_clientes ?? {})
            : undefined,
          icao: selectedIcao.length > 0 ? selectedIcao : undefined,
        }),
        dashboardService.getPassageiros({
          data_inicio: dateFrom,
          data_fim: dateTo,
          operadora: selectedEmpresas.length > 0
            ? expandOriginals(selectedEmpresas, filtros?._originais_operadoras ?? {})
            : undefined,
          cliente_final: selectedClientes.length > 0
            ? expandOriginals(selectedClientes, filtros?._originais_clientes ?? {})
            : undefined,
        }),
      ]);
      setData(opResult);
      setPaxData(paxResult);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, selectedEmpresas, selectedClientes, selectedIcao]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleYear = (year: string) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  // Auto-expand all years when data loads
  useEffect(() => {
    if (data?.tabela_clientes.length) {
      const years = new Set(data.tabela_clientes.map((r) => r.mes.split("-")[0]));
      setExpandedYears(years);
    }
  }, [data]);

  // Build list of all unique empresas from the data
  const todasEmpresas = data?.por_empresa_mes.length
    ? [...new Set(data.por_empresa_mes.flatMap((m) => Object.keys(m.empresas)))].sort()
    : [];

  // Transform data for stacked bar chart with year in label
  const barData = data?.por_empresa_mes.map((item) => {
    const [year] = item.mes.split("-");
    const row: Record<string, any> = { mes: `${mesLabel(item.mes)}/${year.slice(2)}` };
    todasEmpresas.forEach((emp) => {
      row[emp] = item.empresas[emp] ?? 0;
    });
    return row;
  }) ?? [];

  // Line chart: when range > 31 days, show last month with data; otherwise show full range
  const { dailyLineData, lineChartPeriodo } = (() => {
    if (!paxData?.diario) return { dailyLineData: [], lineChartPeriodo: "" };
    const diffDays = (new Date(dateTo + "T00:00:00").getTime() - new Date(dateFrom + "T00:00:00").getTime()) / 86400000;
    let filtered = paxData.diario.filter((d) => d.date >= dateFrom && d.date <= dateTo);
    let periodo = "";

    if (diffDays > 31 && filtered.length > 0) {
      // Find the last month that has data
      const lastDate = filtered[filtered.length - 1].date;
      const lastMonth = lastDate.slice(0, 7); // "YYYY-MM"
      filtered = filtered.filter((d) => d.date.startsWith(lastMonth));
      const [y, m] = lastMonth.split("-");
      const nomes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      periodo = `Exibindo: ${nomes[parseInt(m, 10) - 1]} ${y}`;
    } else {
      periodo = `Exibindo: ${new Date(dateFrom + "T00:00:00").toLocaleDateString("pt-BR")} — ${new Date(dateTo + "T00:00:00").toLocaleDateString("pt-BR")}`;
    }

    const data = filtered.map((d) => {
      const dt = new Date(d.date + "T00:00:00");
      const label = `${dt.getDate().toString().padStart(2, "0")}/${(dt.getMonth() + 1).toString().padStart(2, "0")}`;
      return { dia: label, total: d.embarque + d.desembarque };
    });
    return { dailyLineData: data, lineChartPeriodo: periodo };
  })();

  // Build table data from tabela_clientes
  const todosClientes = data?.tabela_clientes.length
    ? [...new Set(data.tabela_clientes.flatMap((m) => Object.keys(m.clientes)))].sort()
    : [];

  // Group tabela_clientes by year
  const tabelaPorAno = data?.tabela_clientes.reduce<Record<string, typeof data.tabela_clientes>>((acc, row) => {
    const [year] = row.mes.split("-");
    if (!acc[year]) acc[year] = [];
    acc[year].push(row);
    return acc;
  }, {}) ?? {};
  const anosDisponiveis = Object.keys(tabelaPorAno).sort().reverse();

  const empresas = filtros?.operadoras ?? [];
  const clientesFinais = filtros?.clientes_finais ?? [];
  const tiposIcao = filtros?.tipos_icao ?? [];

  const activeFilterCount = selectedEmpresas.length + selectedClientes.length + selectedIcao.length;

  return (
    <div className="flex h-full">
      {/* Sidebar Filters */}
      <aside
        className="w-[220px] flex-shrink-0 border-r p-4 flex flex-col gap-5 overflow-y-auto"
        style={{ borderColor: "#E0E0E0" }}
      >
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold" style={{ color: "#8B0000" }}>INFRA</span>
          <span className="text-xs text-muted-foreground">/ OPERACIONAL</span>
        </div>

        {/* Date Filter */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Período</label>
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 border rounded-md px-2 py-1.5" style={{ borderColor: "#D0D0D0" }}>
              <Calendar size={12} className="text-muted-foreground flex-shrink-0" />
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-transparent outline-none text-xs w-full" />
            </div>
            <div className="flex items-center gap-1.5 border rounded-md px-2 py-1.5" style={{ borderColor: "#D0D0D0" }}>
              <Calendar size={12} className="text-muted-foreground flex-shrink-0" />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-transparent outline-none text-xs w-full" />
            </div>
          </div>
        </div>

        {/* Empresa Filter */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Empresa</label>
          <div className="mt-2 space-y-2">
            {empresas.map((emp) => (
              <label key={emp} className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox checked={selectedEmpresas.includes(emp)} onCheckedChange={() => toggleItem(selectedEmpresas, emp, setSelectedEmpresas)} />
                {emp}
              </label>
            ))}
          </div>
        </div>

        {/* Cliente Final Filter */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliente Final</label>
          <div className="mt-2 space-y-2">
            {clientesFinais.map((cl) => (
              <label key={cl} className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox checked={selectedClientes.includes(cl)} onCheckedChange={() => toggleItem(selectedClientes, cl, setSelectedClientes)} />
                {cl}
              </label>
            ))}
          </div>
        </div>

        {/* Tipo ICAO Filter - Listbox */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo ICAO</label>
            {selectedIcao.length > 0 && (
              <button onClick={() => setSelectedIcao([])} className="text-[10px] text-muted-foreground hover:text-red-600 underline">
                Limpar
              </button>
            )}
          </div>
          <div
            className="mt-2 border rounded-md overflow-y-auto"
            style={{ borderColor: "#D0D0D0", maxHeight: "140px" }}
          >
            {tiposIcao.map((icao, idx) => (
              <label
                key={icao}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs cursor-pointer hover:bg-gray-50"
                style={{ borderBottom: idx < tiposIcao.length - 1 ? "1px solid #F0F0F0" : "none" }}
              >
                <Checkbox checked={selectedIcao.includes(icao)} onCheckedChange={() => toggleItem(selectedIcao, icao, setSelectedIcao)} />
                {icao}
              </label>
            ))}
          </div>
          {selectedIcao.length > 0 && (
            <p className="text-[10px] text-muted-foreground mt-1">{selectedIcao.length} selecionado{selectedIcao.length > 1 ? "s" : ""}</p>
          )}
        </div>

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={() => { setSelectedEmpresas([]); setSelectedClientes([]); setSelectedIcao([]); }}
            className="text-xs underline text-muted-foreground hover:text-red-600 text-left"
          >
            Limpar filtros ({activeFilterCount})
          </button>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: "#E8E8E8" }}>
          <h2 className="text-sm font-semibold" style={{ color: "#222" }}>Dashboard Operacional</h2>
          <div className="flex items-center gap-2 text-sm border rounded-md px-3 py-1.5" style={{ borderColor: "#D0D0D0" }}>
            <Calendar size={14} className="text-muted-foreground" />
            <span className="text-xs" style={{ color: "#666" }}>
              {new Date(dateFrom + "T00:00:00").toLocaleDateString("pt-BR")} — {new Date(dateTo + "T00:00:00").toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Carregando...</div>
        )}
        {error && (
          <div className="flex items-center justify-center py-20 text-sm text-red-600">{error}</div>
        )}

        {!loading && !error && data && (
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Total Passageiros",
                  value: paxData ? paxData.kpis.total_passageiros.toLocaleString("pt-BR") : "—",
                  icon: Users,
                  color: "#8B0000",
                  bg: "#FDF2F2",
                },
                {
                  label: "Empresas Ativas",
                  value: todasEmpresas.length.toString(),
                  icon: Building2,
                  color: "#1D4ED8",
                  bg: "#EFF6FF",
                },
                {
                  label: "Clientes Ativos",
                  value: todosClientes.length.toString(),
                  icon: BarChart3,
                  color: "#15803D",
                  bg: "#F0FDF4",
                },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-lg border bg-white p-5 flex items-start gap-4" style={{ borderColor: "#E0E0E0" }}>
                  <div className="rounded-lg p-2.5 flex-shrink-0" style={{ backgroundColor: kpi.bg }}>
                    <kpi.icon size={20} style={{ color: kpi.color }} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{kpi.label}</p>
                    <p className="text-2xl font-bold tracking-tight" style={{ color: "#222222" }}>{kpi.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-white overflow-x-auto" style={{ borderColor: "#E0E0E0" }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ backgroundColor: "#F5F5F5" }}>
                    <th className="text-left px-3 py-2.5 font-semibold" style={{ color: "#222" }}>Ano</th>
                    <th className="text-left px-2 py-2.5 font-semibold" style={{ color: "#222" }}>Mês</th>
                    {todosClientes.map((cl) => (
                      <th key={cl} className="text-right px-2 py-2.5 font-semibold" style={{ color: "#222" }}>{cl}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {anosDisponiveis.map((year) => {
                    const isExpanded = expandedYears.has(year);
                    const rows = tabelaPorAno[year] ?? [];
                    return (
                      <React.Fragment key={year}>
                        <tr
                          className="cursor-pointer hover:bg-gray-50"
                          style={{ backgroundColor: "#FAFAFA" }}
                          onClick={() => toggleYear(year)}
                        >
                          <td className="px-3 py-2 font-semibold" style={{ color: "#222" }}>
                            <span className="flex items-center gap-1">
                              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                              {year}
                            </span>
                          </td>
                          <td></td>
                          {todosClientes.map((cl) => {
                            const yearTotal = rows.reduce((sum, r) => sum + (r.clientes[cl] ?? 0), 0);
                            return (
                              <td key={cl} className="text-right px-2 py-2 font-semibold tabular-nums" style={{ color: "#222" }}>
                                {yearTotal > 0 ? yearTotal.toLocaleString("pt-BR") : ""}
                              </td>
                            );
                          })}
                        </tr>
                        {isExpanded && rows.map((row) => (
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
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Stacked Bar Chart */}
            <div className="bg-white rounded-lg border p-5" style={{ borderColor: "#E0E0E0" }}>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={barData} barCategoryGap="18%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
                    <XAxis dataKey="mes" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v: number) => v.toLocaleString("pt-BR")} />
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

            {/* Line Chart - Media Diaria */}
            <div className="bg-white rounded-lg border p-5" style={{ borderColor: "#E0E0E0" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold" style={{ color: "#222222" }}>Media Diaria de Passageiros</h3>
                <span className="text-[10px] text-muted-foreground">{lineChartPeriodo}</span>
              </div>
              {dailyLineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={dailyLineData} margin={{ top: 20, right: 30, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={LINE_COLOR} stopOpacity={0.15} />
                        <stop offset="100%" stopColor={LINE_COLOR} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                    <XAxis
                      dataKey="dia"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#999" }}
                      interval={0}
                    />
                    <YAxis
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#999" }}
                      tickFormatter={(v: number) => v.toLocaleString("pt-BR")}
                      width={50}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "1px solid #E8E8E8", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: 12 }}
                      formatter={(value: number) => [value.toLocaleString("pt-BR"), "Passageiros"]}
                      labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke={LINE_COLOR}
                      strokeWidth={2}
                      dot={{ r: 3, fill: LINE_COLOR, stroke: "#fff", strokeWidth: 2 }}
                      activeDot={{ r: 5, fill: LINE_COLOR, stroke: "#fff", strokeWidth: 2 }}
                    >
                      <LabelList
                        dataKey="total"
                        position="top"
                        offset={10}
                        fontSize={9}
                        fontWeight="bold"
                        fill="#333"
                        formatter={(v: number) => v.toLocaleString("pt-BR")}
                      />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-10">Nenhum dado no periodo selecionado</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOperacionalContent;
