import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Verificar se há um usuário autenticado ao carregar
    useEffect(() => {
        const loadUser = async () => {
            try {
                if (authService.isAuthenticated()) {
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                }
            } catch (error) {
                console.error('Erro ao carregar usuário:', error);
                authService.logout();
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (username: string, password: string) => {
        try {
            setIsLoading(true);
            await authService.login(username, password);
            const userData = await authService.getCurrentUser();
            setUser(userData);
            toast.success(`Bem-vindo, ${userData.first_name || userData.username}!`);

            // Redirecionar baseado no local selecionado
            const userLocal = localStorage.getItem('user_local');
            switch (userLocal) {
                case 'DESEMBARQUE':
                    navigate('/desembarque');
                    break;
                case 'BRIEFING':
                    navigate('/briefing');
                    break;
                case 'TRANSPORTE':
                    navigate('/transporte');
                    break;
                case 'SUPERVISOR':
                    navigate('/supervisor');
                    break;
                case 'CENTRAL_ANALISE':
                    navigate('/central-analise');
                    break;
                default:
                    navigate('/'); // Embarque (padrão)
                    break;
            }
        } catch (error: any) {
            toast.error(error.message || 'Erro ao fazer login');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        localStorage.removeItem('user_local'); // Limpar local selecionado
        toast.info('Você foi desconectado');
        navigate('/login');
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
