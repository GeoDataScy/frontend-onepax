import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
    children: ReactNode;
    denyRoles?: string[];
}

export const ProtectedRoute = ({ children, denyRoles = [] }: ProtectedRouteProps) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (user && denyRoles.includes(user.role)) {
        // Prevent toast spam during redirect
        // toast.error(`Acesso negado para o perfil: ${user.role}`);
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
