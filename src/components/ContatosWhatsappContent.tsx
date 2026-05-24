import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Phone, Plus, Pencil, Trash2, Check, X, FileText, Loader2 } from "lucide-react";
import {
  contatosWhatsappService,
  type ContatoWhatsapp,
  type RelatorioDiario,
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
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "#222" }}>
            <Phone size={20} style={{ color: BRAND_RED }} />
            Contatos WhatsApp
          </h1>
          <p className="text-sm mt-1" style={{ color: "#666" }}>
            Números que receberão o relatório operacional diário.
          </p>
        </div>
        <button
          type="button"
          onClick={handlePreview}
          className="shrink-0 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border transition-colors hover:bg-gray-50"
          style={{ borderColor: "#D0D0D0", color: "#222" }}
          title="Visualizar como o relatório vai sair hoje"
        >
          <FileText size={14} />
          Pré-visualizar relatório de hoje
        </button>
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
                      Destinatários ativos ({contatosAtivos.length})
                    </div>
                    {contatosAtivos.length === 0 ? (
                      <div className="text-xs italic" style={{ color: "#888" }}>
                        Nenhum contato ativo. Ative ao menos um contato acima.
                      </div>
                    ) : (
                      <ul className="text-xs space-y-0.5" style={{ color: "#444" }}>
                        {contatosAtivos.map((c) => (
                          <li key={c.id}>
                            • {c.nome}{" "}
                            <span className="font-mono" style={{ color: "#888" }}>
                              ({c.telefone})
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
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
    </div>
  );
};

export default ContatosWhatsappContent;
