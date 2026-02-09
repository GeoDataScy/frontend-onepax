import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plane, Lock, User, MapPin } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [local, setLocal] = useState<'EMBARQUE' | 'DESEMBARQUE' | ''>('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password || !local) {
            return;
        }

        try {
            setIsLoading(true);
            // IMPORTANTE: Salvar local ANTES do login para que o AuthContext possa ler
            localStorage.setItem('user_local', local);
            await login(username, password);
        } catch (error) {
            console.error('Erro no login:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="space-y-3 text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                        <Plane className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold">PaxOne</CardTitle>
                    <CardDescription className="text-base">
                        Sistema de Controle de Embarque e Desembarque
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-medium">
                                Usuário
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Digite seu usuário"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-10"
                                    required
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Senha
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Digite sua senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="local" className="text-sm font-medium">
                                Local
                            </Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                                <Select value={local} onValueChange={(value: 'EMBARQUE' | 'DESEMBARQUE') => setLocal(value)} required disabled={isLoading}>
                                    <SelectTrigger id="local" className="pl-10">
                                        <SelectValue placeholder="Selecione o local" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EMBARQUE">Embarque</SelectItem>
                                        <SelectItem value="DESEMBARQUE">Desembarque</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={isLoading || !username || !password || !local}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Entrando...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            Acesso restrito a usuÃ¡rios autorizados
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
