import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Phone, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { chatService, ChatMessage } from "@/services/chatService";
import { dashboardService } from "@/services/dashboardService";
import { toast } from "sonner";

const SUGGESTIONS = [
  "Quantos passageiros embarcaram hoje?",
  "Resumo operacional do dia",
  "Quais voos sairam hoje?",
  "Quantos desembarques essa semana?",
];

const Byone = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (text?: string) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");

    try {
      setIsLoading(true);
      const reply = await chatService.sendMessage(trimmed, messages);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar mensagem");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppReport = async () => {
    try {
      const today = new Date();
      const dateStr = today.toLocaleDateString("pt-BR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const todayISO = today.toISOString().slice(0, 10);
      const data = await dashboardService.getPassageiros({
        data_inicio: todayISO,
        data_fim: todayISO,
      });

      const totalPax = data.kpis.total_passageiros;
      const embarques = data.kpis.total_decolagens;
      const desembarques = data.kpis.total_pousos;
      const totalEmb = data.diario.reduce((s, d) => s + d.embarque, 0);
      const totalDesemb = data.diario.reduce((s, d) => s + d.desembarque, 0);

      const message =
        `*ONEPAX - Relatorio Operacional Diario*\n` +
        `_${dateStr}_\n\n` +
        `Segue o resumo das operacoes do dia:\n\n` +
        `*Total de passageiros:* ${totalPax}\n` +
        `*Embarques:* ${totalEmb} (${embarques} voos)\n` +
        `*Desembarques:* ${totalDesemb} (${desembarques} voos)\n\n` +
        `_Relatorio gerado automaticamente pelo Byone._`;

      const phone = "5511942054868";
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    } catch {
      toast.error("Erro ao gerar relatorio. Verifique sua conexao.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#09090b" }}>
      <Navbar />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(ellipse, #7c3aed 0%, transparent 70%)" }}
        />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate("/central-analise")}
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: "#71717a" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
          >
            <ArrowLeft size={16} />
            Central de Analises
          </button>

          <button
            onClick={handleWhatsAppReport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
              color: "#ffffff",
              boxShadow: "0 0 20px rgba(37, 211, 102, 0.15)",
            }}
          >
            <Phone size={14} />
            Enviar Relatorio via WhatsApp
          </button>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col items-center overflow-hidden px-4">
          {isEmpty ? (
            /* Welcome state */
            <div className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full">
              {/* Logo */}
              <div
                className="relative mb-6 w-24 h-24 rounded-2xl overflow-hidden"
                style={{
                  boxShadow: "0 0 60px rgba(56, 189, 248, 0.15)",
                }}
              >
                <img src="/byone-logo.png" alt="Byone" className="w-full h-full object-cover" />
              </div>

              <h1
                className="text-3xl font-bold tracking-tight mb-2"
                style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Byone
              </h1>
              <p className="text-sm mb-10" style={{ color: "#52525b" }}>
                Assistente inteligente da Central de Analise
              </p>

              {/* Suggestions */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-left px-4 py-3 rounded-xl text-sm transition-all hover:scale-[1.01]"
                    style={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      color: "#a1a1aa",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#3f3f46";
                      e.currentTarget.style.color = "#e4e4e7";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#27272a";
                      e.currentTarget.style.color = "#a1a1aa";
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <div
              ref={scrollRef}
              className="flex-1 w-full max-w-3xl overflow-y-auto py-6 space-y-6"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#27272a transparent" }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div
                      className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden mr-3 mt-0.5"
                      style={{ border: "1px solid #27272a" }}
                    >
                      <img src="/byone-icon.png" alt="Byone" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div
                    className="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                    style={
                      msg.role === "user"
                        ? {
                            background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                            color: "#ffffff",
                            borderBottomRightRadius: 6,
                          }
                        : {
                            backgroundColor: "#18181b",
                            border: "1px solid #27272a",
                            color: "#d4d4d8",
                            borderBottomLeftRadius: 6,
                          }
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mr-3"
                    style={{ backgroundColor: "#18181b", border: "1px solid #27272a" }}
                  >
                    <Sparkles size={14} style={{ color: "#7c3aed" }} />
                  </div>
                  <div
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm"
                    style={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      color: "#71717a",
                    }}
                  >
                    <Loader2 size={14} className="animate-spin" style={{ color: "#7c3aed" }} />
                    Analisando...
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input area */}
          <div className="w-full max-w-3xl pb-6 pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-end rounded-2xl transition-all"
              style={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                boxShadow: "0 0 30px rgba(124, 58, 237, 0.04)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#3f3f46";
                e.currentTarget.style.boxShadow = "0 0 30px rgba(124, 58, 237, 0.08)";
              }}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  e.currentTarget.style.borderColor = "#27272a";
                  e.currentTarget.style.boxShadow = "0 0 30px rgba(124, 58, 237, 0.04)";
                }
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte sobre passageiros, voos, operacoes..."
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none px-5 py-4 text-sm placeholder:text-zinc-600"
                style={{
                  color: "#e4e4e7",
                  maxHeight: 120,
                  minHeight: 48,
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = Math.min(target.scrollHeight, 120) + "px";
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl mr-2 mb-1.5 transition-all disabled:opacity-30"
                style={{
                  background: input.trim()
                    ? "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)"
                    : "transparent",
                }}
              >
                <Send size={16} style={{ color: input.trim() ? "#ffffff" : "#52525b" }} />
              </button>
            </form>
            <p className="text-center mt-2 text-xs" style={{ color: "#3f3f46" }}>
              Byone pode cometer erros. Verifique informacoes importantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Byone;
