import { useState } from 'react';
import { Shield, Check, X, AlertCircle, Moon, Sun } from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

export function Settings() {
    const { user, updateUser, theme, toggleTheme } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleToggleOAuth = async () => {
        const newValue = !user?.oauthEnabled;
        setIsSaving(true);
        setMessage(null);

        try {
            await apiClient.put('/users/me/config', { oauthEnabled: newValue });
            updateUser({ oauthEnabled: newValue });
            setMessage({ type: 'success', text: `Autenticación Google ${newValue ? 'habilitada' : 'deshabilitada'} correctamente.` });
        } catch (error: any) {
            console.error('Failed to update OAuth settings:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Error al actualizar configuración.'
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header Industrial */}
            <div className="flex flex-col gap-1 pb-4 border-b border-slate-300 dark:border-[#333639]">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-6 bg-amber-500 inline-block"></span>
                    <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                        Ajustes del Sistema
                    </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 pl-4.5">
                    Preferencias de seguridad, integraciones externas y apariencia de la plataforma.
                </p>
            </div>

            <div className="bg-white dark:bg-[#1e2022] rounded-none border border-slate-300 dark:border-[#333639] shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-[#333639] bg-slate-50 dark:bg-[#141517] flex items-center gap-3">
                    <div className="w-9 h-9 rounded-none bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center">
                        <Shield size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-heading font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                            Seguridad & Acceso
                        </h3>
                        <p className="text-xs text-slate-400">Control de inicio de sesión y credenciales federadas.</p>
                    </div>
                </div>

                <div className="p-5 sm:p-6 space-y-5">
                    {message && (
                        <div className={`p-3 rounded-none flex items-center gap-3 animate-fade-in text-xs font-semibold border ${
                            message.type === 'success'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                            {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                            <p className="flex-1">{message.text}</p>
                            <button onClick={() => setMessage(null)} className="p-1 hover:text-white transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {/* OAuth Section */}
                    <div className="flex items-center justify-between p-4 rounded-none bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#333639] transition-all">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-none bg-white dark:bg-[#1e2022] flex items-center justify-center border border-slate-300 dark:border-[#333639] shadow-xs shrink-0">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                                    Autenticación Google Workspace
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Permitir inicio de sesión con cuentas de Google autorizadas.</p>
                            </div>
                        </div>

                        {/* Switch Rectangular Industrial */}
                        <button
                            onClick={handleToggleOAuth}
                            disabled={isSaving}
                            className={`relative inline-flex h-6 w-11 items-center rounded-none border border-slate-400 dark:border-[#333639] transition-colors focus:outline-none ${
                                user?.oauthEnabled ? 'bg-amber-600' : 'bg-slate-300 dark:bg-[#282a2d]'
                            } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-none bg-white shadow-xs transition-transform ${
                                    user?.oauthEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                    {/* Theme Section */}
                    <div className="flex items-center justify-between p-4 rounded-none bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#333639] transition-all">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-none bg-white dark:bg-[#1e2022] flex items-center justify-center border border-slate-300 dark:border-[#333639] shadow-xs shrink-0 text-amber-500">
                                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <div>
                                <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                                    Apariencia Visual
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {theme === 'dark' ? 'Tema Oscuro Carbón (Cero Azul)' : 'Tema Claro Industrial con Acento AF'}
                                </p>
                            </div>
                        </div>

                        {/* Switch Rectangular Industrial */}
                        <button
                            onClick={toggleTheme}
                            disabled={isSaving}
                            className={`relative inline-flex h-6 w-11 items-center rounded-none border border-slate-400 dark:border-[#333639] transition-colors focus:outline-none ${
                                theme === 'dark' ? 'bg-amber-600' : 'bg-slate-300 dark:bg-[#282a2d]'
                            } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-none bg-white shadow-xs transition-transform ${
                                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                    <div className="p-3.5 rounded-none bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        <div className="flex gap-2.5">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <div className="text-xs">
                                <p className="font-heading font-bold uppercase tracking-wider mb-0.5">Nota de Persistencia</p>
                                <p className="text-slate-300 text-[11px]">
                                    Las preferencias de tema y seguridad se sincronizan en tu perfil y se aplicarán en todos tus dispositivos.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
