import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plane, Users, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { dashboardService, OperadorData } from "@/services/dashboardService";

const GREEN = "hsl(152, 60%, 40%)";
const SECONDARY = "hsl(215, 25%, 45%)";

interface Props {
  open: boolean;
  onClose: () => void;
  operador: string;
}

export function OperadorModal({ open, onClose, operador }: Props) {
  const [data, setData] = useState<OperadorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("mensal");
  const [tab, setTab] = useState("passageiros");

  useEffect(() => {
    if (open && operador) {
      setLoading(true);
      dashboardService.getOperador(operador).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
    }
  }, [open, operador]);

  const chartData = data ? data[period as keyof Pick<OperadorData, 'mensal' | 'semanal' | 'anual'>] : [];
  const kpis = data?.kpis;

  const kpiItems = [
    { label: "Dias Operando", value: kpis?.dias_operando?.toLocaleString() ?? "—", icon: Calendar, color: GREEN },
    { label: "Total Passageiros", value: kpis?.total_passageiros?.toLocaleString() ?? "—", icon: Users, color: SECONDARY },
    { label: "Total de Voos", value: kpis?.total_voos?.toLocaleString() ?? "—", icon: Plane, color: "#d97706" },
    { label: "Passageiros/Voo", value: kpis?.pax_por_voo?.toString() ?? "—", icon: TrendingUp, color: "#2563eb" },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane size={20} style={{ color: GREEN }} />
            Dashboard — {operador}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin" size={32} style={{ color: GREEN }} />
          </div>
        ) : !data ? (
          <p className="text-center text-muted-foreground py-8">Sem dados disponíveis.</p>
        ) : (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {kpiItems.map((k) => (
                <div key={k.label} className="rounded-lg border p-4 text-center">
                  <k.icon size={20} className="mx-auto mb-1" style={{ color: k.color }} />
                  <p className="text-2xl font-bold">{k.value}</p>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                </div>
              ))}
            </div>

            {/* Tabs + period select */}
            <div className="flex items-center justify-between">
              <Tabs value={tab} onValueChange={setTab} className="flex-1">
                <TabsList>
                  <TabsTrigger value="passageiros">Passageiros</TabsTrigger>
                  <TabsTrigger value="voos">Voos</TabsTrigger>
                  <TabsTrigger value="tendencias">Tendências</TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[130px] ml-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Charts */}
            {tab === "passageiros" && (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="passageiros" fill={GREEN} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            {tab === "voos" && (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="voos" fill={SECONDARY} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            {tab === "tendencias" && (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis yAxisId="left" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" fontSize={12} />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="passageiros" stroke={GREEN} strokeWidth={3} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="voos" stroke={SECONDARY} strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}

            {/* Bottom cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <h4 className="font-semibold mb-3">Análise de Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Passageiros/Voo</span><Badge variant="secondary">{kpis?.pax_por_voo ?? "—"}</Badge></div>
                  <div className="flex justify-between"><span>Total de Voos</span><Badge variant="secondary">{kpis?.total_voos?.toLocaleString() ?? "—"}</Badge></div>
                  <div className="flex justify-between"><span>Total Passageiros</span><Badge variant="secondary">{kpis?.total_passageiros?.toLocaleString() ?? "—"}</Badge></div>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <h4 className="font-semibold mb-3">Principais Rotas</h4>
                <div className="space-y-2 text-sm">
                  {data.rotas.map((r, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{r.platform || "Sem plataforma"}</span>
                      <Badge>{r.passageiros.toLocaleString()} pax</Badge>
                    </div>
                  ))}
                  {data.rotas.length === 0 && <p className="text-muted-foreground">Sem dados de rotas.</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
