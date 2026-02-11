import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { embarqueService, EmbarqueRecord } from "@/services/embarqueService";
import { desembarqueService, DesembarqueRecord } from "@/services/desembarqueService";
import { briefingService, BriefingRecord } from "@/services/briefingService";
import { transporteService, TransporteRecord } from "@/services/transporteService";
import {
    LayoutDashboard,
    PlaneTakeoff,
    PlaneLanding,
    FileText,
    Truck,
    Edit2,
    X,
    Save,
    Loader2,
    Menu
} from "lucide-react";
import { toast } from "sonner";

/* ─── Types & Config ─── */
type ModuleType = "embarque" | "desembarque" | "briefing" | "transporte";

interface ColumnConfig {
    key: string;
    label: string;
    format?: (value: any) => string;
}

interface FieldConfig {
    key: string;
    label: string;
    type: "text" | "number" | "date" | "time" | "select";
    options?: string[];
    readOnly?: boolean;
}

const MODULE_CONFIG: Record<
    ModuleType,
    {
        label: string;
        icon: React.ElementType;
        service: any;
        columns: ColumnConfig[];
        fields: FieldConfig[];
    }
> = {
    embarque: {
        label: "Embarque",
        icon: PlaneTakeoff,
        service: embarqueService,
        columns: [
            { key: "flight_number", label: "Voo" },
            { key: "aeronave", label: "Aeronave" },
            { key: "operadora", label: "Operadora" },
            { key: "departure_date", label: "Data" },
            { key: "departure_time", label: "Horário" },
            { key: "platform", label: "Plataforma" },
            { key: "cliente_final", label: "Cliente" },
            { key: "passengers_boarded", label: "Pax" },
        ],
        fields: [
            { key: "flight_number", label: "Número do Voo", type: "text" },
            { key: "aeronave", label: "Aeronave", type: "text" },
            { key: "operadora", label: "Operadora", type: "text" },
            { key: "departure_date", label: "Data de Partida", type: "date" },
            { key: "departure_time", label: "Horário de Partida", type: "time" },
            { key: "platform", label: "Plataforma", type: "text" },
            { key: "icao", label: "ICAO", type: "text" },
            { key: "cliente_final", label: "Cliente Final", type: "text" },
            { key: "passengers_boarded", label: "Passageiros Embarcados", type: "number" },
            { key: "observacao", label: "Observação", type: "text" },
        ],
    },
    desembarque: {
        label: "Desembarque",
        icon: PlaneLanding,
        service: desembarqueService,
        columns: [
            { key: "flight_number", label: "Voo" },
            { key: "aeronave", label: "Aeronave" },
            { key: "operadora", label: "Operadora" },
            { key: "arrival_date", label: "Data" },
            { key: "arrival_time", label: "Horário" },
            { key: "origin", label: "Origem" },
            { key: "cliente_final", label: "Cliente" },
            { key: "passengers_disembarked", label: "Pax" },
        ],
        fields: [
            { key: "flight_number", label: "Número do Voo", type: "text" },
            { key: "aeronave", label: "Aeronave", type: "text" },
            { key: "operadora", label: "Operadora", type: "text" },
            { key: "arrival_date", label: "Data de Chegada", type: "date" },
            { key: "arrival_time", label: "Horário de Chegada", type: "time" },
            { key: "origin", label: "Origem", type: "text" },
            { key: "cliente_final", label: "Cliente Final", type: "text" },
            { key: "passengers_disembarked", label: "Passageiros Desembarcados", type: "number" },
            { key: "observacao", label: "Observação", type: "text" },
        ],
    },
    briefing: {
        label: "Briefing",
        icon: FileText,
        service: briefingService,
        columns: [
            { key: "companhia_aerea", label: "Companhia" },
            { key: "cliente_final", label: "Cliente" },
            { key: "data", label: "Data" },
            { key: "numero_voo", label: "Voo" },
            { key: "unidade_maritima", label: "Unidade" },
            { key: "horario", label: "Horário" },
            { key: "servico", label: "Serviço" },
        ],
        fields: [
            {
                key: "companhia_aerea",
                label: "Companhia Aérea",
                type: "select",
                options: ["Omni Taxi Aéreo", "Bristow Taxi Aéreo", "Líder Taxi Aéreo", "CHC Brasil Taxi Aéreo"],
            },
            {
                key: "cliente_final",
                label: "Cliente Final",
                type: "select",
                options: ["Petrobras", "Prio"],
            },
            { key: "data", label: "Data", type: "date" },
            { key: "numero_voo", label: "Número do Voo", type: "number" },
            { key: "unidade_maritima", label: "Unidade Marítima", type: "text" },
            { key: "horario", label: "Horário", type: "time" },
            {
                key: "servico",
                label: "Serviço",
                type: "select",
                options: ["Briefing", "Debriefing"],
            },
            { key: "solicitante", label: "Solicitante", type: "text" },
        ],
    },
    transporte: {
        label: "Transporte",
        icon: Truck,
        service: transporteService,
        columns: [
            { key: "empresa_solicitante", label: "Empresa" },
            { key: "cliente_final", label: "Cliente" },
            { key: "data", label: "Data" },
            { key: "numero_voo", label: "Voo" },
            { key: "prefixo_aeronave", label: "Prefixo" },
            { key: "horario", label: "Horário" },
            { key: "servico", label: "Serviço" },
        ],
        fields: [
            {
                key: "empresa_solicitante",
                label: "Empresa que Solicita",
                type: "select",
                options: ["Omni Taxi Aéreo", "Bristow Taxi Aéreo", "Líder Taxi Aéreo", "CHC Brasil Taxi Aéreo"],
            },
            {
                key: "cliente_final",
                label: "Cliente Final",
                type: "select",
                options: ["Petrobras", "Prio"],
            },
            { key: "data", label: "Data", type: "date" },
            { key: "numero_voo", label: "Número do Voo", type: "number" },
            { key: "prefixo_aeronave", label: "Prefixo da Aeronave", type: "text" },
            { key: "prefixo_manual", label: "Prefixo Manual", type: "text" },
            { key: "horario", label: "Horário", type: "time" },
            {
                key: "servico",
                label: "Serviço",
                type: "select",
                options: ["Embarque", "Desembarque"],
            },
        ],
    },
};

/* ─── Styles ─── */
const colors = {
    bg: "#f7f7f5",
    white: "#ffffff",
    card: "#f0efed",
    border: "#e2e1de",
    text: "#1a1a1a",
    textMuted: "#6b6b6b",
    accent: "#c8b89a",
    sidebar: "#0a0e1a",
    sidebarText: "#a0a0a0",
    sidebarActive: "#ffffff",
    sidebarActiveBg: "rgba(255,255,255,0.1)",
};

/* ─── Main Component ─── */
export default function Supervisor() {
    const [activeModule, setActiveModule] = useState<ModuleType>("embarque");
    const [records, setRecords] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingRecord, setEditingRecord] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const activeConfig = MODULE_CONFIG[activeModule];

    /* Fetch Data */
    const fetchRecords = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await activeConfig.service.list();
            setRecords(data);
        } catch (error) {
            toast.error("Erro ao carregar registros");
        } finally {
            setIsLoading(false);
        }
    }, [activeModule, activeConfig]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    /* Handlers */
    const handleEdit = (record: any) => {
        setEditingRecord({ ...record });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRecord) return;

        try {
            setIsSaving(true);
            await activeConfig.service.update(editingRecord.id, editingRecord);
            toast.success("Registro atualizado com sucesso");
            setEditingRecord(null);
            fetchRecords();
        } catch (error) {
            toast.error("Erro ao atualizar registro");
        } finally {
            setIsSaving(false);
        }
    };

    const updateEditField = (key: string, value: any) => {
        setEditingRecord((prev: any) => ({ ...prev, [key]: value }));
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: colors.bg, display: "flex", flexDirection: "column" }}>
            <Navbar />

            <div style={{ display: "flex", flex: 1, position: "relative" }}>
                {/* ── Sidebar ── */}
                <aside
                    className={`
                        fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
                        lg:relative lg:translate-x-0
                    `}
                    style={{
                        backgroundColor: colors.sidebar,
                        padding: "32px 0",
                        display: "flex",
                        flexDirection: "column",
                        ...(window.innerWidth < 1024 && !isMobileMenuOpen ? { transform: "translateX(-100%)" } : {}),
                    }}
                >
                    <div style={{ padding: "0 24px 32px" }}>
                        <h2 style={{ color: colors.white, fontSize: "18px", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                            Área do Supervisor
                        </h2>
                        <p style={{ color: colors.sidebarText, fontSize: "12px", marginTop: "4px" }}>
                            Gestão operacional
                        </p>
                    </div>

                    <nav style={{ flex: 1 }}>
                        {(Object.keys(MODULE_CONFIG) as ModuleType[]).map((module) => {
                            const config = MODULE_CONFIG[module];
                            const isActive = activeModule === module;
                            const Icon = config.icon;

                            return (
                                <button
                                    key={module}
                                    onClick={() => {
                                        setActiveModule(module);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        padding: "16px 24px",
                                        backgroundColor: isActive ? colors.sidebarActiveBg : "transparent",
                                        color: isActive ? colors.sidebarActive : colors.sidebarText,
                                        border: "none",
                                        borderLeft: isActive ? `3px solid ${colors.accent}` : "3px solid transparent",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        fontFamily: "'Inter', sans-serif",
                                        transition: "all 0.2s",
                                        textAlign: "left",
                                    }}
                                >
                                    <Icon size={18} />
                                    {config.label}
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* ── Mobile Menu Overlay ── */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* ── Main Content ── */}
                <main style={{ flex: 1, padding: "32px", overflowX: "hidden" }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <button
                                className="lg:hidden"
                                onClick={() => setIsMobileMenuOpen(true)}
                                style={{
                                    padding: "8px",
                                    background: "transparent",
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: "4px",
                                    color: colors.text,
                                }}
                            >
                                <Menu size={20} />
                            </button>
                            <div>
                                <h1 style={{ fontSize: "24px", fontWeight: 600, color: colors.text, fontFamily: "'Inter', sans-serif" }}>
                                    {activeConfig.label}
                                </h1>
                                <p style={{ fontSize: "13px", color: colors.textMuted, marginTop: "4px" }}>
                                    {records.length} registro{records.length !== 1 ? "s" : ""} encontrados
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div
                        style={{
                            backgroundColor: colors.white,
                            border: `1px solid ${colors.border}`,
                            borderRadius: "6px",
                            overflow: "hidden",
                        }}
                    >
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Inter', sans-serif" }}>
                                <thead>
                                    <tr style={{ backgroundColor: colors.bg, borderBottom: `1px solid ${colors.border}` }}>
                                        {activeConfig.columns.map((col) => (
                                            <th
                                                key={col.key}
                                                style={{
                                                    padding: "14px 20px",
                                                    textAlign: "left",
                                                    fontSize: "11px",
                                                    fontWeight: 600,
                                                    color: colors.textMuted,
                                                    textTransform: "uppercase",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {col.label}
                                            </th>
                                        ))}
                                        <th style={{ padding: "14px 20px", width: "50px" }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={activeConfig.columns.length + 1} style={{ padding: "40px", textAlign: "center" }}>
                                                <Loader2 className="animate-spin mx-auto text-muted-foreground" />
                                            </td>
                                        </tr>
                                    ) : records.length === 0 ? (
                                        <tr>
                                            <td colSpan={activeConfig.columns.length + 1} style={{ padding: "40px", textAlign: "center", color: colors.textMuted, fontSize: "14px" }}>
                                                Nenhum registro encontrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        records.map((record, idx) => (
                                            <tr
                                                key={record.id || idx}
                                                style={{
                                                    borderBottom: idx < records.length - 1 ? `1px solid ${colors.border}` : "none",
                                                    transition: "background-color 0.15s",
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bg)}
                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                            >
                                                {activeConfig.columns.map((col) => (
                                                    <td key={col.key} style={{ padding: "14px 20px", fontSize: "13px", color: colors.text, whiteSpace: "nowrap" }}>
                                                        {col.format ? col.format(record[col.key]) : record[col.key]}
                                                    </td>
                                                ))}
                                                <td style={{ padding: "14px 20px", textAlign: "right" }}>
                                                    <button
                                                        onClick={() => handleEdit(record)}
                                                        style={{
                                                            background: "transparent",
                                                            border: "none",
                                                            cursor: "pointer",
                                                            color: colors.textMuted,
                                                            padding: "4px",
                                                        }}
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* ── Edit Modal ── */}
            {editingRecord && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 50,
                        padding: "20px",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: colors.white,
                            borderRadius: "8px",
                            width: "100%",
                            maxWidth: "600px",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        }}
                    >
                        <div
                            style={{
                                padding: "20px 24px",
                                borderBottom: `1px solid ${colors.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                position: "sticky",
                                top: 0,
                                backgroundColor: colors.white,
                                zIndex: 10,
                            }}
                        >
                            <h3 style={{ fontSize: "18px", fontWeight: 600, color: colors.text }}>Editar Registro</h3>
                            <button
                                onClick={() => setEditingRecord(null)}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    color: colors.textMuted,
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} style={{ padding: "24px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                {activeConfig.fields.map((field) => (
                                    <div key={field.key} style={{ gridColumn: field.type === "text" && activeConfig.fields.length % 2 !== 0 ? "span 2" : "auto" }}>
                                        <label
                                            style={{
                                                display: "block",
                                                fontSize: "11px",
                                                fontWeight: 500,
                                                color: colors.textMuted,
                                                textTransform: "uppercase",
                                                marginBottom: "6px",
                                                fontFamily: "'Inter', sans-serif",
                                            }}
                                        >
                                            {field.label}
                                        </label>

                                        {field.type === "select" ? (
                                            <select
                                                value={editingRecord[field.key] || ""}
                                                onChange={(e) => updateEditField(field.key, e.target.value)}
                                                disabled={field.readOnly}
                                                style={{
                                                    width: "100%",
                                                    height: "40px",
                                                    padding: "0 12px",
                                                    borderRadius: "4px",
                                                    border: `1px solid ${colors.border}`,
                                                    backgroundColor: field.readOnly ? colors.bg : colors.white,
                                                    fontSize: "13px",
                                                    color: colors.text,
                                                    outline: "none",
                                                }}
                                            >
                                                <option value="" disabled>Selecione</option>
                                                {field.options?.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type}
                                                value={editingRecord[field.key] || ""}
                                                onChange={(e) => updateEditField(field.key, e.target.value)}
                                                disabled={field.readOnly}
                                                style={{
                                                    width: "100%",
                                                    height: "40px",
                                                    padding: "0 12px",
                                                    borderRadius: "4px",
                                                    border: `1px solid ${colors.border}`,
                                                    backgroundColor: field.readOnly ? colors.bg : colors.white,
                                                    fontSize: "13px",
                                                    color: colors.text,
                                                    outline: "none",
                                                }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div
                                style={{
                                    marginTop: "24px",
                                    paddingTop: "20px",
                                    borderTop: `1px solid ${colors.border}`,
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "12px",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setEditingRecord(null)}
                                    style={{
                                        padding: "8px 16px",
                                        borderRadius: "4px",
                                        border: `1px solid ${colors.border}`,
                                        backgroundColor: "transparent",
                                        color: colors.textMuted,
                                        fontSize: "13px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    style={{
                                        padding: "8px 24px",
                                        borderRadius: "4px",
                                        border: "none",
                                        backgroundColor: colors.text,
                                        color: colors.white,
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        cursor: isSaving ? "not-allowed" : "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        opacity: isSaving ? 0.7 : 1,
                                    }}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={14} />
                                            Salvar Alterações
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
