import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ServiceUnavailable() {
    const handleReload = () => {
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-[#141517] flex items-center justify-center p-4 relative font-sans">
            <div className="max-w-md w-full bg-[#1e2022] border border-[#333639] p-8 text-center space-y-5 rounded-none shadow-2xl relative z-10 animate-fade-in">
                <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500">
                    <AlertTriangle size={32} />
                </div>

                <div>
                    <h1 className="text-xl font-heading font-black text-white uppercase tracking-tight">
                        Sistema Temporalmente No Disponible
                    </h1>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                        No fue posible comunicarse con el servicio central de AF-CRM. El equipo técnico puede estar ejecutando tareas de mantenimiento.
                    </p>
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleReload}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-heading font-bold py-2.5 px-4 rounded-none transition-colors uppercase tracking-wider text-xs flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={15} />
                        <span>Reintentar Conexión</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
