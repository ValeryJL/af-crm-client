import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, User, Mail, Phone, Lock, Loader2, AlertCircle } from 'lucide-react';
import apiClient from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import afLogo from '../assets/logo-af.png';

export function RegisterInvited() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { login } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        telefono: '',
        token: token || ''
    });

    useEffect(() => {
        if (!token) {
            setError('Falta el token de invitación. Utiliza un enlace válido provisto por el administrador.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await apiClient.post('/auth/register-invited', formData);
            const { token: jwtToken } = response.data;

            const payloadBase64 = jwtToken.split('.')[1];
            const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
            const payload = JSON.parse(payloadJson);

            const userData = {
                email: payload.sub || formData.email,
                role: payload.role,
                name: payload.name || payload.nombre || formData.nombre
            };

            login(jwtToken, userData);
            navigate('/');
        } catch (err: any) {
            console.error('Registration failed:', err);
            setError(err.response?.data?.message || 'Error en el registro. El enlace puede haber expirado o ya fue utilizado.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token && !error) return null;

    return (
        <div className="min-h-screen bg-[#141517] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#1e2022] border border-[#333639] rounded-none shadow-2xl p-6 sm:p-8 animate-fade-in">
                <div className="text-center pb-4 border-b border-[#333639]">
                    <img 
                        src={afLogo} 
                        alt="AF Construcciones" 
                        className="h-9 w-auto mx-auto object-contain filter brightness-110 mb-2" 
                    />
                    <h1 className="text-lg font-heading font-black text-white uppercase tracking-tight">Registro de Usuario</h1>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">Completa tu perfil para acceder al sistema</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                    {error && (
                        <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">Nombre</label>
                            <input
                                type="text"
                                required
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full text-xs p-2.5 rounded-none border border-[#333639] bg-[#141517] text-white outline-none focus:border-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">Apellido</label>
                            <input
                                type="text"
                                required
                                value={formData.apellido}
                                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                className="w-full text-xs p-2.5 rounded-none border border-[#333639] bg-[#141517] text-white outline-none focus:border-amber-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full text-xs p-2.5 rounded-none border border-[#333639] bg-[#141517] text-white outline-none focus:border-amber-500 font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">Teléfono</label>
                        <input
                            type="text"
                            value={formData.telefono}
                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            className="w-full text-xs p-2.5 rounded-none border border-[#333639] bg-[#141517] text-white outline-none focus:border-amber-500 font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full text-xs p-2.5 rounded-none border border-[#333639] bg-[#141517] text-white outline-none focus:border-amber-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 mt-2 bg-amber-600 hover:bg-amber-500 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-none transition-colors"
                    >
                        {isLoading ? 'Registrando...' : 'Finalizar Registro'}
                    </button>
                </form>
            </div>
        </div>
    );
}
