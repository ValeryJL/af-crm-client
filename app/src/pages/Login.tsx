import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import afLogo from '../assets/logo-af.png';

declare global {
    interface Window {
        google: any;
    }
}

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('expired') === 'true') {
            setError('Tu sesión ha expirado. Por favor ingresa nuevamente.');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';

    useEffect(() => {
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: handleGoogleCallback,
            });
            window.google.accounts.id.renderButton(
                document.getElementById("googleSignInDiv"),
                {
                    theme: "outline",
                    size: "large",
                    width: "320",
                    text: "signin_with",
                    shape: "rectangular",
                    logo_alignment: "center"
                }
            );
        }
    }, [CLIENT_ID]);

    const processLogin = (token: string, emailUsed: string, metadata?: any) => {
        const payloadBase64 = token.split('.')[1];
        const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(payloadJson);

        const userData = {
            email: metadata?.email || payload.sub || emailUsed,
            role: metadata?.role || payload.role || payload.roles || (payload.ROLES ? payload.ROLES[0] : 'TECH'),
            name: metadata?.name || metadata?.nombre || payload.name || payload.nombre || payload.sub?.split('@')[0] || 'User',
            theme: metadata?.theme || payload.theme || 'light',
            oauthEnabled: metadata?.oauthEnabled !== undefined ? metadata?.oauthEnabled : (payload.oauthEnabled !== undefined ? payload.oauthEnabled : true)
        };

        login(token, userData);
        navigate('/');
    };

    const handleGoogleCallback = async (response: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await apiClient.post('/auth/google', { idToken: response.credential });
            processLogin(res.data.token, 'Google User', res.data);
        } catch (err: any) {
            console.error('Google login failed', err);
            setError(err.response?.data?.message || 'Cuenta de Google no autorizada en el sistema.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiClient.post('/auth/login', { email, password });
            processLogin(response.data.token, email, response.data);
        } catch (err: any) {
            console.error('Login failed', err);
            setError(err.response?.data?.message || 'Credenciales incorrectas.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#141517] py-12 px-4 sm:px-6 lg:px-8 relative font-sans">
            <div className="max-w-md w-full space-y-6 bg-[#1e2022] p-8 rounded-none border border-[#333639] z-10 shadow-2xl animate-fade-in relative">
                <div className="flex flex-col items-center">
                    <img 
                        src={afLogo} 
                        alt="AF Construcciones" 
                        className="h-10 w-auto object-contain filter brightness-110 mb-3" 
                    />
                    <div className="flex items-center gap-2">
                        <span className="font-heading font-black text-xl tracking-tight text-white leading-none">
                            AF<span className="text-amber-500 font-extrabold ml-1">CRM</span>
                        </span>
                        <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold uppercase border border-amber-500/30">
                            Electromecánica
                        </span>
                    </div>
                    <p className="mt-2 text-center text-xs text-slate-400 font-mono">
                        Control de Órdenes de Trabajo, SLAs y Mantenimiento
                    </p>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/30 p-2.5 text-center">
                            <p className="text-xs text-rose-400 font-medium">{error}</p>
                        </div>
                    )}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">Email de Usuario</label>
                            <input
                                type="email"
                                required
                                className="w-full px-3 py-2.5 border border-[#333639] bg-[#141517] text-white rounded-none outline-none focus:border-amber-500 text-xs font-mono"
                                placeholder="usuario@af.com.ar"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">Contraseña</label>
                            <input
                                type="password"
                                required
                                className="w-full px-3 py-2.5 border border-[#333639] bg-[#141517] text-white rounded-none outline-none focus:border-amber-500 text-xs"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 px-4 text-xs font-heading font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-none uppercase tracking-wider transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Autenticando...' : 'Iniciar Sesión'}
                        </button>
                    </div>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#333639]" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-[#1e2022] text-slate-400 font-mono text-[10px]">O continuar con</span>
                        </div>
                    </div>

                    <div id="googleSignInDiv" className="w-full flex justify-center"></div>
                </form>
            </div>
        </div>
    );
}
