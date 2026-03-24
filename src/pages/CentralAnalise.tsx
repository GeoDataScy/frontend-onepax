import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { BarChart3, Users, Plane } from "lucide-react";
import DashboardPassageirosContent from "@/components/DashboardPassageirosContent";
import DashboardOperacionalContent from "@/components/DashboardOperacionalContent";

type View = "passageiros" | "operacional";

const sidebarItems: { key: View; label: string; icon: typeof BarChart3 }[] = [
  { key: "passageiros", label: "Passageiros", icon: Users },
  { key: "operacional", label: "Operacional", icon: Plane },
];

const CentralAnalise = () => {
  const [activeView, setActiveView] = useState<View>("passageiros");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFFFFF" }}>
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className="w-[200px] flex-shrink-0 border-r flex flex-col py-4 justify-between"
          style={{ borderColor: "#E8E8E8", backgroundColor: "#FAFAFA" }}
        >
          <div>
            <div className="px-4 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} style={{ color: "#8B0000" }} />
                <span className="text-sm font-bold" style={{ color: "#222" }}>
                  Central de Analises
                </span>
              </div>
            </div>

            <nav className="flex flex-col gap-1 px-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveView(item.key)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left"
                  style={{
                    backgroundColor: activeView === item.key ? "#F0F0F0" : "transparent",
                    color: activeView === item.key ? "#222222" : "#666666",
                    fontWeight: activeView === item.key ? 600 : 400,
                  }}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Byone button */}
          <div className="px-2">
            <button
              onClick={() => navigate("/byone")}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.01]"
              style={{
                background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
                color: "#d4d4d8",
                border: "1px solid #27272a",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#7c3aed";
                e.currentTarget.style.boxShadow = "0 0 12px rgba(124, 58, 237, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#27272a";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <img src="/byone-avatar.png" alt="Byone" className="w-5 h-5 rounded object-cover" />
              Byone
            </button>
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
