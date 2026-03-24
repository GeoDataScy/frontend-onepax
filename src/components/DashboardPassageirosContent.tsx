import { useState, useEffect, useCallback } from "react";
import { Calendar, Filter, Maximize2, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LabelList,
} from "recharts";
import {
  dashboardService,
  expandOriginals,
  type DashboardPassageirosData,
  type FiltrosData,
} from "@/services/dashboardService";

const EMBARQUE_COLOR = "#8B0000";
const DESEMBARQUE_COLOR = "#555555";

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  const embarque = payload.find((p: any) => p.dataKey === "embarque")?.value ?? 0;
  const desembarque = payload.find((p: any) => p.dataKey === "desembarque")?.value ?? 0;
  return (
    <div className="bg-white border rounded p-2 shadow text-xs">
      <p className="font-semibold mb-1">{label}</p>
      <p style={{ color: EMBARQUE_COLOR }}>Embarque: {embarque.toLocaleString("pt-BR")}</p>
      <p style={{ color: DESEMBARQUE_COLOR }}>Desembarque: {desembarque.toLocaleString("pt-BR")}</p>
      <p className="font-semibold mt-1">Total: {(embarque + desembarque).toLocaleString("pt-BR")}</p>
    </div>
  );
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()} ${["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][d.getMonth()]}`;
}

function formatDateBR(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function mesLabel(mesKey: string): string {
  const [, m] = mesKey.split("-");
  const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return nomes[parseInt(m, 10) - 1] || mesKey;
}

const DashboardPassageirosContent = () => {
  const [filtros, setFiltros] = useState<FiltrosData | null>(null);
  const [data, setData] = useState<DashboardPassageirosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [aeronave, setAeronave] = useState("Todos");
  const [selectedOperadoras, setSelectedOperadoras] = useState<string[]>([]);
  const [selectedClientes, setSelectedClientes] = useState<string[]>([]);
  const [selectedServicos, setSelectedServicos] = useState<string[]>([]);

  const today = new Date();
  const twelveMonthsAgo = new Date(today);
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
  const [dateFrom, setDateFrom] = useState(twelveMonthsAgo.toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(today.toISOString().slice(0, 10));

  const toggleFilter = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  useEffect(() => {
    dashboardService.getFiltros().then(setFiltros).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getPassageiros({
        data_inicio: dateFrom,
        data_fim: dateTo,
        operadora: selectedOperadoras.length > 0
          ? expandOriginals(selectedOperadoras, filtros?._originais_operadoras ?? {})
          : undefined,
        cliente_final: selectedClientes.length > 0
          ? expandOriginals(selectedClientes, filtros?._originais_clientes ?? {})
          : undefined,
        servico: selectedServicos.length === 1 ? selectedServicos[0].toLowerCase() : undefined,
        aeronave: aeronave !== "Todos" ? [aeronave] : undefined,
      });
      setData(result);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, selectedOperadoras, selectedClientes, selectedServicos, aeronave]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartData = data?.diario.map((d) => ({
    date: formatDate(d.date),
    embarque: d.embarque,
    desembarque: d.desembarque,
  })) ?? [];

  const allMeses = data?.tabela_operadoras.length
    ? Object.keys(data.tabela_operadoras[0].meses).sort()
    : [];

  const allYears = data?.tabela_operadoras.length
    ? Object.keys(data.tabela_operadoras[0].total_por_ano).sort()
    : [];

  const operadoras = filtros?.operadoras ?? [];
  const clientes = filtros?.clientes_finais ?? [];
  const servicos = ["Desembarque", "Embarque"];

  return (
    <div className="flex h-full">
      {/* Sidebar Filters */}
      <aside
        className="w-[220px] flex-shrink-0 border-r p-4 flex flex-col gap-5 overflow-y-auto"
        style={{ borderColor: "#E0E0E0" }}
      >
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold" style={{ color: "#8B0000" }}>INFRA</span>
          <span className="text-xs text-muted-foreground">/ FAROL DE SAO TOME</span>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aeronave</label>
          <select value={aeronave} onChange={(e) => setAeronave(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 text-sm bg-white" style={{ borderColor: "#D0D0D0" }}>
            <option>Todos</option>
            {filtros?.aeronaves.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Operadora</label>
          <div className="mt-2 space-y-2">
            {operadoras.map((op) => (
              <label key={op} className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox checked={selectedOperadoras.includes(op)} onCheckedChange={() => toggleFilter(selectedOperadoras, op, setSelectedOperadoras)} />
                {op}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliente Final</label>
          <div className="mt-2 space-y-2">
            {clientes.map((cl) => (
              <label key={cl} className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox checked={selectedClientes.includes(cl)} onCheckedChange={() => toggleFilter(selectedClientes, cl, setSelectedClientes)} />
                {cl}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Servico</label>
          <div className="mt-2 space-y-2">
            {servicos.map((sv) => (
              <label key={sv} className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox checked={selectedServicos.includes(sv)} onCheckedChange={() => toggleFilter(selectedServicos, sv, setSelectedServicos)} />
                {sv}
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-end gap-3 p-4">
          <div className="flex items-center gap-2 text-sm border rounded px-3 py-1.5" style={{ borderColor: "#D0D0D0" }}>
            <Calendar size={14} className="text-muted-foreground" />
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-transparent outline-none text-sm" />
            <span className="text-muted-foreground">-</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-transparent outline-none text-sm" />
          </div>
          <button className="p-1.5 rounded hover:bg-gray-100"><Filter size={16} className="text-muted-foreground" /></button>
          <button className="p-1.5 rounded hover:bg-gray-100"><Maximize2 size={16} className="text-muted-foreground" /></button>
          <button className="p-1.5 rounded hover:bg-gray-100"><MoreHorizontal size={16} className="text-muted-foreground" /></button>
        </div>

        <div className="flex-1 overflow-auto px-6 pb-6">
          {loading && (
            <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Carregando...</div>
          )}
          {error && (
            <div className="flex items-center justify-center py-20 text-sm text-red-600">{error}</div>
          )}
          {!loading && !error && data && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Passageiros", value: data.kpis.total_passageiros.toLocaleString("pt-BR") },
                  { label: "Decolagem — Contagem de N. do Voo", value: data.kpis.total_decolagens.toLocaleString("pt-BR") },
                  { label: "Pouso — Contagem de N. do Voo", value: data.kpis.total_pousos.toLocaleString("pt-BR") },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-md border bg-white p-5" style={{ borderColor: "#E0E0E0" }}>
                    <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                    <p className="text-2xl font-bold" style={{ color: "#222222" }}>{kpi.value}</p>
                  </div>
                ))}
              </div>

              {/* Stacked Bar Chart */}
              <div className="rounded-md border bg-white p-5 mb-6" style={{ borderColor: "#E0E0E0" }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: "#222222" }}>Passageiros por Year, Month, Day e Servico</h3>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart data={chartData} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
                      <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Legend verticalAlign="top" align="left" iconType="circle" iconSize={8} wrapperStyle={{ paddingBottom: 12, fontSize: 12 }} />
                      <Bar dataKey="embarque" name="Embarque" stackId="a" fill={EMBARQUE_COLOR}>
                        <LabelList dataKey="embarque" position="center" fill="#FFFFFF" fontSize={10} />
                      </Bar>
                      <Bar dataKey="desembarque" name="Desembarque" stackId="a" fill={DESEMBARQUE_COLOR} radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="desembarque" position="center" fill="#FFFFFF" fontSize={10} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-10">Nenhum dado no periodo selecionado</p>
                )}
              </div>

              {/* Table */}
              <div className="rounded-md border bg-white overflow-x-auto" style={{ borderColor: "#E0E0E0" }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ backgroundColor: "#F0F0F0" }}>
                      <th className="text-left px-3 py-2.5 font-semibold sticky left-0 bg-[#F0F0F0] z-10" style={{ color: "#222222" }}>Operadora</th>
                      {allMeses.map((m) => (
                        <th key={m} className="text-right px-3 py-2.5 font-semibold" style={{ color: "#222222" }}>{mesLabel(m)}</th>
                      ))}
                      {allYears.map((y) => (
                        <th key={`total-${y}`} className="text-right px-3 py-2.5 font-semibold" style={{ color: "#222222", backgroundColor: "#E8E8E8" }}>Total {y}</th>
                      ))}
                      <th className="text-right px-3 py-2.5 font-semibold" style={{ color: "#222222", backgroundColor: "#E0E0E0" }}>Total Geral</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.tabela_operadoras.map((row, idx) => (
                      <tr key={row.operadora} style={{ backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA" }} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 font-medium sticky left-0 z-10" style={{ backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA", color: "#222222" }}>{row.operadora}</td>
                        {allMeses.map((m) => (
                          <td key={m} className="text-right px-3 py-2.5 tabular-nums" style={{ color: "#444444" }}>
                            {(row.meses[m] ?? 0).toLocaleString("pt-BR")}
                          </td>
                        ))}
                        {allYears.map((y) => (
                          <td key={`total-${y}`} className="text-right px-3 py-2.5 font-semibold tabular-nums" style={{ backgroundColor: idx % 2 === 0 ? "#F5F5F5" : "#EFEFEF", color: "#222222" }}>
                            {(row.total_por_ano[y] ?? 0).toLocaleString("pt-BR")}
                          </td>
                        ))}
                        <td className="text-right px-3 py-2.5 font-bold tabular-nums" style={{ backgroundColor: idx % 2 === 0 ? "#EDEDED" : "#E8E8E8", color: "#222222" }}>
                          {row.total_geral.toLocaleString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPassageirosContent;
