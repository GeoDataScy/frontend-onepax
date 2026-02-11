import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { transporteService, TransporteRecord } from "@/services/transporteService";
import { Plus, X, Send, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

/* ─── Helpers ─── */
function maskDate(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function maskTime(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

const EMPTY_FORM = {
    empresa_solicitante: "",
    cliente_final: "",
    data: "",
    numero_voo: "",
    prefixo_aeronave: "",
    prefixo_manual: "",
    horario: "",
    servico: "",
};

/* ─── Skeleton Row ─── */
function SkeletonRow() {
    return (
        <tr>
            {Array.from({ length: 8 }).map((_, i) => (
                <td key={i} className="px-5 py-4">
                    <div
                        className="h-4 rounded"
                        style={{
                            backgroundColor: "#e8e8e6",
                            animation: "pulse 1.8s ease-in-out infinite",
                            width: i === 5 ? "50%" : i === 7 ? "70%" : "85%",
                        }}
                    />
                </td>
            ))}
        </tr>
    );
}

/* ─── Main Page ─── */
export default function Transporte() {
    const [records, setRecords] = useState<TransporteRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    /* Fetch records */
    const fetchRecords = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await transporteService.list();
            setRecords(data);
        } catch {
            toast.error("Erro ao carregar registros");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    /* Form handlers */
    const updateField = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const isFormValid =
        form.empresa_solicitante.trim() &&
        form.cliente_final.trim() &&
        form.data.length === 10 &&
        form.numero_voo.trim() &&
        (form.prefixo_aeronave.trim() || form.prefixo_manual.trim()) &&
        form.horario.length === 5 &&
        form.servico.trim();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        try {
            setIsSending(true);
            await transporteService.create({
                ...form,
                numero_voo: parseInt(form.numero_voo, 10),
            });
            toast.success("Registro criado com sucesso");
            setForm(EMPTY_FORM);
            setShowForm(false);
            fetchRecords();
        } catch (error: any) {
            toast.error(error.message || "Erro ao criar registro");
        } finally {
            setIsSending(false);
        }
    };

    /* ─── Quick-fill helpers ─── */
    const getTodayDate = () => {
        const now = new Date();
        const dd = now.getDate().toString().padStart(2, "0");
        const mm = (now.getMonth() + 1).toString().padStart(2, "0");
        const yyyy = now.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    const getCurrentTime = () => {
        const now = new Date();
        const hh = now.getHours().toString().padStart(2, "0");
        const min = now.getMinutes().toString().padStart(2, "0");
        return `${hh}:${min}`;
    };

    /* ─── Styles ─── */
    const colors = {
        bg: "#f7f7f5",
        card: "#f0efed",
        border: "#e2e1de",
        text: "#1a1a1a",
        textMuted: "#6b6b6b",
        accent: "#c8b89a",
        white: "#ffffff",
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        height: "44px",
        padding: "0 14px",
        backgroundColor: colors.white,
        border: `1px solid ${colors.border}`,
        borderRadius: "4px",
        fontSize: "13px",
        fontFamily: "'Inter', sans-serif",
        color: colors.text,
        letterSpacing: "0.01em",
        outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
    };

    const quickBtnStyle: React.CSSProperties = {
        height: "44px",
        padding: "0 14px",
        backgroundColor: colors.card,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: 500,
        fontFamily: "'Inter', sans-serif",
        letterSpacing: "0.02em",
        cursor: "pointer",
        transition: "background-color 0.2s",
        whiteSpace: "nowrap",
        flexShrink: 0,
    };

    const labelStyle: React.CSSProperties = {
        display: "block",
        fontSize: "11px",
        fontWeight: 500,
        color: colors.textMuted,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        marginBottom: "6px",
        fontFamily: "'Inter', sans-serif",
    };

    const focusHandlers = {
        onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
            e.target.style.borderColor = colors.accent;
            e.target.style.boxShadow = `0 0 0 3px ${colors.accent}20`;
        },
        onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
            e.target.style.borderColor = colors.border;
            e.target.style.boxShadow = "none";
        },
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: colors.bg }}>
            <Navbar />

            <main
                style={{
                    maxWidth: "1280px",
                    margin: "0 auto",
                    padding: "32px 24px",
                }}
            >
                {/* ── Header ── */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "32px",
                    }}
                >
                    <div>
                        <h2
                            style={{
                                fontSize: "22px",
                                fontWeight: 600,
                                color: colors.text,
                                letterSpacing: "-0.02em",
                                fontFamily: "'Inter', sans-serif",
                                margin: 0,
                            }}
                        >
                            Transporte
                        </h2>
                        <p
                            style={{
                                fontSize: "13px",
                                color: colors.textMuted,
                                marginTop: "4px",
                                letterSpacing: "0.01em",
                            }}
                        >
                            Gerenciamento de registros de transporte
                        </p>
                    </div>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            height: "40px",
                            padding: "0 20px",
                            backgroundColor: colors.text,
                            color: colors.white,
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "13px",
                            fontWeight: 500,
                            fontFamily: "'Inter', sans-serif",
                            letterSpacing: "0.02em",
                            cursor: "pointer",
                            transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = "0.85")}
                        onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = "1")}
                    >
                        {showForm ? (
                            <>
                                <X size={15} strokeWidth={2} />
                                Fechar
                            </>
                        ) : (
                            <>
                                <Plus size={15} strokeWidth={2} />
                                Novo Registro
                            </>
                        )}
                    </button>
                </div>

                {/* ── Form ── */}
                {showForm && (
                    <div
                        style={{
                            backgroundColor: colors.white,
                            border: `1px solid ${colors.border}`,
                            borderRadius: "6px",
                            padding: "28px",
                            marginBottom: "32px",
                        }}
                    >
                        <form onSubmit={handleSubmit}>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                                    gap: "20px",
                                }}
                            >
                                {/* Empresa Solicitante */}
                                <div>
                                    <label style={labelStyle}>Empresa que Solicita</label>
                                    <input
                                        type="text"
                                        value={form.empresa_solicitante}
                                        onChange={(e) => updateField("empresa_solicitante", e.target.value)}
                                        style={inputStyle}
                                        {...focusHandlers}
                                    />
                                </div>

                                {/* Cliente Final */}
                                <div>
                                    <label style={labelStyle}>Cliente Final</label>
                                    <input
                                        type="text"
                                        value={form.cliente_final}
                                        onChange={(e) => updateField("cliente_final", e.target.value)}
                                        style={inputStyle}
                                        {...focusHandlers}
                                    />
                                </div>

                                {/* Data + Hoje */}
                                <div>
                                    <label style={labelStyle}>Data</label>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <input
                                            type="text"
                                            value={form.data}
                                            onChange={(e) => updateField("data", maskDate(e.target.value))}
                                            placeholder="DD/MM/AAAA"
                                            maxLength={10}
                                            style={inputStyle}
                                            {...focusHandlers}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => updateField("data", getTodayDate())}
                                            style={quickBtnStyle}
                                            onMouseEnter={(e) =>
                                                ((e.target as HTMLElement).style.backgroundColor = colors.border)
                                            }
                                            onMouseLeave={(e) =>
                                                ((e.target as HTMLElement).style.backgroundColor = colors.card)
                                            }
                                        >
                                            Hoje
                                        </button>
                                    </div>
                                </div>

                                {/* Número do Voo */}
                                <div>
                                    <label style={labelStyle}>Número do Voo</label>
                                    <input
                                        type="text"
                                        value={form.numero_voo}
                                        onChange={(e) => {
                                            const v = e.target.value.replace(/\D/g, "");
                                            updateField("numero_voo", v);
                                        }}
                                        style={inputStyle}
                                        {...focusHandlers}
                                    />
                                </div>

                                {/* Prefixo Aeronave */}
                                <div>
                                    <label style={labelStyle}>Prefixo da Aeronave</label>
                                    <input
                                        type="text"
                                        value={form.prefixo_aeronave}
                                        onChange={(e) => updateField("prefixo_aeronave", e.target.value)}
                                        style={inputStyle}
                                        {...focusHandlers}
                                    />
                                </div>

                                {/* Prefixo Manual */}
                                <div>
                                    <label style={labelStyle}>Prefixo Manual</label>
                                    <input
                                        type="text"
                                        value={form.prefixo_manual}
                                        onChange={(e) => updateField("prefixo_manual", e.target.value)}
                                        style={inputStyle}
                                        {...focusHandlers}
                                    />
                                    <p
                                        style={{
                                            fontSize: "11px",
                                            color: colors.textMuted,
                                            marginTop: "5px",
                                            fontStyle: "italic",
                                            fontFamily: "'Inter', sans-serif",
                                            letterSpacing: "0.01em",
                                        }}
                                    >
                                        (Preencher somente se o campo anterior não for informado)
                                    </p>
                                </div>

                                {/* Horário + Agora */}
                                <div>
                                    <label style={labelStyle}>Horário</label>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <input
                                            type="text"
                                            value={form.horario}
                                            onChange={(e) => updateField("horario", maskTime(e.target.value))}
                                            placeholder="HH:MM"
                                            maxLength={5}
                                            style={inputStyle}
                                            {...focusHandlers}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => updateField("horario", getCurrentTime())}
                                            style={quickBtnStyle}
                                            onMouseEnter={(e) =>
                                                ((e.target as HTMLElement).style.backgroundColor = colors.border)
                                            }
                                            onMouseLeave={(e) =>
                                                ((e.target as HTMLElement).style.backgroundColor = colors.card)
                                            }
                                        >
                                            Agora
                                        </button>
                                    </div>
                                </div>

                                {/* Serviço */}
                                <div>
                                    <label style={labelStyle}>Serviço</label>
                                    <input
                                        type="text"
                                        value={form.servico}
                                        onChange={(e) => updateField("servico", e.target.value)}
                                        style={inputStyle}
                                        {...focusHandlers}
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    marginTop: "24px",
                                    paddingTop: "20px",
                                    borderTop: `1px solid ${colors.border}`,
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        setForm(EMPTY_FORM);
                                        setShowForm(false);
                                    }}
                                    style={{
                                        height: "40px",
                                        padding: "0 20px",
                                        backgroundColor: "transparent",
                                        color: colors.textMuted,
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: "4px",
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        fontFamily: "'Inter', sans-serif",
                                        cursor: "pointer",
                                        marginRight: "10px",
                                        transition: "background-color 0.2s",
                                    }}
                                    onMouseEnter={(e) =>
                                        ((e.target as HTMLElement).style.backgroundColor = colors.card)
                                    }
                                    onMouseLeave={(e) =>
                                        ((e.target as HTMLElement).style.backgroundColor = "transparent")
                                    }
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!isFormValid || isSending}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        height: "40px",
                                        padding: "0 24px",
                                        backgroundColor: isFormValid ? colors.text : colors.card,
                                        color: isFormValid ? colors.white : colors.textMuted,
                                        border: "none",
                                        borderRadius: "4px",
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        fontFamily: "'Inter', sans-serif",
                                        letterSpacing: "0.02em",
                                        cursor: isFormValid ? "pointer" : "not-allowed",
                                        opacity: isSending ? 0.7 : 1,
                                        transition: "all 0.2s",
                                    }}
                                >
                                    {isSending ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={14} />
                                            Salvar Registro
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── Records Table ── */}
                <div
                    style={{
                        backgroundColor: colors.white,
                        border: `1px solid ${colors.border}`,
                        borderRadius: "6px",
                        overflow: "hidden",
                    }}
                >
                    <style>{`
                        @keyframes pulse {
                            0%, 100% { opacity: 1; }
                            50% { opacity: 0.4; }
                        }
                    `}</style>

                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontFamily: "'Inter', sans-serif",
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        backgroundColor: colors.bg,
                                        borderBottom: `1px solid ${colors.border}`,
                                    }}
                                >
                                    {[
                                        "Empresa",
                                        "Cliente Final",
                                        "Data",
                                        "Voo",
                                        "Prefixo Aeronave",
                                        "Prefixo Manual",
                                        "Horário",
                                        "Serviço",
                                    ].map((col) => (
                                        <th
                                            key={col}
                                            style={{
                                                padding: "14px 20px",
                                                textAlign: "left",
                                                fontSize: "11px",
                                                fontWeight: 600,
                                                color: colors.textMuted,
                                                letterSpacing: "0.06em",
                                                textTransform: "uppercase",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <>
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                    </>
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            style={{
                                                padding: "64px 20px",
                                                textAlign: "center",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    gap: "12px",
                                                }}
                                            >
                                                <FileText
                                                    size={32}
                                                    strokeWidth={1.2}
                                                    style={{ color: colors.border }}
                                                />
                                                <p
                                                    style={{
                                                        fontSize: "14px",
                                                        color: colors.textMuted,
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    Nenhum registro encontrado
                                                </p>
                                                <p
                                                    style={{
                                                        fontSize: "12px",
                                                        color: `${colors.textMuted}99`,
                                                    }}
                                                >
                                                    Clique em "Novo Registro" para adicionar
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((record, idx) => (
                                        <tr
                                            key={record.id ?? idx}
                                            style={{
                                                borderBottom:
                                                    idx < records.length - 1
                                                        ? `1px solid ${colors.border}`
                                                        : "none",
                                                transition: "background-color 0.15s",
                                            }}
                                            onMouseEnter={(e) =>
                                            ((e.currentTarget as HTMLElement).style.backgroundColor =
                                                colors.bg)
                                            }
                                            onMouseLeave={(e) =>
                                            ((e.currentTarget as HTMLElement).style.backgroundColor =
                                                "transparent")
                                            }
                                        >
                                            <td style={cellStyle}>{record.empresa_solicitante}</td>
                                            <td style={cellStyle}>{record.cliente_final}</td>
                                            <td style={cellStyle}>{record.data}</td>
                                            <td style={cellStyle}>{record.numero_voo}</td>
                                            <td style={cellStyle}>{record.prefixo_aeronave}</td>
                                            <td style={cellStyle}>{record.prefixo_manual || "—"}</td>
                                            <td style={cellStyle}>{record.horario}</td>
                                            <td style={cellStyle}>{record.servico}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Record Count */}
                    {!isLoading && records.length > 0 && (
                        <div
                            style={{
                                padding: "12px 20px",
                                borderTop: `1px solid ${colors.border}`,
                                fontSize: "12px",
                                color: colors.textMuted,
                                fontFamily: "'Inter', sans-serif",
                            }}
                        >
                            {records.length} registro{records.length !== 1 ? "s" : ""}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

const cellStyle: React.CSSProperties = {
    padding: "14px 20px",
    fontSize: "13px",
    color: "#1a1a1a",
    fontFamily: "'Inter', sans-serif",
    whiteSpace: "nowrap",
    letterSpacing: "0.01em",
};
