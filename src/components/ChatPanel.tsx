import { useState, useRef, useEffect } from "react";
import { Send, Loader2, MessageSquare, X, Bot, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatService, ChatMessage } from "@/services/chatService";
import { toast } from "sonner";

const QUICK_ACTIONS = [
  "Quantos passageiros embarcaram hoje?",
  "Resumo operacional de hoje",
  "Quais voos saíram hoje?",
  "Quantos desembarques houve essa semana?",
];

interface ChatPanelProps {
  dashboardData?: {
    voos_hoje: number;
    passageiros_hoje: number;
    embarques: number;
    desembarques: number;
  };
}

export function ChatPanel({ dashboardData }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

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

  const [showWhatsAppMenu, setShowWhatsAppMenu] = useState(false);
  const [whatsAppMessage, setWhatsAppMessage] = useState("");

  const whatsAppContacts = [
    { name: "Samuel", phone: "5532998412097" },
    { name: "Tavares", phone: "5522999999499" },
    { name: "Geovani", phone: "5511942054868" },
  ];

  const handleWhatsAppReport = () => {
    const today = new Date();
    const dateStr = today.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const voos = dashboardData?.voos_hoje ?? 0;
    const embarques = dashboardData?.embarques ?? 0;
    const desembarques = dashboardData?.desembarques ?? 0;
    const totalPax = dashboardData?.passageiros_hoje ?? 0;

    setWhatsAppMessage(
      `*ONEPAX - Relatório Operacional Diário*\n` +
      `_${dateStr}_\n\n` +
      `Segue o resumo das operações do dia:\n\n` +
      `*Voos realizados:* ${voos}\n` +
      `*Total de passageiros:* ${totalPax}\n` +
      `*Embarques:* ${embarques}\n` +
      `*Desembarques:* ${desembarques}\n\n` +
      `_Relatório gerado automaticamente pela Central de Análise._`
    );
    setShowWhatsAppMenu(true);
  };

  const handleSendToContact = (phone: string) => {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(whatsAppMessage)}`;
    window.open(url, "_blank");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
        style={{ backgroundColor: "#1a1a1a" }}
      >
        <MessageSquare className="h-6 w-6 text-white" />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col rounded-lg border shadow-xl"
      style={{
        width: 400,
        height: 520,
        backgroundColor: "#ffffff",
        borderColor: "#e0dfdd",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-t-lg"
        style={{ backgroundColor: "#1a1a1a" }}
      >
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-white" />
          <span className="text-sm font-semibold text-white">
            Byone
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={handleWhatsAppReport}
              title="Enviar relatório via WhatsApp"
              className="flex items-center justify-center h-7 w-7 rounded-md transition-colors"
              style={{ backgroundColor: "#25D366" }}
            >
              <Phone size={14} className="text-white" />
            </button>

            {showWhatsAppMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowWhatsAppMenu(false)} />
                <div
                  className="absolute right-0 top-full mt-2 z-50 rounded-lg border shadow-xl overflow-hidden"
                  style={{ backgroundColor: "#1a1a1a", borderColor: "#2a2a2a", minWidth: 200 }}
                >
                  <div className="px-3 py-2 text-xs font-medium" style={{ color: "#71717a", borderBottom: "1px solid #2a2a2a" }}>
                    Enviar para:
                  </div>
                  {whatsAppContacts.map((contact) => (
                    <button
                      key={contact.phone}
                      onClick={() => handleSendToContact(contact.phone)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white transition-colors hover:bg-white/10"
                    >
                      <Phone size={14} style={{ color: "#25D366" }} />
                      {contact.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center py-6">
            <Bot size={36} className="mb-3" style={{ color: "#c8b89a" }} />
            <p className="text-sm font-medium" style={{ color: "#1a1a1a" }}>
              Olá! Sou o assistente da Central de Análise.
            </p>
            <p className="text-xs mt-1" style={{ color: "#6b6b6b" }}>
              Pergunte sobre passageiros, voos, embarques...
            </p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => handleSend(action)}
                  className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-gray-50"
                  style={{ borderColor: "#c8b89a", color: "#1a1a1a" }}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap"
              style={
                msg.role === "user"
                  ? { backgroundColor: "#1a1a1a", color: "#ffffff" }
                  : { backgroundColor: "#f0efed", color: "#1a1a1a" }
              }
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start mb-3">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: "#f0efed", color: "#6b6b6b" }}
            >
              <Loader2 size={14} className="animate-spin" />
              Analisando...
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="px-4 py-3" style={{ borderTop: "1px solid #e0dfdd" }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre os dados..."
            disabled={isLoading}
            className="flex-1 h-9 px-3 text-sm border rounded-md outline-none transition-colors"
            style={{
              borderColor: "#e0dfdd",
              backgroundColor: "#fafaf9",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "#c8b89a")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "#e0dfdd")
            }
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || isLoading}
            className="h-9 w-9 p-0"
            style={{ backgroundColor: "#1a1a1a" }}
          >
            <Send size={14} />
          </Button>
        </form>
      </div>
    </div>
  );
}
