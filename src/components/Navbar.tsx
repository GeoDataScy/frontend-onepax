import { useState, useEffect } from "react";
import { Bell, User, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
  };

  const isApac = user?.role === 'apac';

  const navLinks = [
    { to: "/", label: "Embarque" },
    { to: "/desembarque", label: "Desembarque" },
    // Hide these for 'apac'
    ...(!isApac ? [
      { to: "/briefing", label: "Briefing" },
      { to: "/transporte", label: "Transporte" },
      { to: "/supervisor", label: "Supervisor" },
      { to: "/central-analise", label: "Central de Análise" },
    ] : []),
  ];

  return (
    <nav className="w-full text-white" style={{ backgroundColor: '#0a0e1a' }}>
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <img
            src="/Onepax_cabecalho.png"
            alt="Onepax"
            className="h-9 w-auto object-contain select-none"
            draggable={false}
          />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-success rounded-full animate-pulse-soft" />
            <span className="text-sm font-medium">ControlID Conectado</span>
          </div>

          <span className="hidden lg:block text-sm text-white/80 font-mono">
            {formatDate(currentTime)}
          </span>

          <div className="flex items-center gap-3">
            <button className="hidden sm:block p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-lg hover:bg-white/10 text-white hover:text-white">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.first_name || user?.username}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || 'Sem email'}
                    </p>
                    <p className="text-xs font-semibold mt-1 text-primary capitalize">
                      {user?.role || 'Usuário'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0a0e1a] px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-3 rounded-md text-base font-medium transition-colors ${isActive
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/5"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-4 mt-4 border-t border-white/10">
            <div className="flex items-center gap-2 px-3 py-2 text-white/70">
              <span className="w-2.5 h-2.5 bg-success rounded-full" />
              <span className="text-sm">ControlID Conectado</span>
            </div>
            <div className="px-3 py-2 text-sm text-white/70 font-mono">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
