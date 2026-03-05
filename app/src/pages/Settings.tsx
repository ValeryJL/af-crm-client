import { useState, useEffect } from 'react';
import { Shield, Check, X, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

export function Settings() {
    const { user, updateUser } = useAuth();
    const [oauthEnabled, setOauthEnabled] = useState(user?.oauthEnabled ?? true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Sync state with user context if it changes
    useEffect(() => {
        if (user?.oauthEnabled !== undefined) {
            setOauthEnabled(user.oauthEnabled);
        }
    }, [user?.oauthEnabled]);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await apiClient.get('/users/me/config');
                setOauthEnabled(response.data.oauthEnabled);
                updateUser({ oauthEnabled: response.data.oauthEnabled });
            } catch (error) {
                console.error('Failed to fetch user configuration:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleToggleOAuth = async () => {
        const newValue = !oauthEnabled;
        setIsSaving(true);
        setMessage(null);

        try {
            await apiClient.put('/users/me/config', { oauthEnabled: newValue });
            setOauthEnabled(newValue);
            updateUser({ oauthEnabled: newValue });
            setMessage({ type: 'success', text: `Google Authentication ${newValue ? 'enabled' : 'disabled'} successfully.` });
        } catch (error: any) {
            console.error('Failed to update OAuth settings:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update settings. Please ensure the backend is ready.'
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Account Settings</h2>
                <p className="text-slate-500 dark:text-slate-400">Manage your security preferences and integrations.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security & Access</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Control how you access your account.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8 space-y-8">
                    {message && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-fade-in ${message.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20'
                            : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20'
                            }`}>
                            {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                            <p className="text-sm font-semibold">{message.text}</p>
                            <button onClick={() => setMessage(null)} className="ml-auto p-1 hover:bg-black/5 rounded-lg transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/50 group transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-slate-900 dark:text-white">Google Authentication</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Allow logging in with your Google Workspace account.</p>
                            </div>
                        </div>

                        <button
                            onClick={handleToggleOAuth}
                            disabled={isSaving}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${oauthEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                                } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${oauthEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-800 dark:text-amber-400">
                        <div className="flex gap-3">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-bold mb-1">Important Note</p>
                                <p>To use Google Sign-In, your account email must match your Google account exactly. Unauthorized domains will be restricted by the system administrator.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
