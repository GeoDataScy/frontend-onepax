import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { NotificationContainer } from "@/components/NotificationContainer";
import Index from "./pages/Index";
import Desembarque from "./pages/Desembarque";
import Briefing from "./pages/Briefing";
import Transporte from "./pages/Transporte";
import Supervisor from "./pages/Supervisor";
import CentralAnalise from "./pages/CentralAnalise";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <NotificationContainer />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/desembarque" element={
              <ProtectedRoute>
                <Desembarque />
              </ProtectedRoute>
            } />
            <Route path="/briefing" element={
              <ProtectedRoute denyRoles={['apac']}>
                <Briefing />
              </ProtectedRoute>
            } />
            <Route path="/transporte" element={
              <ProtectedRoute denyRoles={['apac']}>
                <Transporte />
              </ProtectedRoute>
            } />
            <Route path="/supervisor" element={
              <ProtectedRoute denyRoles={['apac']}>
                <Supervisor />
              </ProtectedRoute>
            } />
            <Route path="/central-analise" element={
              <ProtectedRoute denyRoles={['apac']}>
                <CentralAnalise />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
