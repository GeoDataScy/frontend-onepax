import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Phone, Plus, Pencil, Trash2, Check, X, FileText, Loader2, Send,
  FileBarChart, Clock, Download,
} from "lucide-react";
import {
  contatosWhatsappService,
  type ContatoWhatsapp,
  type RelatorioDiario,
  type RelatorioMensalResumo,
} from "@/services/contatosWhatsappService";

const BRAND_RED = "#8B0000";

function formatPhoneDisplay(phone: string): string {
  // 5511987654321 -> +55 (11) 98765-4321
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 12) return phone;
  const country = digits.slice(0, 2);
  const area = digits.slice(2, 4);
  const rest = digits.slice(4);
  if (rest.length === 9) return `+${country} (${area}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  if (rest.length === 8) return `+${country} (${area}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  return `+${country} ${digits.slice(2)}`;
}

function defaultPrevMonth(): { ano: number; mes: number } {
  const now = new Date();
  let ano = now.getFullYear();
  let mes = now.getMonth(); // 0..11 — getMonth() retorna mês anterior em base 1
  if (mes === 0) {
    mes = 12;
    ano -= 1;
  }
  return { ano, mes };
}

const ContatosWhatsappContent = () => {
  const [contatos, setContatos] = useState<ContatoWhatsapp[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formNome, setFormNome] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formAtivo, setFormAtivo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<RelatorioDiario | null>(null);

  // Configuração de horário programado
  const [horarioProgramado, setHorarioProgramado] = useState<string>("");
  const [horarioSavedValue, setHorarioSavedValue] = useState<string>("");

  // Relatório mensal
  const initial = defaultPrevMonth();
  const [mensalOpen, setMensalOpen] = useState(false);
  const [mensalAno, setMensalAno] = useState<number>(initial.ano);
  const [mensalMes, setMensalMes] = useState<number>(initial.mes);
  const [mensalResumo, setMensalResumo] = useState<RelatorioMensalResumo | null>(null);
  const [mensalLoading, setMensalLoading] = useState(false);
  const [mensalBaixado, setMensalBaixado] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await contatosWhatsappService.list();
      setContatos(data);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao carregar contatos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      try {
        const cfg = await contatosWhatsappService.getConfiguracao();
        const v = cfg.horario_envio_diario || "";
        setHorarioProgramado(v);
        setHorarioSavedValue(v);
      } catch {
        // silent
      }
    })();
  }, []);

  const horarioDirty = horarioProgramado !== horarioSavedValue;

  const handleSalvarHorario = async () => {
    try {
      const valor = horarioProgramado.trim() || null;
      const cfg = await contatosWhatsappService.updateConfiguracao({ horario_envio_diario: valor });
      setHorarioSavedValue(cfg.horario_envio_diario || "");
      toast.success(valor ? `Horário salvo: ${valor}` : "Horário removido");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar horário");
    }
  };

  const abrirMensal = async () => {
    setMensalOpen(true);
    setMensalBaixado(false);
    await carregarResumoMensal(mensalAno, mensalMes);
  };

  const carregarResumoMensal = async (ano: number, mes: number) => {
    try {
      setMensalLoading(true);
      setMensalResumo(null);
      const data = await contatosWhatsappService.getRelatorioMensalResumo(ano, mes);
      setMensalResumo(data);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao carregar resumo mensal");
    } finally {
      setMensalLoading(false);
    }
  };

  const handleBaixarPdf = async () => {
    try {
      setMensalLoading(true);
      await contatosWhatsappService.baixarRelatorioMensalPdf(mensalAno, mensalMes);
      setMensalBaixado(true);
      toast.success("PDF baixado — agora envie via WhatsApp");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao gerar PDF");
    } finally {
      setMensalLoading(false);
    }
  };

  const handleEnviarMensalWhatsApp = (telefone: string) => {
    if (!mensalResumo) return;
    const t = mensalResumo.totais;
    const comp = mensalResumo.comparativo;
    const deltaStr = comp.delta_pax_pct !== null
      ? ` (${comp.delta_pax_pct >= 0 ? "+" : ""}${comp.delta_pax_pct.toString().replace(".", ",")}% vs ${comp.mes_anterior_extenso})`
      : "";
    const msg =
      `*ONEPAX - Relatório Mensal de Operações*\n` +
      `_${mensalResumo.mes_extenso}_\n\n` +
      `*Resumo*\n` +
      `Passageiros: ${t.pax.toLocaleString("pt-BR")}${deltaStr}\n` +
      `Voos: ${t.voos.toLocaleString("pt-BR")}\n` +
      `Pax/voo: ${t.pax_por_voo.toString().replace(".", ",")}\n\n` +
      `Detalhes completos, charts e insights no PDF em anexo.\n\n` +
      `_Relatório gerado automaticamente pelo sistema ONEPAX._`;
    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const resetForm = () => {
    setEditingId(null);
    setFormNome("");
    setFormTelefone("");
    setFormAtivo(true);
  };

  const startEdit = (c: ContatoWhatsapp) => {
    setEditingId(c.id);
    setFormNome(c.nome);
    setFormTelefone(c.telefone);
    setFormAtivo(c.ativo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nome = formNome.trim();
    const telefone = formTelefone.replace(/\D/g, "");
    if (!nome) return toast.error("Informe o nome.");
    if (telefone.length < 12 || telefone.length > 15) {
      return toast.error("Telefone inválido. Use o formato com DDI (ex: 5511987654321).");
    }

    try {
      setSaving(true);
      if (editingId === null) {
        await contatosWhatsappService.create({ nome, telefone, ativo: formAtivo });
        toast.success("Contato adicionado");
      } else {
        await contatosWhatsappService.update(editingId, { nome, telefone, ativo: formAtivo });
        toast.success("Contato atualizado");
      }
      resetForm();
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAtivo = async (c: ContatoWhatsapp) => {
    try {
      await contatosWhatsappService.update(c.id, { ativo: !c.ativo });
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao atualizar");
    }
  };

  const handlePreview = async () => {
    try {
      setPreviewOpen(true);
      setPreviewLoading(true);
      setPreview(null);
      const data = await contatosWhatsappService.getRelatorioDiario();
      setPreview(data);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao gerar relatório");
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSendWhatsApp = (telefone: string) => {
    if (!preview?.texto) return;
    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(preview.texto)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async (c: ContatoWhatsapp) => {
    if (!window.confirm(`Remover o contato "${c.nome}"?`)) return;
    try {
      await contatosWhatsappService.remove(c.id);
      if (editingId === c.id) resetForm();
      toast.success("Contato removido");
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao remover");
    }
  };

  const contatosAtivos = contatos.filter((c) => c.ativo);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "#222" }}>
            <Phone size={20} style={{ color: BRAND_RED }} />
            Contatos WhatsApp
          </h1>
          <p className="text-sm mt-1" style={{ color: "#666" }}>
            Números que receberão o relatório operacional diário.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePreview}
            className="shrink-0 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border transition-colors hover:bg-gray-50"
            style={{ borderColor: "#D0D0D0", color: "#222" }}
            title="Visualizar como o relatório vai sair hoje"
          >
            <FileText size={14} />
            Pré-visualizar relatório diário
          </button>
          <button
            type="button"
            onClick={abrirMensal}
            className="shrink-0 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-md transition-opacity hover:opacity-90"
            style={{ backgroundColor: BRAND_RED }}
            title="Gerar e enviar o relatório mensal em PDF"
          >
            <FileBarChart size={14} />
            Relatório Mensal
          </button>
        </div>
      </div>

      {/* Bloco de configuração: horário programado */}
      <div
        className="mb-6 p-4 rounded-lg border flex items-center justify-between gap-3 flex-wrap"
        style={{ borderColor: "#E8E8E8", backgroundColor: "#FFFCF7" }}
      >
        <div className="flex items-center gap-2.5">
          <Clock size={16} style={{ color: BRAND_RED }} />
          <div>
            <div className="text-sm font-semibold" style={{ color: "#222" }}>
              Horário programado do envio diário
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={horarioProgramado}
            onChange={(e) => setHorarioProgramado(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1"
            style={{ borderColor: "#D0D0D0" }}
          />
          {horarioProgramado && (
            <button
              type="button"
              onClick={() => setHorarioProgramado("")}
              className="text-xs"
              style={{ color: "#888" }}
              title="Limpar"
            >
              limpar
            </button>
          )}
          <button
            type="button"
            onClick={handleSalvarHorario}
            disabled={!horarioDirty}
            className="px-3 py-1.5 text-sm font-medium text-white rounded-md transition-opacity disabled:opacity-40"
            style={{ backgroundColor: BRAND_RED }}
          >
            Salvar
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-6 p-4 rounded-lg border"
        style={{ borderColor: "#E8E8E8", backgroundColor: "#FAFAFA" }}
      >
        <div className="flex items-center gap-2 mb-3">
          {editingId === null ? <Plus size={16} style={{ color: BRAND_RED }} /> : <Pencil size={16} style={{ color: BRAND_RED }} />}
          <span className="text-sm font-semibold" style={{ color: "#222" }}>
            {editingId === null ? "Novo contato" : "Editar contato"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>
              Nome
            </label>
            <input
              type="text"
              value={formNome}
              onChange={(e) => setFormNome(e.target.value)}
              placeholder="Ex: Samuel"
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1"
              style={{ borderColor: "#D0D0D0" }}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>
              Telefone (com DDI, só números)
            </label>
            <input
              type="tel"
              value={formTelefone}
              onChange={(e) => setFormTelefone(e.target.value.replace(/\D/g, ""))}
              placeholder="5511987654321"
              maxLength={15}
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1"
              style={{ borderColor: "#D0D0D0" }}
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#555" }}>
            <input
              type="checkbox"
              checked={formAtivo}
              onChange={(e) => setFormAtivo(e.target.checked)}
              className="cursor-pointer"
            />
            Ativo (receberá relatórios)
          </label>

          <div className="flex gap-2">
            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 text-sm border rounded-md transition-colors hover:bg-gray-100"
                style={{ borderColor: "#D0D0D0", color: "#555" }}
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 text-sm font-medium text-white rounded-md transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: BRAND_RED }}
            >
              {saving ? "Salvando..." : editingId === null ? "Adicionar" : "Salvar"}
            </button>
          </div>
        </div>
      </form>

      <div className="rounded-lg border overflow-hidden" style={{ borderColor: "#E8E8E8" }}>
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: "#FAFAFA" }}>
            <tr>
              <th className="text-left px-4 py-2.5 font-semibold" style={{ color: "#555" }}>Nome</th>
              <th className="text-left px-4 py-2.5 font-semibold" style={{ color: "#555" }}>Telefone</th>
              <th className="text-center px-4 py-2.5 font-semibold" style={{ color: "#555" }}>Ativo</th>
              <th className="text-right px-4 py-2.5 font-semibold" style={{ color: "#555" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center" style={{ color: "#888" }}>
                  Carregando...
                </td>
              </tr>
            )}
            {!loading && contatos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center" style={{ color: "#888" }}>
                  Nenhum contato cadastrado. Adicione o primeiro acima.
                </td>
              </tr>
            )}
            {!loading && contatos.map((c) => (
              <tr key={c.id} className="border-t" style={{ borderColor: "#EFEFEF" }}>
                <td className="px-4 py-2.5" style={{ color: "#222" }}>{c.nome}</td>
                <td className="px-4 py-2.5 font-mono text-xs" style={{ color: "#444" }}>
                  {formatPhoneDisplay(c.telefone)}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <button
                    onClick={() => handleToggleAtivo(c)}
                    title={c.ativo ? "Desativar" : "Ativar"}
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full transition-colors hover:opacity-80"
                    style={{ backgroundColor: c.ativo ? "#16a34a" : "#9CA3AF", color: "white" }}
                  >
                    {c.ativo ? <Check size={14} /> : <X size={14} />}
                  </button>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="inline-flex gap-1">
                    <button
                      onClick={() => startEdit(c)}
                      title="Editar"
                      className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                      style={{ color: "#555" }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      title="Remover"
                      className="p-1.5 rounded hover:bg-red-50 transition-colors"
                      style={{ color: "#B91C1C" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {previewOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setPreviewOpen(false)}
          />
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[92vw] max-w-xl rounded-lg border bg-white shadow-xl"
            style={{ borderColor: "#E8E8E8" }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "#E8E8E8" }}
            >
              <div className="flex items-center gap-2">
                <FileText size={16} style={{ color: BRAND_RED }} />
                <span className="text-sm font-semibold" style={{ color: "#222" }}>
                  Pré-visualização do relatório
                </span>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="p-1 rounded hover:bg-gray-100"
                style={{ color: "#555" }}
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {previewLoading && (
                <div className="flex items-center gap-2 text-sm" style={{ color: "#666" }}>
                  <Loader2 size={14} className="animate-spin" />
                  Gerando relatório...
                </div>
              )}

              {!previewLoading && preview && (
                <>
                  <pre
                    className="whitespace-pre-wrap font-mono text-xs p-3 rounded border"
                    style={{
                      borderColor: "#E8E8E8",
                      backgroundColor: "#FAFAFA",
                      color: "#222",
                    }}
                  >
                    {preview.texto}
                  </pre>

                  <div className="mt-4">
                    <div className="text-xs font-medium mb-2" style={{ color: "#555" }}>
                      Enviar para ({contatosAtivos.length} ativos)
                    </div>
                    {contatosAtivos.length === 0 ? (
                      <div className="text-xs italic" style={{ color: "#888" }}>
                        Nenhum contato ativo. Ative ao menos um contato acima.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {contatosAtivos.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between gap-2 p-2 rounded border"
                            style={{ borderColor: "#EFEFEF", backgroundColor: "#FAFAFA" }}
                          >
                            <div className="text-xs" style={{ color: "#222" }}>
                              <span className="font-medium">{c.nome}</span>{" "}
                              <span className="font-mono" style={{ color: "#888" }}>
                                ({c.telefone})
                              </span>
                            </div>
                            <button
                              onClick={() => handleSendWhatsApp(c.telefone)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white rounded-md transition-opacity hover:opacity-90"
                              style={{
                                background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                              }}
                              title={`Abrir WhatsApp para ${c.nome}`}
                            >
                              <Send size={12} />
                              Enviar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 text-xs italic" style={{ color: "#888" }}>
                      Cada botão abre o WhatsApp com a mensagem pronta — você só precisa
                      clicar em enviar dentro do WhatsApp.
                    </div>
                  </div>
                </>
              )}
            </div>

            <div
              className="px-4 py-3 border-t flex justify-end"
              style={{ borderColor: "#E8E8E8" }}
            >
              <button
                onClick={() => setPreviewOpen(false)}
                className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
                style={{ borderColor: "#D0D0D0", color: "#555" }}
              >
                Fechar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal Relatório Mensal */}
      {mensalOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setMensalOpen(false)}
          />
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[94vw] max-w-2xl rounded-lg border bg-white shadow-xl"
            style={{ borderColor: "#E8E8E8" }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "#E8E8E8", backgroundColor: "#1A1A1A" }}
            >
              <div className="flex items-center gap-2">
                <FileBarChart size={18} style={{ color: "#fff" }} />
                <span className="text-sm font-semibold text-white">
                  Relatório Mensal de Operações
                </span>
              </div>
              <button
                onClick={() => setMensalOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-white"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 max-h-[75vh] overflow-y-auto">
              {/* Seletor de mês */}
              <div className="mb-4 flex items-center gap-2 flex-wrap">
                <label className="text-xs font-medium" style={{ color: "#555" }}>
                  Período:
                </label>
                <select
                  value={mensalMes}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    setMensalMes(m);
                    setMensalBaixado(false);
                    carregarResumoMensal(mensalAno, m);
                  }}
                  className="px-2 py-1.5 text-sm border rounded-md"
                  style={{ borderColor: "#D0D0D0" }}
                >
                  {["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((nome, idx) => (
                    <option key={idx} value={idx + 1}>{nome}</option>
                  ))}
                </select>
                <select
                  value={mensalAno}
                  onChange={(e) => {
                    const a = Number(e.target.value);
                    setMensalAno(a);
                    setMensalBaixado(false);
                    carregarResumoMensal(a, mensalMes);
                  }}
                  className="px-2 py-1.5 text-sm border rounded-md"
                  style={{ borderColor: "#D0D0D0" }}
                >
                  {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {mensalLoading && (
                <div className="flex items-center gap-2 text-sm py-6" style={{ color: "#666" }}>
                  <Loader2 size={14} className="animate-spin" />
                  Carregando dados do mês...
                </div>
              )}

              {!mensalLoading && mensalResumo && (
                <>
                  {/* KPIs */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: "Passageiros", value: mensalResumo.totais.pax.toLocaleString("pt-BR") },
                      { label: "Voos", value: mensalResumo.totais.voos.toLocaleString("pt-BR") },
                      { label: "Pax/voo", value: mensalResumo.totais.pax_por_voo.toString().replace(".", ",") },
                    ].map((k) => (
                      <div
                        key={k.label}
                        className="p-3 rounded border text-center"
                        style={{ borderColor: "#E8E8E8", backgroundColor: "#FAFAFA" }}
                      >
                        <div className="text-[10px] font-medium uppercase" style={{ color: "#888" }}>
                          {k.label}
                        </div>
                        <div className="text-lg font-bold" style={{ color: "#222" }}>
                          {k.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comparativo */}
                  {mensalResumo.comparativo.delta_pax_pct !== null && (
                    <div className="mb-4 text-xs" style={{ color: "#555" }}>
                      vs <span className="font-medium">{mensalResumo.comparativo.mes_anterior_extenso}</span>:{" "}
                      <span
                        style={{
                          color: mensalResumo.comparativo.delta_pax_pct >= 0 ? "#16a34a" : "#B91C1C",
                          fontWeight: 600,
                        }}
                      >
                        {mensalResumo.comparativo.delta_pax_pct >= 0 ? "▲" : "▼"}{" "}
                        {Math.abs(mensalResumo.comparativo.delta_pax_pct).toString().replace(".", ",")}%
                      </span>{" "}
                      em passageiros
                    </div>
                  )}

                  {/* Insights */}
                  <div className="mb-4">
                    <div className="text-xs font-medium mb-2" style={{ color: "#555" }}>
                      Insights ({mensalResumo.insights.length})
                    </div>
                    <ul className="space-y-1.5 text-xs" style={{ color: "#444" }}>
                      {mensalResumo.insights.slice(0, 5).map((ins, i) => (
                        <li key={i}>• {ins}</li>
                      ))}
                      {mensalResumo.insights.length > 5 && (
                        <li className="italic" style={{ color: "#888" }}>
                          + {mensalResumo.insights.length - 5} insights adicionais no PDF
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Download + envio */}
                  <div
                    className="p-3 rounded border"
                    style={{ borderColor: "#E8E8E8", backgroundColor: "#FAFAFA" }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="text-xs" style={{ color: "#555" }}>
                        <strong>Passo 1:</strong> baixe o PDF
                      </div>
                      <button
                        onClick={handleBaixarPdf}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-md hover:opacity-90"
                        style={{ backgroundColor: "#1A1A1A" }}
                      >
                        <Download size={12} />
                        {mensalBaixado ? "Baixar novamente" : "Baixar PDF"}
                      </button>
                    </div>

                    <div className="text-xs mb-2" style={{ color: "#555" }}>
                      <strong>Passo 2:</strong> envie por WhatsApp e anexe o PDF baixado
                    </div>
                    {contatosAtivos.length === 0 ? (
                      <div className="text-xs italic" style={{ color: "#888" }}>
                        Nenhum contato ativo. Ative ao menos um na lista de contatos.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {contatosAtivos.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between gap-2 p-2 rounded bg-white border"
                            style={{ borderColor: "#EFEFEF" }}
                          >
                            <div className="text-xs" style={{ color: "#222" }}>
                              <span className="font-medium">{c.nome}</span>{" "}
                              <span className="font-mono" style={{ color: "#888" }}>
                                ({c.telefone})
                              </span>
                            </div>
                            <button
                              onClick={() => handleEnviarMensalWhatsApp(c.telefone)}
                              disabled={!mensalBaixado}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white rounded-md transition-opacity hover:opacity-90 disabled:opacity-40"
                              style={{
                                background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                              }}
                              title={mensalBaixado ? `Abrir WhatsApp para ${c.nome}` : "Baixe o PDF primeiro"}
                            >
                              <Send size={12} />
                              Enviar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-[11px] italic" style={{ color: "#888" }}>
                      No WhatsApp aberto, clique no clipe 📎 → arraste o PDF baixado → enviar.
                    </div>
                  </div>
                </>
              )}
            </div>

            <div
              className="px-5 py-3 border-t flex justify-end"
              style={{ borderColor: "#E8E8E8" }}
            >
              <button
                onClick={() => setMensalOpen(false)}
                className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
                style={{ borderColor: "#D0D0D0", color: "#555" }}
              >
                Fechar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContatosWhatsappContent;
