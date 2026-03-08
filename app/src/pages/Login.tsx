import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

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
            setError('Your session has expired. Please log in again.');
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';

    useEffect(() => {
        /* global google */
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
                    width: "320", // Standard button width
                    text: "signin_with",
                    shape: "pill", // Slightly more modern
                    logo_alignment: "center"
                }
            );
        }
    }, [CLIENT_ID]);

    const decodeAndLogin = (token: string, emailUsed: string) => {
        // Minimal JWT payload decoder
        const payloadBase64 = token.split('.')[1];
        const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(payloadJson);

        // Extract claims with fallbacks
        const userData = {
            email: payload.sub || emailUsed,
            role: payload.role || payload.roles || (payload.ROLES ? payload.ROLES[0] : 'TECH'),
            name: payload.name || payload.nombre || payload.sub?.split('@')[0] || 'User',
            theme: payload.theme || 'light',
            oauthEnabled: payload.oauthEnabled !== undefined ? payload.oauthEnabled : true
        };

        login(token, userData);
        navigate('/');
    };

    const handleGoogleCallback = async (response: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await apiClient.post('/auth/google', { idToken: response.credential });
            decodeAndLogin(res.data.token, 'Google User');
        } catch (err: any) {
            console.error('Google login failed', err);
            setError(err.response?.data?.message || 'Google account not registered in system.');
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
            decodeAndLogin(response.data.token, email);
        } catch (err: any) {
            console.error('Login failed', err);
            setError(err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-indigo-600/20"></div>
                <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full blur-[100px] bg-blue-500/20"></div>
            </div>

            <div className="max-w-md w-full space-y-8 bg-slate-800/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-slate-700/50 z-10 animate-fade-in relative">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/30">
                        AF
                    </div>
                </div>
                <div>
                    <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-400">
                        Access your CRM dashboard and technical schedule
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/50 rounded-xl p-3 flex items-center justify-center text-center">
                            <p className="text-sm text-rose-400 font-medium">{error}</p>
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-slate-300 mb-1">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-slate-600 bg-slate-900/50 placeholder-slate-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all shadow-inner"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300">Password</label>
                                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-slate-600 bg-slate-900/50 placeholder-slate-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all shadow-inner"
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
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 
                                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all shadow-lg shadow-indigo-600/30 
                                     disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider overflow-hidden"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Authenticating...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-slate-800 text-slate-400 font-medium">Or continue with</span>
                        </div>
                    </div>

                    <div id="googleSignInDiv" className="w-full flex justify-center"></div>
                </form>
            </div>
        </div>
    );
}
