import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ChatPanel } from "@/components/ChatPanel";
import { OperadorModal } from "@/components/OperadorModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Users, Plane, Clock, TrendingUp, Activity, AlertCircle, BarChart3, Loader2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { dashboardService, DashboardData } from "@/services/dashboardService";

const GREEN = "hsl(152, 60%, 40%)";
const SECONDARY = "hsl(215, 25%, 45%)";
const PIE_COLORS = ["#8B9DC3", "#98D8C8", "#FFB8B8", "#F7DC6F", "#B8A9C9", "#A8D8EA", "#FFD3B6", "#D5E8D4"];

const CentralAnalise = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [movPeriod, setMovPeriod] = useState("diario");
  const [selectedOperador, setSelectedOperador] = useState<string | null>(null);

  useEffect(() => {
    dashboardService.getDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const kpis = data?.kpis;
  const movData = (data?.movimentacao?.[movPeriod] ?? []).map((d) => ({
    name: d.operadora,
    passageiros: d.passageiros,
  }));
  const horarioData = data?.por_horario ?? [];
  const aeronaveData = data?.aeronaves ?? [];
  const aeronavePieData = (() => {
    const total = aeronaveData.reduce((s, a) => s + a.total, 0) || 1;
    return aeronaveData.map((a) => ({
      name: a.aeronave,
      value: Math.round((a.total / total) * 100),
    }));
  })();
  const operadores = data?.operadores ?? [];

  const periodLabel: Record<string, string> = {
    diario: "hoje",
    semanal: "últimos 7 dias",
    mensal: "este mês",
    anual: String(new Date().getFullYear()),
  };

  const renderVariacao = (v: number | null | undefined) => {
    if (v == null) return null;
    const positive = v >= 0;
    return (
      <span className="text-xs" style={{ color: positive ? GREEN : "#dc2626" }}>
        {positive ? "+" : ""}{v}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin" size={40} style={{ color: GREEN }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(210, 25%, 98%)" }}>
      <Navbar />

      <main className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold" style={{ color: "hsl(215, 25%, 15%)" }}>Dashboard</h2>
            <p className="text-sm text-muted-foreground">Visão geral operacional do heliporto</p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1.5">
            <Activity size={14} /> Tempo Real
          </Badge>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { title: "Passageiros Hoje", value: kpis?.passageiros_hoje?.toLocaleString() ?? "0", change: kpis?.variacao_pax, icon: Users, color: GREEN },
            { title: "Voos Hoje", value: kpis?.voos_hoje?.toLocaleString() ?? "0", change: kpis?.variacao_voos, icon: Plane, color: SECONDARY },
            { title: "Embarques", value: (data?.movimentacao?.diario?.reduce((s, o) => s + o.voos, 0) ?? 0).toString(), change: null, icon: Clock, color: "#d97706" },
            { title: "Operadores Ativos", value: operadores.length.toString(), change: null, icon: TrendingUp, color: "#059669" },
          ].map((kpi) => (
            <div key={kpi.title} className="rounded-lg border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{kpi.title}</span>
                <kpi.icon size={20} style={{ color: kpi.color }} />
              </div>
              <p className="text-3xl font-bold" style={{ color: "hsl(215, 25%, 15%)" }}>{kpi.value}</p>
              {renderVariacao(kpi.change)}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="movimentacao">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="movimentacao">Movimentação</TabsTrigger>
            <TabsTrigger value="operadores">Operadores</TabsTrigger>
            <TabsTrigger value="aeronaves">Aeronaves</TabsTrigger>
            <TabsTrigger value="ocorrencias">Ocorrências</TabsTrigger>
          </TabsList>

          {/* Tab 1: Movimentação */}
          <TabsContent value="movimentacao" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Movimentação por operadora */}
              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users size={18} style={{ color: GREEN }} />
                    <span className="font-semibold text-sm">Movimentação de passageiros — {periodLabel[movPeriod]}</span>
                  </div>
                  <Select value={movPeriod} onValueChange={setMovPeriod}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diario">Diário</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {movData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={movData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={11} angle={-15} textAnchor="end" height={50} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="passageiros" fill={GREEN} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-16 text-sm">Sem dados para o período.</p>
                )}
              </div>

              {/* Uso de aeronaves */}
              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Plane size={18} style={{ color: SECONDARY }} />
                  <span className="font-semibold text-sm">Uso de Aeronaves</span>
                </div>
                {aeronavePieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={aeronavePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name} ${value}%`}
                        fontSize={12}
                      >
                        {aeronavePieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-16 text-sm">Sem dados de aeronaves.</p>
                )}
              </div>
            </div>

            {/* Movimentação por horário */}
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={18} style={{ color: GREEN }} />
                <span className="font-semibold text-sm">Movimentação por Horário</span>
              </div>
              {horarioData.some((h) => h.embarques > 0 || h.desembarques > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={horarioData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="horario" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="embarques" stroke={GREEN} strokeWidth={2} name="Embarques" />
                    <Line type="monotone" dataKey="desembarques" stroke={SECONDARY} strokeWidth={2} name="Desembarques" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-16 text-sm">Sem movimentação registrada hoje.</p>
              )}
            </div>
          </TabsContent>

          {/* Tab 2: Operadores */}
          <TabsContent value="operadores">
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <h3 className="font-semibold mb-4">Ranking de Operadores Aéreos</h3>
              {operadores.length > 0 ? (
                <div className="space-y-2">
                  {operadores.map((op, i) => (
                    <button
                      key={op.operadora}
                      onClick={() => setSelectedOperador(op.operadora)}
                      className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold"
                          style={{ backgroundColor: `${GREEN}15`, color: GREEN }}
                        >
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium text-sm">{op.operadora}</p>
                          <p className="text-xs text-muted-foreground">{op.voos} voos</p>
                        </div>
                      </div>
                      <span className="font-bold">{op.passageiros.toLocaleString()} pax</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8 text-sm">Nenhum operador registrado hoje.</p>
              )}
            </div>
          </TabsContent>

          {/* Tab 3: Aeronaves */}
          <TabsContent value="aeronaves">
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <h3 className="font-semibold mb-4">Frequência de Uso das Aeronaves</h3>
              {aeronaveData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={aeronaveData.map((a) => ({ name: a.aeronave, voos: a.total }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="voos" fill={GREEN} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-16 text-sm">Sem dados de aeronaves.</p>
              )}
            </div>
          </TabsContent>

          {/* Tab 4: Ocorrências */}
          <TabsContent value="ocorrencias">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={18} className="text-yellow-500" />
                  <span className="font-semibold text-sm">Alertas Recentes</span>
                </div>
                <div className="space-y-3">
                  {[
                    { msg: "Atraso na Plataforma B", time: "Há 15 minutos", bg: "bg-yellow-50", border: "border-yellow-200", dot: "bg-yellow-400" },
                    { msg: "Manutenção programada", time: "Há 2 horas", bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-400" },
                    { msg: "Sistema funcionando normal", time: "Há 5 horas", bg: "bg-green-50", border: "border-green-200", dot: "bg-green-400" },
                  ].map((a) => (
                    <div key={a.msg} className={`flex items-center gap-3 p-3 rounded-lg border ${a.bg} ${a.border}`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${a.dot}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{a.msg}</p>
                        <p className="text-xs text-muted-foreground">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-sm mb-4">Estatísticas de Operação</h3>
                <div className="space-y-3">
                  {[
                    { label: "Taxa de Sucesso", value: "98.5%", color: "#059669" },
                    { label: "Intervenções Manuais", value: "12", color: "#d97706" },
                    { label: "Voos Cancelados", value: "3", color: "#dc2626" },
                    { label: "Uptime do Sistema", value: "99.8%", color: "#059669" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-sm">{s.label}</span>
                      <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <ChatPanel />

      <OperadorModal
        open={!!selectedOperador}
        onClose={() => setSelectedOperador(null)}
        operador={selectedOperador ?? ""}
      />
    </div>
  );
};

export default CentralAnalise;
