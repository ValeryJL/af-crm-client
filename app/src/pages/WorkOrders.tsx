import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { WorkOrderDto, ServiceDto } from '../api/crm';
import { 
    FileText, Plus, Search, Filter, Kanban, Table as TableIcon, 
    Clock, CheckCircle2, AlertCircle, ArrowUpRight, Play, Check 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function WorkOrders() {
    const [orders, setOrders] = useState<WorkOrderDto[]>([]);
    const [services, setServices] = useState<ServiceDto[]>([]);
    const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [orderForm, setOrderForm] = useState<Partial<WorkOrderDto>>({
        serviceId: undefined,
        tipo: 'PREVENTIVO',
        estado: 'PENDIENTE',
        descripcion: '',
    });
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [woRes, servRes] = await Promise.all([
                crmApi.getWorkOrders(),
                crmApi.getServices()
            ]);
            setOrders(woRes.data);
            setServices(servRes.data);
        } catch (e) {
            console.error('Error loading work orders:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderForm.serviceId || !orderForm.descripcion) return;

        try {
            await crmApi.createWorkOrder({
                ...orderForm,
                fechaProgramada: new Date().toISOString(),
            } as WorkOrderDto);
            setShowCreateModal(false);
            setOrderForm({ serviceId: undefined, tipo: 'PREVENTIVO', estado: 'PENDIENTE', descripcion: '' });
            loadData();
        } catch (e) {
            console.error('Error creating order:', e);
        }
    };

    const handleStatusTransition = async (orderId: number, nextStatus: string) => {
        try {
            await crmApi.updateWorkOrderStatus(orderId, nextStatus);
            loadData();
        } catch (e) {
            console.error('Error updating status:', e);
        }
    };

    const columns: Array<{ id: 'PENDIENTE' | 'ASIGNADA' | 'EN_CURSO' | 'COMPLETADA'; label: string; color: string }> = [
        { id: 'PENDIENTE', label: 'Pendientes', color: 'border-slate-300 dark:border-slate-700' },
        { id: 'ASIGNADA', label: 'Asignadas', color: 'border-blue-400' },
        { id: 'EN_CURSO', label: 'En Curso', color: 'border-amber-400' },
        { id: 'COMPLETADA', label: 'Completadas', color: 'border-emerald-500' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                        Órdenes de Trabajo (Work Orders)
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Flujo operativo de campo, despacho de técnicos y reportes técnicos de mantenimiento.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                        <button
                            onClick={() => setViewMode('KANBAN')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                                viewMode === 'KANBAN' 
                                    ? 'bg-indigo-600 text-white shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            <Kanban className="w-3.5 h-3.5" />
                            <span>Kanban</span>
                        </button>
                        <button
                            onClick={() => setViewMode('TABLE')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                                viewMode === 'TABLE' 
                                    ? 'bg-indigo-600 text-white shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            <TableIcon className="w-3.5 h-3.5" />
                            <span>Tabla</span>
                        </button>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nueva OT</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-sm text-slate-400">Cargando órdenes de trabajo...</div>
            ) : viewMode === 'KANBAN' ? (
                /* Kanban View */
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {columns.map((col) => {
                        const colOrders = orders.filter(o => o.estado === col.id);
                        return (
                            <div key={col.id} className="bg-slate-100/70 dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 flex flex-col min-h-[600px]">
                                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                                    <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                                        {col.label}
                                    </h3>
                                    <span className="px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-500 rounded-full font-bold text-xs shadow-sm">
                                        {colOrders.length}
                                    </span>
                                </div>

                                <div className="space-y-3 flex-1 overflow-y-auto">
                                    {colOrders.map((wo) => (
                                        <div 
                                            key={wo.id}
                                            className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-3 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-start justify-between">
                                                <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                                                    {wo.numeroOt}
                                                </span>
                                                <span className="text-[10px] font-bold uppercase text-slate-400">
                                                    {wo.tipo}
                                                </span>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug">
                                                    {wo.serviceNombre}
                                                </h4>
                                                <p className="text-xs text-slate-400 mt-0.5">{wo.clientRazonSocial}</p>
                                            </div>

                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                                {wo.descripcion}
                                            </p>

                                            {/* Action bar on card */}
                                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-2">
                                                <button
                                                    onClick={() => navigate(`/work-orders/${wo.id}/report`)}
                                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                                >
                                                    <span>Reporte Campo</span>
                                                    <ArrowUpRight className="w-3 h-3" />
                                                </button>

                                                {wo.estado === 'PENDIENTE' && (
                                                    <button
                                                        onClick={() => handleStatusTransition(wo.id!, 'EN_CURSO')}
                                                        className="px-2 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold text-[10px] rounded-lg flex items-center gap-1"
                                                    >
                                                        <Play className="w-2.5 h-2.5" />
                                                        <span>Iniciar</span>
                                                    </button>
                                                )}

                                                {wo.estado === 'EN_CURSO' && (
                                                    <button
                                                        onClick={() => navigate(`/work-orders/${wo.id}/report`)}
                                                        className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded-lg flex items-center gap-1"
                                                    >
                                                        <Check className="w-2.5 h-2.5" />
                                                        <span>Cerrar OT</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {colOrders.length === 0 && (
                                        <div className="py-12 text-center text-xs text-slate-400 italic">
                                            Sin órdenes en esta columna
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Table View */
                <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/40 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-100 dark:border-slate-700/50">
                            <tr>
                                <th className="px-6 py-4">N° Orden</th>
                                <th className="px-6 py-4">Sede / Cliente</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Programada</th>
                                <th className="px-6 py-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {orders.map((wo) => (
                                <tr key={wo.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                                        {wo.numeroOt}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800 dark:text-slate-100">{wo.serviceNombre}</div>
                                        <div className="text-xs text-slate-400">{wo.clientRazonSocial}</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        {wo.tipo}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${
                                            wo.estado === 'COMPLETADA' 
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                                                : wo.estado === 'EN_CURSO'
                                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                        }`}>
                                            {wo.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500">
                                        {wo.fechaProgramada ? new Date(wo.fechaProgramada).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => navigate(`/work-orders/${wo.id}/report`)}
                                            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-all"
                                        >
                                            Ver Reporte
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Crear OT */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            Crear Nueva Orden de Trabajo
                        </h3>
                        <form onSubmit={handleCreateOrder} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Sede / Servicio *</label>
                                <select
                                    required
                                    value={orderForm.serviceId || ''}
                                    onChange={(e) => setOrderForm({ ...orderForm, serviceId: parseInt(e.target.value) })}
                                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Seleccione una sede de cliente...</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.clientRazonSocial} — {s.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Tipo de Tarea</label>
                                <select
                                    value={orderForm.tipo}
                                    onChange={(e) => setOrderForm({ ...orderForm, tipo: e.target.value as any })}
                                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="PREVENTIVO">Mantenimiento Preventivo</option>
                                    <option value="CORRECTIVO">Reparación Correctiva</option>
                                    <option value="SERVICE_MAYOR">Service Mayor (Horas Críticas)</option>
                                    <option value="INSPECCION">Inspección de Rutina</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Descripción de la Tarea *</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Detalle los trabajos a ejecutar por el técnico..."
                                    value={orderForm.descripcion}
                                    onChange={(e) => setOrderForm({ ...orderForm, descripcion: e.target.value })}
                                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 active:scale-95"
                                >
                                    Emitir Orden
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
