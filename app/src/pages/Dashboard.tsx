import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { SlaAlertDto, WorkOrderDto } from '../api/crm';
import { 
    AlertTriangle, Clock, CheckCircle2, AlertCircle, CalendarPlus, 
    ArrowUpRight, Building2, Wrench, ShieldAlert, Sparkles, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
    const [alerts, setAlerts] = useState<SlaAlertDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'RED' | 'YELLOW' | 'ORANGE'>('ALL');
    const [quickModalService, setQuickModalService] = useState<SlaAlertDto | null>(null);
    const [orderDesc, setOrderDesc] = useState('');
    const [scheduling, setScheduling] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const res = await crmApi.getAlerts();
            setAlerts(res.data);
        } catch (e) {
            console.error('Error fetching alerts:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickModalService || !quickModalService.serviceId) return;

        try {
            setScheduling(true);
            const newOrder: WorkOrderDto = {
                serviceId: quickModalService.serviceId,
                tipo: 'PREVENTIVO',
                estado: 'PENDIENTE',
                descripcion: orderDesc || `Visita generada automáticamente por alerta SLA: ${quickModalService.titulo}`,
                fechaProgramada: new Date().toISOString()
            };
            await crmApi.createWorkOrder(newOrder);
            setQuickModalService(null);
            setOrderDesc('');
            fetchAlerts();
            navigate('/work-orders');
        } catch (e) {
            console.error('Error creating quick work order:', e);
        } finally {
            setScheduling(false);
        }
    };

    const criticalCount = alerts.filter(a => a.severidad === 'RED').length;
    const upcomingCount = alerts.filter(a => a.severidad === 'YELLOW').length;
    const partsCount = alerts.filter(a => a.severidad === 'ORANGE').length;

    const filteredAlerts = alerts.filter(a => filter === 'ALL' || a.severidad === filter);

    return (
        <div className="space-y-8">
            {/* Header / KPI Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                        Centro de Control & SLA Operativo
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Monitoreo preventivo continuo, contratos vigentes y ciclo de vida de componentes.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/work-orders')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                    >
                        <CalendarPlus className="w-4 h-4" />
                        <span>Ver Órdenes de Trabajo</span>
                    </button>
                </div>
            </div>

            {/* SLA Severity KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div 
                    onClick={() => setFilter(filter === 'RED' ? 'ALL' : 'RED')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        filter === 'RED' 
                            ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/30' 
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 hover:border-rose-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                            SLA Crítico / Vencidas
                        </span>
                        <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{criticalCount}</span>
                        <span className="text-xs text-rose-600 font-semibold">visitas fuera de término</span>
                    </div>
                </div>

                <div 
                    onClick={() => setFilter(filter === 'YELLOW' ? 'ALL' : 'YELLOW')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        filter === 'YELLOW' 
                            ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30' 
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 hover:border-amber-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            Próximos a Vencer (7 días)
                        </span>
                        <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{upcomingCount}</span>
                        <span className="text-xs text-amber-600 font-semibold">visitas por expirar</span>
                    </div>
                </div>

                <div 
                    onClick={() => setFilter(filter === 'ORANGE' ? 'ALL' : 'ORANGE')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        filter === 'ORANGE' 
                            ? 'bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/30' 
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 hover:border-orange-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                            Consumibles Críticos
                        </span>
                        <div className="p-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl">
                            <Wrench className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{partsCount}</span>
                        <span className="text-xs text-orange-600 font-semibold">partes excedidas de horas/meses</span>
                    </div>
                </div>
            </div>

            {/* Alerts Feed */}
            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                            <Filter className="w-4 h-4" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            Feed Activo de Alertas ({filteredAlerts.length})
                        </h2>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl text-xs font-semibold">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'ALL' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilter('RED')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'RED' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500'}`}
                        >
                            Rojas
                        </button>
                        <button
                            onClick={() => setFilter('YELLOW')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'YELLOW' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500'}`}
                        >
                            Amarillas
                        </button>
                        <button
                            onClick={() => setFilter('ORANGE')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'ORANGE' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500'}`}
                        >
                            Naranjas
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-16 text-center text-slate-400 text-sm">Calculando estado de SLAs...</div>
                ) : filteredAlerts.length === 0 ? (
                    <div className="py-16 text-center">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">¡Todo al día!</h3>
                        <p className="text-xs text-slate-400 mt-1">No hay alertas de SLA ni consumibles pendientes de reemplazo.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50 mt-2">
                        {filteredAlerts.map((alert, index) => {
                            const isRed = alert.severidad === 'RED';
                            const isYellow = alert.severidad === 'YELLOW';
                            return (
                                <div key={index} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 px-2 rounded-2xl transition-colors">
                                    <div className="flex items-start gap-3.5">
                                        <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                                            isRed 
                                                ? 'bg-rose-500/10 text-rose-600' 
                                                : isYellow 
                                                    ? 'bg-amber-500/10 text-amber-600' 
                                                    : 'bg-orange-500/10 text-orange-600'
                                        }`}>
                                            {isRed ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                                    isRed 
                                                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' 
                                                        : isYellow 
                                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' 
                                                            : 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300'
                                                }`}>
                                                    {alert.tipo.replace('_', ' ')}
                                                </span>
                                                <span className="text-xs font-semibold text-slate-400">
                                                    {alert.clientRazonSocial}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-1">
                                                {alert.titulo}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                {alert.descripcion}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                        {alert.serviceId && (
                                            <button
                                                onClick={() => setQuickModalService(alert)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl transition-all active:scale-95"
                                            >
                                                <CalendarPlus className="w-3.5 h-3.5" />
                                                <span>+ Agendar Visita</span>
                                            </button>
                                        )}
                                        {alert.clientId && (
                                            <button
                                                onClick={() => navigate(`/clients/${alert.clientId}`)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
                                            >
                                                <ArrowUpRight className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Quick 1-Click Work Order Modal */}
            {quickModalService && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            Agendar Visita Preventiva Rápida
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Generará una Orden de Trabajo inmediata para {quickModalService.clientRazonSocial} ({quickModalService.serviceNombre}).
                        </p>

                        <form onSubmit={handleQuickSchedule} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                    Instrucciones para el técnico:
                                </label>
                                <textarea
                                    rows={3}
                                    value={orderDesc}
                                    onChange={(e) => setOrderDesc(e.target.value)}
                                    placeholder="Revisión general mensual y chequeo de niveles según SLA..."
                                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setQuickModalService(null)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={scheduling}
                                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 active:scale-95"
                                >
                                    {scheduling ? 'Agendando...' : 'Confirmar y Crear OT'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
