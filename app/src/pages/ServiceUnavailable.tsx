import { ServerCrash, RefreshCw } from 'lucide-react';

export function ServiceUnavailable() {
    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-rose-600/10"></div>
                <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full blur-[100px] bg-indigo-500/10"></div>
            </div>

            <div className="max-w-md w-full text-center relative z-10 animate-fade-in">
                <div className="mb-8 relative inline-block">
                    <div className="w-24 h-24 bg-rose-500/20 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/30 shadow-2xl shadow-rose-500/20 relative z-10">
                        <ServerCrash size={48} className="text-rose-500" />
                    </div>
                    <div className="absolute inset-0 bg-rose-500 blur-2xl opacity-20 animate-pulse"></div>
                </div>

                <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
                    Service <span className="text-rose-500">Unavailable</span>
                </h1>

                <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
                    The backend system is currently unreachable or undergoing maintenance. We're unable to establish a connection (Error 502).
                </p>

                <div className="space-y-4">
                    <button
                        onClick={handleRetry}
                        className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-4 rounded-2xl transition-all shadow-xl hover:shadow-white/10 active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-wider"
                    >
                        <RefreshCw size={20} className="text-slate-900" />
                        <span>Retry Connection</span>
                    </button>

                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mt-6">
                        System Status: <span className="text-rose-500 animate-pulse">Offline</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
