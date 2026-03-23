import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { embarqueService, EmbarqueRecord } from "@/services/embarqueService";
import { desembarqueService, DesembarqueRecord } from "@/services/desembarqueService";
import { briefingService, BriefingRecord } from "@/services/briefingService";
import { transporteService, TransporteRecord } from "@/services/transporteService";
import {
    PlaneTakeoff,
    PlaneLanding,
    FileText,
    Truck,
    Edit2,
    X,
    Save,
    Loader2,
    Menu,
    Filter,
    RotateCcw,
    Trash2,
    AlertTriangle,
    Plus
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

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
            { key: "icao", label: "ICAO" },
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
            { key: "icao", label: "ICAO" },
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
            { key: "icao", label: "ICAO", type: "text" },
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
    const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState<Record<string, any>>({});
    const [isCreating, setIsCreating] = useState(false);
    const [filterDateStart, setFilterDateStart] = useState("");
    const [filterDateEnd, setFilterDateEnd] = useState("");
    const [filterOperadora, setFilterOperadora] = useState("");
    const [filterCliente, setFilterCliente] = useState("");

    const activeConfig = MODULE_CONFIG[activeModule];

    /* Clear filters on module change */
    useEffect(() => {
        setFilterDateStart("");
        setFilterDateEnd("");
        setFilterOperadora("");
        setFilterCliente("");
    }, [activeModule]);

    /* Filter helpers */
    const getDateKey = (module: ModuleType) => {
        if (module === "embarque") return "departure_date";
        if (module === "desembarque") return "arrival_date";
        return "data";
    };

    const getOperadoraKey = (module: ModuleType) => {
        if (module === "embarque" || module === "desembarque") return "operadora";
        if (module === "briefing") return "companhia_aerea";
        return "empresa_solicitante";
    };

    const filteredRecords = records.filter((record) => {
        const dateKey = getDateKey(activeModule);
        const operadoraKey = getOperadoraKey(activeModule);
        const recordDate = record[dateKey] || "";

        if (filterDateStart && recordDate < filterDateStart) return false;
        if (filterDateEnd && recordDate > filterDateEnd) return false;
        if (filterOperadora && record[operadoraKey] !== filterOperadora) return false;
        if (filterCliente && record.cliente_final !== filterCliente) return false;

        return true;
    });

    const uniqueOperadoras = [...new Set(records.map((r) => r[getOperadoraKey(activeModule)]).filter(Boolean))].sort();
    const uniqueClientes = [...new Set(records.map((r) => r.cliente_final).filter(Boolean))].sort();
    const hasActiveFilters = filterDateStart || filterDateEnd || filterOperadora || filterCliente;

    /* Export to Excel */
    const handleExportExcel = () => {
        if (filteredRecords.length === 0) {
            toast.error("Nenhum registro para exportar");
            return;
        }
        const exportData = filteredRecords.map((record) => {
            const row: Record<string, any> = {};
            activeConfig.fields.forEach((field) => {
                row[field.label] = record[field.key] ?? "";
            });
            return row;
        });
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, activeConfig.label);
        XLSX.writeFile(wb, `${activeConfig.label}_${new Date().toISOString().slice(0, 10)}.xlsx`);
        toast.success("Exportado com sucesso");
    };

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

    const handleDelete = (record: any) => {
        setDeleteTarget(record);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await activeConfig.service.delete(deleteTarget.id);
            toast.success("Registro deletado com sucesso");
            setDeleteTarget(null);
            fetchRecords();
        } catch {
            toast.error("Erro ao deletar registro");
        } finally {
            setIsDeleting(false);
        }
    };

    const getDeleteInfo = (record: any) => {
        if (activeModule === "embarque" || activeModule === "desembarque") {
            return { voo: record.flight_number, operadora: record.operadora };
        }
        if (activeModule === "briefing") {
            return { voo: record.numero_voo, operadora: record.companhia_aerea };
        }
        return { voo: record.numero_voo, operadora: record.empresa_solicitante };
    };

    const openCreateForm = () => {
        const empty: Record<string, any> = {};
        activeConfig.fields.forEach((f) => { empty[f.key] = ""; });
        setCreateForm(empty);
        setShowCreateForm(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsCreating(true);
            await activeConfig.service.create(createForm);
            toast.success("Registro criado com sucesso");
            setShowCreateForm(false);
            fetchRecords();
        } catch (error: any) {
            toast.error(error.message || "Erro ao criar registro");
        } finally {
            setIsCreating(false);
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
                                    {filteredRecords.length} de {records.length} registro{records.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div
                        style={{
                            backgroundColor: colors.white,
                            border: `1px solid ${colors.border}`,
                            borderRadius: "6px",
                            padding: "14px 20px",
                            marginBottom: "16px",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {/* Filter icon + label */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                color: colors.textMuted,
                                fontSize: "12px",
                                fontWeight: 600,
                                fontFamily: "'Inter', sans-serif",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                whiteSpace: "nowrap",
                                paddingRight: "4px",
                                borderRight: `1px solid ${colors.border}`,
                                marginRight: "4px",
                                height: "36px",
                            }}>
                                <Filter size={13} />
                                Filtros
                            </div>

                            {/* Filter fields row */}
                            <div style={{ display: "flex", flex: 1, alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                <input
                                    type="date"
                                    value={filterDateStart}
                                    onChange={(e) => setFilterDateStart(e.target.value)}
                                    title="Data Início"
                                    style={{
                                        height: "36px",
                                        padding: "0 10px",
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: "6px",
                                        fontSize: "13px",
                                        color: filterDateStart ? colors.text : colors.textMuted,
                                        backgroundColor: colors.bg,
                                        fontFamily: "'Inter', sans-serif",
                                        outline: "none",
                                        flex: "1 1 130px",
                                        minWidth: "130px",
                                        maxWidth: "160px",
                                        transition: "border-color 0.2s",
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
                                    onBlur={(e) => { e.target.style.borderColor = colors.border; }}
                                />

                                <span style={{ color: colors.textMuted, fontSize: "12px", fontFamily: "'Inter', sans-serif" }}>até</span>

                                <input
                                    type="date"
                                    value={filterDateEnd}
                                    onChange={(e) => setFilterDateEnd(e.target.value)}
                                    title="Data Fim"
                                    style={{
                                        height: "36px",
                                        padding: "0 10px",
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: "6px",
                                        fontSize: "13px",
                                        color: filterDateEnd ? colors.text : colors.textMuted,
                                        backgroundColor: colors.bg,
                                        fontFamily: "'Inter', sans-serif",
                                        outline: "none",
                                        flex: "1 1 130px",
                                        minWidth: "130px",
                                        maxWidth: "160px",
                                        transition: "border-color 0.2s",
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
                                    onBlur={(e) => { e.target.style.borderColor = colors.border; }}
                                />

                                <div style={{ width: "1px", height: "20px", backgroundColor: colors.border }} />

                                <select
                                    value={filterOperadora}
                                    onChange={(e) => setFilterOperadora(e.target.value)}
                                    title="Operadora"
                                    style={{
                                        height: "36px",
                                        padding: "0 28px 0 10px",
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: "6px",
                                        fontSize: "13px",
                                        color: filterOperadora ? colors.text : colors.textMuted,
                                        backgroundColor: colors.bg,
                                        fontFamily: "'Inter', sans-serif",
                                        outline: "none",
                                        flex: "1 1 160px",
                                        minWidth: "140px",
                                        maxWidth: "200px",
                                        appearance: "none",
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b6b6b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                        backgroundRepeat: "no-repeat",
                                        backgroundPosition: "right 10px center",
                                        cursor: "pointer",
                                        transition: "border-color 0.2s",
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
                                    onBlur={(e) => { e.target.style.borderColor = colors.border; }}
                                >
                                    <option value="">Operadora</option>
                                    {uniqueOperadoras.map((op) => (
                                        <option key={op} value={op}>{op}</option>
                                    ))}
                                </select>

                                <select
                                    value={filterCliente}
                                    onChange={(e) => setFilterCliente(e.target.value)}
                                    title="Cliente Final"
                                    style={{
                                        height: "36px",
                                        padding: "0 28px 0 10px",
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: "6px",
                                        fontSize: "13px",
                                        color: filterCliente ? colors.text : colors.textMuted,
                                        backgroundColor: colors.bg,
                                        fontFamily: "'Inter', sans-serif",
                                        outline: "none",
                                        flex: "1 1 130px",
                                        minWidth: "120px",
                                        maxWidth: "160px",
                                        appearance: "none",
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b6b6b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                        backgroundRepeat: "no-repeat",
                                        backgroundPosition: "right 10px center",
                                        cursor: "pointer",
                                        transition: "border-color 0.2s",
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
                                    onBlur={(e) => { e.target.style.borderColor = colors.border; }}
                                >
                                    <option value="">Cliente</option>
                                    {uniqueClientes.map((cl) => (
                                        <option key={cl} value={cl}>{cl}</option>
                                    ))}
                                </select>

                                {hasActiveFilters && (
                                    <button
                                        onClick={() => {
                                            setFilterDateStart("");
                                            setFilterDateEnd("");
                                            setFilterOperadora("");
                                            setFilterCliente("");
                                        }}
                                        title="Limpar filtros"
                                        style={{
                                            height: "36px",
                                            width: "36px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: colors.bg,
                                            color: colors.textMuted,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            flexShrink: 0,
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = colors.border;
                                            e.currentTarget.style.color = colors.text;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = colors.bg;
                                            e.currentTarget.style.color = colors.textMuted;
                                        }}
                                    >
                                        <RotateCcw size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Divider */}
                            <div style={{ width: "1px", height: "28px", backgroundColor: colors.border, flexShrink: 0 }} />

                            {/* Export button */}
                            <button
                                onClick={handleExportExcel}
                                title="Exportar para Excel"
                                style={{
                                    height: "36px",
                                    padding: "0 16px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    backgroundColor: "#f0f7f0",
                                    color: "#1a5c2a",
                                    border: "1px solid #c3dcc8",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    fontFamily: "'Inter', sans-serif",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#e2f0e4";
                                    e.currentTarget.style.borderColor = "#a8cdb0";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "#f0f7f0";
                                    e.currentTarget.style.borderColor = "#c3dcc8";
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a5c2a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="8" y1="13" x2="16" y2="13" />
                                    <line x1="8" y1="17" x2="16" y2="17" />
                                    <line x1="12" y1="9" x2="12" y2="21" />
                                </svg>
                                Exportar
                            </button>

                            {/* Add record button */}
                            <button
                                onClick={openCreateForm}
                                title="Adicionar registro"
                                style={{
                                    height: "36px",
                                    padding: "0 16px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    backgroundColor: colors.text,
                                    color: colors.white,
                                    border: "none",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    fontFamily: "'Inter', sans-serif",
                                    cursor: "pointer",
                                    transition: "opacity 0.2s",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                            >
                                <Plus size={15} strokeWidth={2.5} />
                                Adicionar Voo
                            </button>
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
                                    ) : filteredRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={activeConfig.columns.length + 1} style={{ padding: "40px", textAlign: "center", color: colors.textMuted, fontSize: "14px" }}>
                                                Nenhum registro encontrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRecords.map((record, idx) => (
                                            <tr
                                                key={record.id || idx}
                                                style={{
                                                    borderBottom: idx < filteredRecords.length - 1 ? `1px solid ${colors.border}` : "none",
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
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                                                        <button
                                                            onClick={() => handleEdit(record)}
                                                            style={{
                                                                background: "transparent",
                                                                border: "none",
                                                                cursor: "pointer",
                                                                color: colors.textMuted,
                                                                padding: "4px",
                                                                transition: "color 0.2s",
                                                            }}
                                                            title="Editar"
                                                            onMouseEnter={(e) => { e.currentTarget.style.color = colors.text; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.color = colors.textMuted; }}
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(record)}
                                                            style={{
                                                                background: "transparent",
                                                                border: "none",
                                                                cursor: "pointer",
                                                                color: colors.textMuted,
                                                                padding: "4px",
                                                                transition: "color 0.2s",
                                                            }}
                                                            title="Deletar"
                                                            onMouseEnter={(e) => { e.currentTarget.style.color = "#dc2626"; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.color = colors.textMuted; }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
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

            {/* ── Create Modal ── */}
            {showCreateForm && (
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
                    onClick={() => setShowCreateForm(false)}
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
                        onClick={(e) => e.stopPropagation()}
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
                            <h3 style={{ fontSize: "18px", fontWeight: 600, color: colors.text, fontFamily: "'Inter', sans-serif", margin: 0 }}>
                                Adicionar {activeConfig.label}
                            </h3>
                            <button
                                onClick={() => setShowCreateForm(false)}
                                style={{ background: "transparent", border: "none", cursor: "pointer", color: colors.textMuted }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} style={{ padding: "24px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                {activeConfig.fields.map((field) => (
                                    <div key={field.key}>
                                        <label
                                            style={{
                                                display: "block",
                                                fontSize: "11px",
                                                fontWeight: 500,
                                                color: colors.textMuted,
                                                textTransform: "uppercase",
                                                marginBottom: "6px",
                                                fontFamily: "'Inter', sans-serif",
                                                letterSpacing: "0.06em",
                                            }}
                                        >
                                            {field.label}
                                        </label>

                                        {field.type === "select" ? (
                                            <select
                                                value={createForm[field.key] || ""}
                                                onChange={(e) => setCreateForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                                style={{
                                                    width: "100%",
                                                    height: "40px",
                                                    padding: "0 12px",
                                                    borderRadius: "4px",
                                                    border: `1px solid ${colors.border}`,
                                                    backgroundColor: colors.white,
                                                    fontSize: "13px",
                                                    color: colors.text,
                                                    outline: "none",
                                                    fontFamily: "'Inter', sans-serif",
                                                }}
                                            >
                                                <option value="" disabled>Selecione</option>
                                                {field.options?.map((opt) => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type}
                                                value={createForm[field.key] || ""}
                                                onChange={(e) => setCreateForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                                style={{
                                                    width: "100%",
                                                    height: "40px",
                                                    padding: "0 12px",
                                                    borderRadius: "4px",
                                                    border: `1px solid ${colors.border}`,
                                                    backgroundColor: colors.white,
                                                    fontSize: "13px",
                                                    color: colors.text,
                                                    outline: "none",
                                                    fontFamily: "'Inter', sans-serif",
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
                                    onClick={() => setShowCreateForm(false)}
                                    style={{
                                        padding: "8px 16px",
                                        borderRadius: "4px",
                                        border: `1px solid ${colors.border}`,
                                        backgroundColor: "transparent",
                                        color: colors.textMuted,
                                        fontSize: "13px",
                                        cursor: "pointer",
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    style={{
                                        padding: "8px 24px",
                                        borderRadius: "4px",
                                        border: "none",
                                        backgroundColor: colors.text,
                                        color: colors.white,
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        cursor: isCreating ? "not-allowed" : "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        opacity: isCreating ? 0.7 : 1,
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={14} />
                                            Salvar Registro
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {deleteTarget && (() => {
                const info = getDeleteInfo(deleteTarget);
                return (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(0,0,0,0.45)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 60,
                            padding: "20px",
                        }}
                        onClick={() => setDeleteTarget(null)}
                    >
                        <div
                            style={{
                                backgroundColor: colors.white,
                                borderRadius: "10px",
                                width: "100%",
                                maxWidth: "420px",
                                boxShadow: "0 20px 40px -8px rgba(0,0,0,0.15)",
                                overflow: "hidden",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Warning header */}
                            <div style={{
                                padding: "24px 24px 0",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "16px",
                            }}>
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "50%",
                                    backgroundColor: "#fef3c7",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                    <AlertTriangle size={24} style={{ color: "#d97706" }} />
                                </div>
                                <h3 style={{
                                    fontSize: "17px",
                                    fontWeight: 600,
                                    color: colors.text,
                                    fontFamily: "'Inter', sans-serif",
                                    margin: 0,
                                    textAlign: "center",
                                }}>
                                    Confirmar exclusão
                                </h3>
                            </div>

                            {/* Record info */}
                            <div style={{ padding: "16px 24px 0", textAlign: "center" }}>
                                <p style={{
                                    fontSize: "13px",
                                    color: colors.textMuted,
                                    fontFamily: "'Inter', sans-serif",
                                    margin: "0 0 12px",
                                    lineHeight: "1.5",
                                }}>
                                    Você está prestes a deletar o seguinte registro:
                                </p>
                                <div style={{
                                    backgroundColor: colors.bg,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: "8px",
                                    padding: "14px 18px",
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "24px",
                                }}>
                                    <div>
                                        <span style={{
                                            display: "block",
                                            fontSize: "10px",
                                            fontWeight: 600,
                                            color: colors.textMuted,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.08em",
                                            marginBottom: "4px",
                                            fontFamily: "'Inter', sans-serif",
                                        }}>Voo</span>
                                        <span style={{
                                            fontSize: "15px",
                                            fontWeight: 600,
                                            color: colors.text,
                                            fontFamily: "'Inter', sans-serif",
                                        }}>{info.voo || "—"}</span>
                                    </div>
                                    <div style={{ width: "1px", backgroundColor: colors.border }} />
                                    <div>
                                        <span style={{
                                            display: "block",
                                            fontSize: "10px",
                                            fontWeight: 600,
                                            color: colors.textMuted,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.08em",
                                            marginBottom: "4px",
                                            fontFamily: "'Inter', sans-serif",
                                        }}>Operadora</span>
                                        <span style={{
                                            fontSize: "15px",
                                            fontWeight: 600,
                                            color: colors.text,
                                            fontFamily: "'Inter', sans-serif",
                                        }}>{info.operadora || "—"}</span>
                                    </div>
                                </div>
                                <p style={{
                                    fontSize: "12px",
                                    color: "#b45309",
                                    fontFamily: "'Inter', sans-serif",
                                    margin: "12px 0 0",
                                    fontWeight: 500,
                                }}>
                                    Esta ação não pode ser desfeita.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div style={{
                                padding: "20px 24px 24px",
                                display: "flex",
                                gap: "10px",
                                justifyContent: "center",
                            }}>
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    style={{
                                        flex: 1,
                                        height: "40px",
                                        borderRadius: "6px",
                                        border: `1px solid ${colors.border}`,
                                        backgroundColor: colors.white,
                                        color: colors.text,
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        fontFamily: "'Inter', sans-serif",
                                        cursor: "pointer",
                                        transition: "background-color 0.2s",
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bg; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.white; }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    style={{
                                        flex: 1,
                                        height: "40px",
                                        borderRadius: "6px",
                                        border: "none",
                                        backgroundColor: "#dc2626",
                                        color: "#ffffff",
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        fontFamily: "'Inter', sans-serif",
                                        cursor: isDeleting ? "not-allowed" : "pointer",
                                        opacity: isDeleting ? 0.7 : 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                        transition: "background-color 0.2s",
                                    }}
                                    onMouseEnter={(e) => { if (!isDeleting) e.currentTarget.style.backgroundColor = "#b91c1c"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#dc2626"; }}
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Deletando...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={14} />
                                            Deletar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

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
