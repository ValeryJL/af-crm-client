import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { WorkOrderDto, ServiceDto, EquipmentDto } from '../api/crm';
import { 
    Calendar, ChevronLeft, ChevronRight, Plus, Clock, User, 
    Wrench, AlertTriangle, CheckCircle2, MoreVertical, X, 
    ArrowRight, Sparkles, Filter, HardHat, FileText, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SuggestionItem {
    id: string;
    serviceId: number;
    equipmentId?: number;
    equipmentNombre?: string;
    serviceNombre: string;
    clientRazonSocial: string;
    motivo: string;
    tipo: 'PREVENTIVO' | 'SERVICE_MAYOR';
    severidad: 'ALTA' | 'MEDIA';
}

interface TechnicianUser {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    role: string;
}

export function WeeklyPlanner() {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [workOrders, setWorkOrders] = useState<WorkOrderDto[]>([]);
    const [services, setServices] = useState<ServiceDto[]>([]);
    const [equipments, setEquipments] = useState<EquipmentDto[]>([]);
    const [technicians, setTechnicians] = useState<TechnicianUser[]>([]);
    const [loading, setLoading] = useState(true);

    // Left Pool Tab: 'PENDING' | 'SUGGESTIONS'
    const [poolTab, setPoolTab] = useState<'PENDING' | 'SUGGESTIONS'>('PENDING');

    // Modals
    const [assignModal, setAssignModal] = useState<{
        open: boolean;
        order?: WorkOrderDto;
        suggestion?: SuggestionItem;
        targetDate?: string;
        tecnicoId?: number;
    }>({ open: false });

    const [quickCreateModal, setQuickCreateModal] = useState<{
        open: boolean;
        targetDate?: string;
    }>({ open: false });

    const [quickOrderForm, setQuickOrderForm] = useState({
        serviceId: undefined as number | undefined,
        tipo: 'PREVENTIVO' as WorkOrderDto['tipo'],
        descripcion: '',
        tecnicoId: undefined as number | undefined,
    });

    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [woRes, servRes, eqRes, usersRes] = await Promise.all([
                crmApi.getWorkOrders(),
                crmApi.getServices(),
                crmApi.getEquipments(),
                crmApi.getUsers().catch(() => ({ data: [] }))
            ]);
            setWorkOrders(woRes.data);
            setServices(servRes.data);
            setEquipments(eqRes.data);
            setTechnicians(usersRes.data || []);
            if (servRes.data.length > 0 && !quickOrderForm.serviceId) {
                setQuickOrderForm(prev => ({ ...prev, serviceId: servRes.data[0].id }));
            }
        } catch (e) {
            console.error('Error loading planner data:', e);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Week Days (Monday to Sunday)
    const getWeekDays = (base: Date) => {
        const d = new Date(base);
        const day = d.getDay();
        // Day 0 is Sunday, adjust so Monday is first day (diff = 1 - day, if Sunday diff = -6)
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));

        const days = [];
        const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const todayStr = new Date().toISOString().split('T')[0];

        for (let i = 0; i < 7; i++) {
            const current = new Date(monday);
            current.setDate(monday.getDate() + i);
            const iso = current.toISOString().split('T')[0];
            days.push({
                iso,
                name: dayNames[i],
                dayNumber: current.getDate(),
                monthName: current.toLocaleDateString('es-AR', { month: 'short' }),
                isToday: iso === todayStr,
                dateObj: current,
            });
        }
        return days;
    };

    const weekDays = getWeekDays(currentDate);
    const weekStartStr = weekDays[0].dayNumber + ' ' + weekDays[0].monthName;
    const weekEndStr = weekDays[6].dayNumber + ' ' + weekDays[6].monthName + ' ' + weekDays[6].dateObj.getFullYear();

    const handlePrevWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 7);
        setCurrentDate(d);
    };

    const handleNextWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 7);
        setCurrentDate(d);
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    // Work Orders unassigned or without scheduled date
    const unscheduledOrders = workOrders.filter(wo => !wo.fechaProgramada || wo.estado === 'PENDIENTE');

    // Generate Automatic Maintenance Suggestions based on Equipments & Services
    const generateSuggestions = (): SuggestionItem[] => {
        const suggestions: SuggestionItem[] = [];

        // 1. From Equipments
        for (const eq of equipments) {
            if (eq.periodicidadRegular && eq.periodicidadRegular !== 'NINGUNA' && eq.periodicidadRegular !== 'A_DEMANDA') {
                suggestions.push({
                    id: `eq-reg-${eq.id}`,
                    serviceId: eq.serviceId,
                    equipmentId: eq.id,
                    equipmentNombre: eq.nombre,
                    serviceNombre: eq.serviceNombre || 'Sede',
                    clientRazonSocial: eq.clientRazonSocial || 'Cliente',
                    motivo: `Mantenimiento Preventivo Regular (${eq.periodicidadRegular}${eq.intervaloHorasRegular ? ` / ${eq.intervaloHorasRegular} hs` : ''})`,
                    tipo: 'PREVENTIVO',
                    severidad: 'MEDIA'
                });
            }
            if (eq.periodicidadServiceMayor && eq.periodicidadServiceMayor !== 'NINGUNA') {
                suggestions.push({
                    id: `eq-may-${eq.id}`,
                    serviceId: eq.serviceId,
                    equipmentId: eq.id,
                    equipmentNombre: eq.nombre,
                    serviceNombre: eq.serviceNombre || 'Sede',
                    clientRazonSocial: eq.clientRazonSocial || 'Cliente',
                    motivo: `Service Mayor / Overhaul Programado (${eq.periodicidadServiceMayor}${eq.intervaloHorasService ? ` / ${eq.intervaloHorasService} hs` : ''})`,
                    tipo: 'SERVICE_MAYOR',
                    severidad: 'ALTA'
                });
            }
        }

        // 2. From Services with Overdue or Upcoming SLA
        for (const s of services) {
            if (s.slaStatus === 'OVERDUE' || s.slaStatus === 'UPCOMING') {
                // Check if already suggested
                if (!suggestions.some(sug => sug.serviceId === s.id)) {
                    suggestions.push({
                        id: `srv-${s.id}`,
                        serviceId: s.id!,
                        serviceNombre: s.nombre,
                        clientRazonSocial: s.clientRazonSocial || 'Cliente',
                        motivo: s.slaStatus === 'OVERDUE' ? 'Visita Periódica Vencida por SLA' : 'Próxima Visita Preventiva según SLA',
                        tipo: 'PREVENTIVO',
                        severidad: s.slaStatus === 'OVERDUE' ? 'ALTA' : 'MEDIA'
                    });
                }
            }
        }

        return suggestions;
    };

    const suggestions = generateSuggestions();

    // Confirm Schedule / Create from Modal
    const handleConfirmAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        if (!assignModal.targetDate) {
            setErrorMsg('Por favor selecciona una fecha');
            return;
        }

        try {
            setSaving(true);
            const targetDateTime = `${assignModal.targetDate}T09:00:00`;

            if (assignModal.order) {
                // Update schedule of existing order
                await crmApi.scheduleWorkOrder(
                    assignModal.order.id!,
                    targetDateTime,
                    assignModal.tecnicoId
                );
            } else if (assignModal.suggestion) {
                // Create new work order from suggestion
                const sug = assignModal.suggestion;
                await crmApi.createWorkOrder({
                    serviceId: sug.serviceId,
                    tipo: sug.tipo,
                    estado: assignModal.tecnicoId ? 'ASIGNADA' : 'PENDIENTE',
                    fechaProgramada: targetDateTime,
                    tecnicoId: assignModal.tecnicoId,
                    descripcion: `[Generado Automáticamente] ${sug.motivo}${sug.equipmentNombre ? ` — Equipo: ${sug.equipmentNombre}` : ''}`
                } as WorkOrderDto);
            }

            setAssignModal({ open: false });
            loadData();
        } catch (e: any) {
            console.error('Error scheduling work order:', e);
            setErrorMsg(e.response?.data?.message || e.message || 'Error al programar orden');
        } finally {
            setSaving(false);
        }
    };

    // Quick create work order (with or without date)
    const handleQuickCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickOrderForm.serviceId || !quickOrderForm.descripcion) return;
        setErrorMsg(null);

        try {
            setSaving(true);
            const fecha = quickCreateModal.targetDate ? `${quickCreateModal.targetDate}T09:00:00` : undefined;
            await crmApi.createWorkOrder({
                serviceId: quickOrderForm.serviceId,
                tipo: quickOrderForm.tipo,
                estado: quickOrderForm.tecnicoId && fecha ? 'ASIGNADA' : 'PENDIENTE',
                fechaProgramada: fecha,
                tecnicoId: quickOrderForm.tecnicoId,
                descripcion: quickOrderForm.descripcion
            } as WorkOrderDto);

            setQuickCreateModal({ open: false });
            setQuickOrderForm({
                serviceId: services[0]?.id,
                tipo: 'PREVENTIVO',
                descripcion: '',
                tecnicoId: undefined
            });
            loadData();
        } catch (e: any) {
            console.error('Error creating work order:', e);
            setErrorMsg(e.response?.data?.message || e.message || 'Error al crear la orden');
        } finally {
            setSaving(false);
        }
    };

    // Unschedule work order (back to pool)
    const handleUnschedule = async (orderId: number) => {
        try {
            await crmApi.updateWorkOrder(orderId, {
                fechaProgramada: undefined,
                estado: 'PENDIENTE'
            });
            loadData();
        } catch (e) {
            console.error('Error unscheduling order:', e);
        }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Header Industrial y Navegación de Semana */}
            <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] p-4 rounded-none shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-6 bg-amber-500 inline-block"></span>
                        <h1 className="text-xl sm:text-2xl font-heading font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase">
                            Planificador Semanal de Órdenes de Trabajo
                        </h1>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-4.5">
                        Asignación ágil de técnicos por día, bandeja de pendientes y generación automática de preventivos.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Botones de navegación semanal */}
                    <div className="flex items-center bg-slate-100 dark:bg-[#141517] border border-slate-300 dark:border-[#333639] rounded-none">
                        <button
                            onClick={handlePrevWeek}
                            className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-500 hover:bg-slate-200 dark:hover:bg-[#25282c] transition-colors"
                            title="Semana anterior"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 uppercase">
                            {weekStartStr} — {weekEndStr}
                        </span>
                        <button
                            onClick={handleNextWeek}
                            className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-500 hover:bg-slate-200 dark:hover:bg-[#25282c] transition-colors"
                            title="Semana siguiente"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={handleToday}
                        className="px-3 py-1.5 text-xs font-mono font-bold uppercase bg-slate-100 hover:bg-slate-200 dark:bg-[#141517] dark:hover:bg-[#25282c] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#333639] rounded-none transition-colors"
                    >
                        Hoy
                    </button>

                    <button
                        onClick={() => {
                            setErrorMsg(null);
                            setQuickCreateModal({ open: true });
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-none font-heading font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Nueva OT</span>
                    </button>
                </div>
            </div>

            {/* Layout Principal: Drawer Lateral de Pendientes + Grid Semanal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Lateral: Bandeja de Pendientes y Sugerencias (3 columnas en desktop) */}
                <div className="lg:col-span-3 bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none shadow-xs flex flex-col h-[750px]">
                    {/* Header Bandeja */}
                    <div className="p-3 border-b border-slate-200 dark:border-[#333639]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-mono font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                                Bandeja Operativa
                            </span>
                            <button
                                onClick={() => {
                                    setErrorMsg(null);
                                    setQuickCreateModal({ open: true });
                                }}
                                className="text-[10px] font-mono font-bold uppercase text-amber-500 hover:underline flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" />
                                <span>OT Sin Fecha</span>
                            </button>
                        </div>
                        {/* Selector de Tabs */}
                        <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-[#141517] p-1 border border-slate-200 dark:border-[#333639]">
                            <button
                                onClick={() => setPoolTab('PENDING')}
                                className={`text-[10px] font-heading font-bold uppercase py-1.5 transition-all text-center ${
                                    poolTab === 'PENDING'
                                        ? 'bg-amber-600 text-white shadow-xs'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                Sin Agendar ({unscheduledOrders.length})
                            </button>
                            <button
                                onClick={() => setPoolTab('SUGGESTIONS')}
                                className={`text-[10px] font-heading font-bold uppercase py-1.5 transition-all text-center flex items-center justify-center gap-1 ${
                                    poolTab === 'SUGGESTIONS'
                                        ? 'bg-amber-600 text-white shadow-xs'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <Sparkles className="w-3 h-3" />
                                <span>Sugerencias ({suggestions.length})</span>
                            </button>
                        </div>
                    </div>

                    {/* Contenido scrolleable de la Bandeja */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                        {poolTab === 'PENDING' ? (
                            unscheduledOrders.length === 0 ? (
                                <div className="py-12 text-center text-xs text-slate-400">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                                    <p className="font-bold">No hay OTs pendientes</p>
                                    <p className="text-[11px] mt-1">Todas las órdenes están programadas.</p>
                                </div>
                            ) : (
                                unscheduledOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="p-3 bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#333639] rounded-none hover:border-amber-500 transition-colors space-y-2"
                                    >
                                        <div className="flex items-start justify-between gap-1">
                                            <span className="font-mono text-[11px] font-bold text-amber-500">
                                                {order.numeroOt}
                                            </span>
                                            <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 bg-slate-200 dark:bg-[#25282c] text-slate-700 dark:text-slate-300">
                                                {order.tipo}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                                {order.serviceNombre || 'Sede sin nombre'}
                                            </div>
                                            <div className="text-[10px] text-slate-400 truncate">
                                                {order.clientRazonSocial}
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 font-sans">
                                            {order.descripcion}
                                        </p>
                                        <div className="pt-2 border-t border-slate-200 dark:border-[#333639] flex items-center justify-between">
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                {order.tecnicoNombre || 'Sin técnico'}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setErrorMsg(null);
                                                    setAssignModal({
                                                        open: true,
                                                        order,
                                                        targetDate: weekDays[0].iso,
                                                        tecnicoId: order.tecnicoId
                                                    });
                                                }}
                                                className="flex items-center gap-1 px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white font-heading font-bold text-[10px] uppercase rounded-none transition-colors"
                                            >
                                                <span>Asignar Día</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )
                        ) : (
                            suggestions.length === 0 ? (
                                <div className="py-12 text-center text-xs text-slate-400">
                                    <p>No hay sugerencias preventivas pendientes.</p>
                                </div>
                            ) : (
                                suggestions.map((sug) => (
                                    <div
                                        key={sug.id}
                                        className="p-3 bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#333639] rounded-none hover:border-amber-500 transition-colors space-y-2"
                                    >
                                        <div className="flex items-start justify-between gap-1">
                                            <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/30">
                                                {sug.tipo}
                                            </span>
                                            {sug.severidad === 'ALTA' && (
                                                <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/30">
                                                    Prioritario
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                                {sug.equipmentNombre ? `${sug.equipmentNombre} (${sug.serviceNombre})` : sug.serviceNombre}
                                            </div>
                                            <div className="text-[10px] text-slate-400 truncate">
                                                {sug.clientRazonSocial}
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-sans">
                                            {sug.motivo}
                                        </p>
                                        <div className="pt-2 border-t border-slate-200 dark:border-[#333639] flex items-center justify-end">
                                            <button
                                                onClick={() => {
                                                    setErrorMsg(null);
                                                    setAssignModal({
                                                        open: true,
                                                        suggestion: sug,
                                                        targetDate: weekDays[0].iso
                                                    });
                                                }}
                                                className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-heading font-bold text-[10px] uppercase rounded-none transition-colors"
                                            >
                                                <span>+ Agendar a Día</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </div>

                {/* Cuadrícula Semanal (9 columnas en desktop, 7 días) */}
                <div className="lg:col-span-9 bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none shadow-xs overflow-x-auto h-[750px] flex flex-col">
                    <div className="grid grid-cols-7 min-w-[900px] flex-1 divide-x divide-slate-200 dark:divide-[#333639]">
                        {weekDays.map((day) => {
                            // Find orders scheduled on this date
                            const dayOrders = workOrders.filter(wo => {
                                if (!wo.fechaProgramada) return false;
                                return wo.fechaProgramada.startsWith(day.iso);
                            });

                            return (
                                <div
                                    key={day.iso}
                                    className={`flex flex-col h-full bg-white dark:bg-[#1e2022] ${
                                        day.isToday ? 'bg-amber-500/5' : ''
                                    }`}
                                >
                                    {/* Cabecera del Día */}
                                    <div className={`p-2.5 border-b border-slate-200 dark:border-[#333639] flex items-center justify-between ${
                                        day.isToday ? 'border-b-2 border-b-amber-500 bg-amber-500/10' : ''
                                    }`}>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-xs font-heading font-black uppercase ${
                                                    day.isToday ? 'text-amber-500' : 'text-slate-800 dark:text-slate-100'
                                                }`}>
                                                    {day.name}
                                                </span>
                                                {day.isToday && (
                                                    <span className="text-[9px] font-mono font-bold bg-amber-500 text-white px-1 py-0.2">
                                                        HOY
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-mono text-slate-400">
                                                {day.dayNumber} {day.monthName}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setErrorMsg(null);
                                                setQuickCreateModal({ open: true, targetDate: day.iso });
                                            }}
                                            className="p-1 text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-[#141517] transition-colors"
                                            title={`Agregar OT en ${day.name}`}
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Lista de OTs en este día */}
                                    <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                                        {dayOrders.length === 0 ? (
                                            <div className="h-24 flex items-center justify-center border border-dashed border-slate-200 dark:border-[#333639] text-[10px] font-mono text-slate-400 text-center p-2">
                                                Sin servicios
                                            </div>
                                        ) : (
                                            dayOrders.map((order) => {
                                                const isCompleted = order.estado === 'COMPLETADA';
                                                const isInProgress = order.estado === 'EN_CURSO';

                                                return (
                                                    <div
                                                        key={order.id}
                                                        className={`p-2.5 rounded-none border transition-colors space-y-1.5 ${
                                                            isCompleted
                                                                ? 'bg-emerald-500/5 border-emerald-500/30'
                                                                : isInProgress
                                                                    ? 'bg-amber-500/10 border-amber-500/40'
                                                                    : 'bg-slate-50 dark:bg-[#141517] border-slate-200 dark:border-[#333639] hover:border-amber-500'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between gap-1">
                                                            <span className="font-mono text-[10px] font-bold text-amber-500 truncate">
                                                                {order.numeroOt}
                                                            </span>
                                                            <span className={`text-[8px] font-mono font-bold uppercase px-1 py-0.2 ${
                                                                isCompleted
                                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                                    : isInProgress
                                                                        ? 'bg-amber-500/20 text-amber-400'
                                                                        : 'bg-slate-200 dark:bg-[#25282c] text-slate-600 dark:text-slate-300'
                                                            }`}>
                                                                {order.estado}
                                                            </span>
                                                        </div>

                                                        <div>
                                                            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                                                {order.serviceNombre || 'Sede'}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 truncate">
                                                                {order.clientRazonSocial}
                                                            </div>
                                                        </div>

                                                        <p className="text-[10px] text-slate-600 dark:text-slate-300 line-clamp-2">
                                                            {order.descripcion}
                                                        </p>

                                                        {/* Técnico Asignado */}
                                                        <div className="pt-1.5 border-t border-slate-200 dark:border-[#333639] flex items-center justify-between text-[10px]">
                                                            <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-mono truncate">
                                                                <User className="w-3 h-3 text-amber-500 shrink-0" />
                                                                <span className="truncate">{order.tecnicoNombre || 'Sin técnico'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <button
                                                                    onClick={() => handleUnschedule(order.id!)}
                                                                    className="p-1 text-slate-400 hover:text-rose-500"
                                                                    title="Desprogramar (enviar a bandeja)"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => navigate(`/work-orders/${order.id}/report`)}
                                                                    className="p-1 text-slate-400 hover:text-amber-500"
                                                                    title="Ver / Llenar reporte"
                                                                >
                                                                    <FileText className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Modal: Asignar a Día & Técnico */}
            {assignModal.open && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none max-w-md w-full p-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#333639]">
                            <h3 className="text-sm font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                                {assignModal.order ? 'Agendar Orden de Trabajo' : 'Crear & Agendar Preventivo'}
                            </h3>
                            <button onClick={() => setAssignModal({ open: false })} className="text-slate-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleConfirmAssign} className="mt-4 space-y-3">
                            <div className="p-3 bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#333639] text-xs space-y-1">
                                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase block">Detalle de la Visita</span>
                                <div className="font-bold text-slate-800 dark:text-slate-100">
                                    {assignModal.order?.serviceNombre || assignModal.suggestion?.serviceNombre}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                    {assignModal.order?.clientRazonSocial || assignModal.suggestion?.clientRazonSocial}
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                                    {assignModal.order?.descripcion || assignModal.suggestion?.motivo}
                                </p>
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                    Día de Ejecución en Campo *
                                </label>
                                <select
                                    required
                                    value={assignModal.targetDate || ''}
                                    onChange={(e) => setAssignModal({ ...assignModal, targetDate: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                >
                                    {weekDays.map(d => (
                                        <option key={d.iso} value={d.iso}>
                                            {d.name} {d.dayNumber} {d.monthName} {d.isToday ? '(HOY)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                    Técnico Asignado (Opcional)
                                </label>
                                <select
                                    value={assignModal.tecnicoId || ''}
                                    onChange={(e) => setAssignModal({ ...assignModal, tecnicoId: parseInt(e.target.value) || undefined })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                >
                                    <option value="">Sin técnico asignado (Pendiente)</option>
                                    {technicians.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.nombre} {t.apellido} ({t.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {errorMsg && (
                                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-[#333639]">
                                <button
                                    type="button"
                                    onClick={() => setAssignModal({ open: false })}
                                    className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white rounded-none transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-1.5 text-xs font-heading font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-none shadow-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Guardando...' : 'Confirmar Asignación'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Crear Nueva OT Rápida */}
            {quickCreateModal.open && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none max-w-md w-full p-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#333639]">
                            <h3 className="text-sm font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                                {quickCreateModal.targetDate ? 'Nueva Orden para el Día' : 'Nueva Orden Sin Fecha (Bandeja)'}
                            </h3>
                            <button onClick={() => setQuickCreateModal({ open: false })} className="text-slate-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleQuickCreateOrder} className="mt-4 space-y-3">
                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                    Sede / Servicio *
                                </label>
                                <select
                                    required
                                    value={quickOrderForm.serviceId || ''}
                                    onChange={(e) => setQuickOrderForm({ ...quickOrderForm, serviceId: parseInt(e.target.value) })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                >
                                    <option value="" disabled>Selecciona una sede o planta</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.nombre} ({s.clientRazonSocial})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                        Tipo de Servicio
                                    </label>
                                    <select
                                        value={quickOrderForm.tipo}
                                        onChange={(e) => setQuickOrderForm({ ...quickOrderForm, tipo: e.target.value as any })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                    >
                                        <option value="PREVENTIVO">Preventivo</option>
                                        <option value="CORRECTIVO">Correctivo / Reparación</option>
                                        <option value="SERVICE_MAYOR">Service Mayor</option>
                                        <option value="INSPECCION">Inspección</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                        Técnico
                                    </label>
                                    <select
                                        value={quickOrderForm.tecnicoId || ''}
                                        onChange={(e) => setQuickOrderForm({ ...quickOrderForm, tecnicoId: parseInt(e.target.value) || undefined })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                    >
                                        <option value="">Sin asignar</option>
                                        {technicians.map(t => (
                                            <option key={t.id} value={t.id}>
                                                {t.nombre} {t.apellido}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                    Descripción del Trabajo a Realizar *
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Detalle de tareas electromecánicas, equipos involucrados, etc."
                                    value={quickOrderForm.descripcion}
                                    onChange={(e) => setQuickOrderForm({ ...quickOrderForm, descripcion: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                />
                            </div>

                            {errorMsg && (
                                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-[#333639]">
                                <button
                                    type="button"
                                    onClick={() => setQuickCreateModal({ open: false })}
                                    className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white rounded-none transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-1.5 text-xs font-heading font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-none shadow-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Creando...' : 'Crear Orden'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
