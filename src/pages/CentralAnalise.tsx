import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { BarChart3, Users, Plane, ChevronLeft, ChevronRight } from "lucide-react";
import DashboardPassageirosContent from "@/components/DashboardPassageirosContent";
import DashboardOperacionalContent from "@/components/DashboardOperacionalContent";

type View = "passageiros" | "operacional";

const sidebarItems: { key: View; label: string; icon: typeof BarChart3 }[] = [
  { key: "passageiros", label: "Passageiros", icon: Users },
  { key: "operacional", label: "Operacional", icon: Plane },
];

const SIDEBAR_STORAGE_KEY = "central-analise:sidebar-collapsed";

const CentralAnalise = () => {
  const [activeView, setActiveView] = useState<View>("passageiros");
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1";
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFFFFF" }}>
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${collapsed ? "w-[56px]" : "w-[200px]"} flex-shrink-0 border-r flex flex-col py-4 transition-[width] duration-200`}
          style={{ borderColor: "#E8E8E8", backgroundColor: "#FAFAFA" }}
        >
          <div>
            <div className={`mb-4 flex items-center ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}>
              {!collapsed && (
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} style={{ color: "#8B0000" }} />
                  <span className="text-sm font-bold" style={{ color: "#222" }}>
                    Central de Analises
                  </span>
                </div>
              )}
              <button
                onClick={() => setCollapsed((c) => !c)}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                aria-label={collapsed ? "Expandir sidebar" : "Minimizar sidebar"}
                title={collapsed ? "Expandir" : "Minimizar"}
                style={{ color: "#666" }}
              >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>

            <nav className="flex flex-col gap-1 px-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveView(item.key)}
                  className={`flex items-center ${collapsed ? "justify-center px-0" : "gap-2 px-3"} py-2 rounded-md text-sm transition-colors text-left`}
                  title={collapsed ? item.label : undefined}
                  style={{
                    backgroundColor: activeView === item.key ? "#F0F0F0" : "transparent",
                    color: activeView === item.key ? "#222222" : "#666666",
                    fontWeight: activeView === item.key ? 600 : 400,
                  }}
                >
                  <item.icon size={16} />
                  {!collapsed && item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {activeView === "passageiros" && <DashboardPassageirosContent />}
          {activeView === "operacional" && <DashboardOperacionalContent />}
        </div>
      </div>
    </div>
  );
};

export default CentralAnalise;
