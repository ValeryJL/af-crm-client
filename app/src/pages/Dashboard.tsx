import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { SlaAlertDto, WorkOrderDto } from '../api/crm';
import { 
    Clock, CheckCircle2, AlertCircle, CalendarPlus, 
    ArrowUpRight, ShieldAlert, Filter, Wrench, ChevronRight
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
                descripcion: orderDesc || `Visita preventiva generada automáticamente por alerta SLA: ${quickModalService.titulo}`,
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
        <div className="space-y-6">
            {/* Header / Brand Banner */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                            Centro de Control & SLA Operativo
                        </h1>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        AF Construcciones y Servicios — Monitoreo preventivo continuo y ciclos de vida electromecánicos.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/work-orders')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs shadow-xs transition-all"
                    >
                        <CalendarPlus className="w-3.5 h-3.5 text-sky-400" />
                        <span>Ver Órdenes de Trabajo</span>
                    </button>
                </div>
            </div>

            {/* SLA Severity Cards (High Contrast & Clear Typography) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Red: Overdue */}
                <div 
                    onClick={() => setFilter(filter === 'RED' ? 'ALL' : 'RED')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        filter === 'RED' 
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/20' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-400'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                            SLA Crítico / Vencidas
                        </span>
                        <div className="p-1.5 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 rounded-lg">
                            <ShieldAlert className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-heading font-black text-slate-900 dark:text-slate-100">{criticalCount}</span>
                        <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">visitas fuera de término</span>
                    </div>
                </div>

                {/* Sky / Cyan: Próximos a vencer */}
                <div 
                    onClick={() => setFilter(filter === 'YELLOW' ? 'ALL' : 'YELLOW')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        filter === 'YELLOW' 
                            ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 ring-2 ring-sky-500/20' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-400'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                            Próximos a Vencer (7 días)
                        </span>
                        <div className="p-1.5 bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-400 rounded-lg">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-heading font-black text-slate-900 dark:text-slate-100">{upcomingCount}</span>
                        <span className="text-xs font-semibold text-sky-700 dark:text-sky-400">visitas programadas</span>
                    </div>
                </div>

                {/* Orange / Rust: Consumibles */}
                <div 
                    onClick={() => setFilter(filter === 'ORANGE' ? 'ALL' : 'ORANGE')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        filter === 'ORANGE' 
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-600 ring-2 ring-amber-600/20' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                            Consumibles Críticos
                        </span>
                        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-400 rounded-lg">
                            <Wrench className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-heading font-black text-slate-900 dark:text-slate-100">{partsCount}</span>
                        <span className="text-xs font-semibold text-amber-800 dark:text-amber-400">partes por sustituir</span>
                    </div>
                </div>
            </div>

            {/* Alerts Feed */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <Filter className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        <h2 className="text-sm font-heading font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                            Alertas y Eventos Preventivos ({filteredAlerts.length})
                        </h2>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`px-3 py-1 rounded-md transition-all ${filter === 'ALL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500'}`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilter('RED')}
                            className={`px-3 py-1 rounded-md transition-all ${filter === 'RED' ? 'bg-rose-600 text-white shadow-2xs font-bold' : 'text-slate-500'}`}
                        >
                            Críticas
                        </button>
                        <button
                            onClick={() => setFilter('YELLOW')}
                            className={`px-3 py-1 rounded-md transition-all ${filter === 'YELLOW' ? 'bg-sky-600 text-white shadow-2xs font-bold' : 'text-slate-500'}`}
                        >
                            Próximas
                        </button>
                        <button
                            onClick={() => setFilter('ORANGE')}
                            className={`px-3 py-1 rounded-md transition-all ${filter === 'ORANGE' ? 'bg-amber-600 text-white shadow-2xs font-bold' : 'text-slate-500'}`}
                        >
                            Partes
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-slate-400 text-xs">Calculando estado de SLAs...</div>
                ) : filteredAlerts.length === 0 ? (
                    <div className="py-12 text-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">¡SLA Operativo al 100%!</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Todas las sedes y equipos se encuentran con servicios al día.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-1">
                        {filteredAlerts.map((alert, index) => {
                            const isRed = alert.severidad === 'RED';
                            const isYellow = alert.severidad === 'YELLOW';
                            return (
                                <div key={index} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-lg transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                                            isRed 
                                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' 
                                                : isYellow 
                                                    ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400' 
                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                                        }`}>
                                            {isRed ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                                    isRed 
                                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300' 
                                                        : isYellow 
                                                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300' 
                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                                }`}>
                                                    {alert.tipo.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    {alert.clientRazonSocial}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mt-0.5">
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
                                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-all"
                                            >
                                                <CalendarPlus className="w-3.5 h-3.5 text-sky-400" />
                                                <span>+ Agendar Visita</span>
                                            </button>
                                        )}
                                        {alert.clientId && (
                                            <button
                                                onClick={() => navigate(`/clients/${alert.clientId}`)}
                                                className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                                title="Ver Cliente 360°"
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
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 shadow-xl">
                        <h3 className="text-base font-heading font-bold text-slate-900 dark:text-slate-100">
                            Agendar Visita Preventiva Rápida
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Se emitirá una Orden de Trabajo para {quickModalService.clientRazonSocial} ({quickModalService.serviceNombre}).
                        </p>

                        <form onSubmit={handleQuickSchedule} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Instrucciones para el técnico de campo:
                                </label>
                                <textarea
                                    rows={3}
                                    value={orderDesc}
                                    onChange={(e) => setOrderDesc(e.target.value)}
                                    placeholder="Revisión mensual, verificación de banco de baterías y control de carga..."
                                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setQuickModalService(null)}
                                    className="px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={scheduling}
                                    className="px-4 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                                >
                                    {scheduling ? 'Generando...' : 'Confirmar y Crear OT'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
