import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { SlaAlertDto, WorkOrderDto } from '../api/crm';
import { 
    Clock, CheckCircle2, AlertCircle, CalendarPlus, 
    ArrowUpRight, ShieldAlert, Filter, Wrench
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
        <div className="space-y-4">
            {/* Header / Brand Banner */}
            <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-none bg-emerald-500 animate-pulse"></span>
                        <h1 className="text-lg sm:text-xl font-heading font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                            Centro de Control & SLA Operativo
                        </h1>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Supervisión de cumplimiento de visitas preventivas y desgaste de componentes electromecánicos.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/work-orders')}
                        className="flex items-center gap-2 px-3.5 py-1.5 bg-[#2d3033] hover:bg-[#3a3b3b] dark:bg-[#2b2d30] dark:hover:bg-[#383a3d] text-white rounded-none font-bold text-xs shadow-2xs transition-all border border-[#3f4246]"
                    >
                        <CalendarPlus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ver Órdenes de Trabajo</span>
                    </button>
                </div>
            </div>

            {/* SLA Severity KPI Cards - Ángulos Rectos y Alto Contraste */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Red: Overdue */}
                <div 
                    onClick={() => setFilter(filter === 'RED' ? 'ALL' : 'RED')}
                    className={`p-3.5 rounded-none border cursor-pointer transition-all ${
                        filter === 'RED' 
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-600 ring-1 ring-rose-600' 
                            : 'bg-white dark:bg-[#1e2022] border-slate-300 dark:border-[#333639] hover:border-rose-500'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
                            SLA Crítico / Vencidas
                        </span>
                        <div className="p-1 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 rounded-none">
                            <ShieldAlert className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-heading font-black text-slate-900 dark:text-slate-100">{criticalCount}</span>
                        <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">visitas fuera de término</span>
                    </div>
                </div>

                {/* Upcoming */}
                <div 
                    onClick={() => setFilter(filter === 'YELLOW' ? 'ALL' : 'YELLOW')}
                    className={`p-3.5 rounded-none border cursor-pointer transition-all ${
                        filter === 'YELLOW' 
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-600 ring-1 ring-amber-600' 
                            : 'bg-white dark:bg-[#1e2022] border-slate-300 dark:border-[#333639] hover:border-amber-500'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">
                            Próximos a Vencer (7 días)
                        </span>
                        <div className="p-1 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-400 rounded-none">
                            <Clock className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-heading font-black text-slate-900 dark:text-slate-100">{upcomingCount}</span>
                        <span className="text-xs font-semibold text-amber-800 dark:text-amber-400">visitas por expirar</span>
                    </div>
                </div>

                {/* Orange / Consumables */}
                <div 
                    onClick={() => setFilter(filter === 'ORANGE' ? 'ALL' : 'ORANGE')}
                    className={`p-3.5 rounded-none border cursor-pointer transition-all ${
                        filter === 'ORANGE' 
                            ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-600 ring-1 ring-orange-600' 
                            : 'bg-white dark:bg-[#1e2022] border-slate-300 dark:border-[#333639] hover:border-orange-500'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-orange-800 dark:text-orange-400">
                            Consumibles Críticos
                        </span>
                        <div className="p-1 bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-400 rounded-none">
                            <Wrench className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-heading font-black text-slate-900 dark:text-slate-100">{partsCount}</span>
                        <span className="text-xs font-semibold text-orange-800 dark:text-orange-400">partes por sustituir</span>
                    </div>
                </div>
            </div>

            {/* Feed Activo de Alertas */}
            <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none p-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#333639]">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <h2 className="text-xs font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                            Feed de Alertas Operativas ({filteredAlerts.length})
                        </h2>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#141517] p-0.5 rounded-none text-xs">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`px-2.5 py-1 rounded-none text-[11px] font-bold transition-all ${filter === 'ALL' ? 'bg-[#2d3033] text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'}`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilter('RED')}
                            className={`px-2.5 py-1 rounded-none text-[11px] font-bold transition-all ${filter === 'RED' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'}`}
                        >
                            Rojas
                        </button>
                        <button
                            onClick={() => setFilter('YELLOW')}
                            className={`px-2.5 py-1 rounded-none text-[11px] font-bold transition-all ${filter === 'YELLOW' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'}`}
                        >
                            Amarillas
                        </button>
                        <button
                            onClick={() => setFilter('ORANGE')}
                            className={`px-2.5 py-1 rounded-none text-[11px] font-bold transition-all ${filter === 'ORANGE' ? 'bg-orange-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'}`}
                        >
                            Naranjas
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-slate-400 text-xs">Calculando SLAs...</div>
                ) : filteredAlerts.length === 0 ? (
                    <div className="py-10 text-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">Sin Alertas Activas</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Todas las sedes y repuestos se encuentran al día.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200 dark:divide-[#2a2c2e]">
                        {filteredAlerts.map((alert, index) => {
                            const isRed = alert.severidad === 'RED';
                            const isYellow = alert.severidad === 'YELLOW';
                            return (
                                <div key={index} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-white/5 px-2 transition-colors">
                                    <div className="flex items-start gap-2.5">
                                        <div className={`p-1.5 rounded-none shrink-0 mt-0.5 ${
                                            isRed 
                                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' 
                                                : isYellow 
                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400' 
                                                    : 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-400'
                                        }`}>
                                            {isRed ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-none ${
                                                    isRed 
                                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300' 
                                                        : isYellow 
                                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' 
                                                            : 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300'
                                                }`}>
                                                    {alert.tipo.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                    {alert.clientRazonSocial}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mt-0.5">
                                                {alert.titulo}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                {alert.descripcion}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                        {alert.serviceId && (
                                            <button
                                                onClick={() => setQuickModalService(alert)}
                                                className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold rounded-none shadow-2xs transition-all"
                                            >
                                                <CalendarPlus className="w-3 h-3" />
                                                <span>+ Agendar Visita</span>
                                            </button>
                                        )}
                                        {alert.clientId && (
                                            <button
                                                onClick={() => navigate(`/clients/${alert.clientId}`)}
                                                className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-none hover:bg-slate-200/50 dark:hover:bg-white/10"
                                                title="Ver Cliente"
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

            {/* Modal Crear Visita Rápida */}
            {quickModalService && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none max-w-md w-full p-4 shadow-2xl">
                        <h3 className="text-sm font-heading font-black text-slate-900 dark:text-slate-100 uppercase">
                            Agendar Visita Preventiva Rápida
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-1">
                            Se emitirá una Orden de Trabajo para {quickModalService.clientRazonSocial} ({quickModalService.serviceNombre}).
                        </p>

                        <form onSubmit={handleQuickSchedule} className="mt-3 space-y-3">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Instrucciones para el técnico de campo:
                                </label>
                                <textarea
                                    rows={3}
                                    value={orderDesc}
                                    onChange={(e) => setOrderDesc(e.target.value)}
                                    placeholder="Revisión mensual, verificación de banco de baterías y control de carga..."
                                    className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setQuickModalService(null)}
                                    className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-none"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={scheduling}
                                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-none shadow-2xs"
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
