import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, User, MapPin, ArrowRight } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [local, setLocal] = useState<'EMBARQUE' | 'DESEMBARQUE' | 'BRIEFING' | 'TRANSPORTE' | 'SUPERVISOR' | 'CENTRAL_ANALISE' | ''>('');
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { login } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password || !local) {
            return;
        }

        try {
            setIsLoading(true);
            localStorage.setItem('user_local', local);
            await login(username, password);
        } catch (error) {
            console.error('Erro no login:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = username && password && local;

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Panel — Logo (full bleed image) */}
            <div
                className={`w-full lg:w-[35%] relative overflow-hidden lg:min-h-screen transition-opacity duration-700 ease-out ${mounted ? 'opacity-100' : 'opacity-0'
                    }`}
                style={{ minHeight: '220px' }}
            >
                <img
                    src="/logo-onepax.png"
                    alt="Onepax"
                    className="w-full h-full object-cover select-none absolute inset-0"
                    draggable={false}
                />
            </div>

            {/* Right Panel — Login Form */}
            <div className="w-full lg:w-[65%] flex flex-col items-center justify-center bg-white px-6 py-12 lg:py-0 relative lg:min-h-screen">
                <div className="w-full max-w-sm">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div
                            className={`transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                                }`}
                            style={{ transitionDelay: '150ms' }}
                        >
                            <label htmlFor="username" className="sr-only">
                                Usuário
                            </label>
                            <div className="relative group">
                                <User
                                    className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] transition-colors duration-200"
                                    style={{ color: '#9CA3AF' }}
                                />
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Usuário"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    autoFocus
                                    className="w-full h-12 pl-12 pr-4 rounded-lg text-sm transition-all duration-200 outline-none"
                                    style={{
                                        backgroundColor: '#FAFAFA',
                                        border: '1.5px solid #E2E4E9',
                                        color: '#1A1A2E',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1A1A2E';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(26,26,46,0.06)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#E2E4E9';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div
                            className={`transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                                }`}
                            style={{ transitionDelay: '250ms' }}
                        >
                            <label htmlFor="password" className="sr-only">
                                Senha
                            </label>
                            <div className="relative group">
                                <Lock
                                    className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] transition-colors duration-200"
                                    style={{ color: '#9CA3AF' }}
                                />
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="w-full h-12 pl-12 pr-4 rounded-lg text-sm transition-all duration-200 outline-none"
                                    style={{
                                        backgroundColor: '#FAFAFA',
                                        border: '1.5px solid #E2E4E9',
                                        color: '#1A1A2E',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1A1A2E';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(26,26,46,0.06)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#E2E4E9';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>

                        {/* Local Select */}
                        <div
                            className={`transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                                }`}
                            style={{ transitionDelay: '350ms' }}
                        >
                            <label htmlFor="local" className="sr-only">
                                Local
                            </label>
                            <div className="relative group">
                                <MapPin
                                    className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] transition-colors duration-200 z-10 pointer-events-none"
                                    style={{ color: '#9CA3AF' }}
                                />
                                <select
                                    id="local"
                                    value={local}
                                    onChange={(e) =>
                                        setLocal(e.target.value as 'EMBARQUE' | 'DESEMBARQUE' | 'BRIEFING' | 'TRANSPORTE' | 'SUPERVISOR' | 'CENTRAL_ANALISE' | '')
                                    }
                                    required
                                    disabled={isLoading}
                                    className="w-full h-12 pl-12 pr-4 rounded-lg text-sm transition-all duration-200 outline-none appearance-none cursor-pointer"
                                    style={{
                                        backgroundColor: '#FAFAFA',
                                        border: '1.5px solid #E2E4E9',
                                        color: local ? '#1A1A2E' : '#9CA3AF',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1A1A2E';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(26,26,46,0.06)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#E2E4E9';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                >
                                    <option value="" disabled>
                                        Selecione o local
                                    </option>
                                    <option value="EMBARQUE" style={{ color: '#1A1A2E' }}>
                                        Embarque
                                    </option>
                                    <option value="DESEMBARQUE" style={{ color: '#1A1A2E' }}>
                                        Desembarque
                                    </option>
                                    <option value="BRIEFING" style={{ color: '#1A1A2E' }}>
                                        Sala de Briefing
                                    </option>
                                    <option value="TRANSPORTE" style={{ color: '#1A1A2E' }}>
                                        Transporte
                                    </option>
                                    <option value="SUPERVISOR" style={{ color: '#1A1A2E' }}>
                                        Área do Supervisor
                                    </option>
                                    <option value="CENTRAL_ANALISE" style={{ color: '#1A1A2E' }}>
                                        Central de Análise
                                    </option>
                                </select>
                                {/* Custom dropdown arrow */}
                                <svg
                                    className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                                    style={{ color: '#9CA3AF' }}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div
                            className={`pt-2 transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                                }`}
                            style={{ transitionDelay: '450ms' }}
                        >
                            <button
                                type="submit"
                                disabled={isLoading || !isFormValid}
                                className="w-full h-12 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: isFormValid ? '#1A1A2E' : '#1A1A2E',
                                }}
                                onMouseEnter={(e) => {
                                    if (isFormValid && !isLoading) {
                                        (e.target as HTMLElement).style.backgroundColor = '#16213E';
                                        (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                                        (e.target as HTMLElement).style.boxShadow =
                                            '0 4px 12px rgba(26,26,46,0.25)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    (e.target as HTMLElement).style.backgroundColor = '#1A1A2E';
                                    (e.target as HTMLElement).style.transform = 'translateY(0)';
                                    (e.target as HTMLElement).style.boxShadow = 'none';
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    <>
                                        Entrar
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer */}
                    <p
                        className={`text-center text-xs mt-8 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'
                            }`}
                        style={{ color: '#C4C7CC', transitionDelay: '600ms' }}
                    >
                        Acesso restrito a usuários autorizados
                    </p>
                </div>

                {/* Bottom Tagline */}
                <div
                    className={`absolute bottom-8 left-0 right-0 text-center transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transitionDelay: '700ms' }}
                >
                    <p
                        style={{
                            color: '#4A4A5A',
                            fontFamily: "'Lato', sans-serif",
                            fontSize: '13px',
                            letterSpacing: '0.25em',
                            fontWeight: 700,
                        }}
                    >
                        C O N T R O L E&ensp;|&ensp;A U T O M A Ç Ã O&ensp;|&ensp;I N T E L I G Ê N C I A
                    </p>
                    <p
                        style={{
                            color: '#9CA3AF',
                            fontFamily: "Arial, sans-serif",
                            fontSize: '11px',
                            fontWeight: 700,
                            fontStyle: 'italic',
                            marginTop: '6px',
                        }}
                    >
                        Um produto WeAreG<sup style={{ fontSize: '7px', position: 'relative', top: '-2px' }}>&reg;</sup>
                    </p>
                </div>
            </div>
        </div>
    );
}
