import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { WorkOrderDto, ServiceDto } from '../api/crm';
import { 
    Plus, Kanban, Table as TableIcon, ArrowUpRight, Play, Check 
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

    const columns: Array<{ id: 'PENDIENTE' | 'ASIGNADA' | 'EN_CURSO' | 'COMPLETADA'; label: string; headerColor: string }> = [
        { id: 'PENDIENTE', label: 'Pendientes', headerColor: 'border-slate-400' },
        { id: 'ASIGNADA', label: 'Asignadas', headerColor: 'border-sky-500' },
        { id: 'EN_CURSO', label: 'En Curso', headerColor: 'border-amber-500' },
        { id: 'COMPLETADA', label: 'Completadas', headerColor: 'border-emerald-500' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                        Órdenes de Trabajo (Work Orders)
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Flujo operativo de campo, servicios preventivos y generación de reportes técnicos.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                        <button
                            onClick={() => setViewMode('KANBAN')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${
                                viewMode === 'KANBAN' 
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' 
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            <Kanban className="w-3.5 h-3.5" />
                            <span>Kanban</span>
                        </button>
                        <button
                            onClick={() => setViewMode('TABLE')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${
                                viewMode === 'TABLE' 
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' 
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            <TableIcon className="w-3.5 h-3.5" />
                            <span>Tabla</span>
                        </button>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs shadow-xs transition-all"
                    >
                        <Plus className="w-3.5 h-3.5 text-sky-400" />
                        <span>Nueva OT</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-16 text-center text-xs text-slate-400">Cargando órdenes de trabajo...</div>
            ) : viewMode === 'KANBAN' ? (
                /* Kanban View */
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {columns.map((col) => {
                        const colOrders = orders.filter(o => o.estado === col.id);
                        return (
                            <div key={col.id} className="bg-slate-100/70 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col min-h-[550px]">
                                <div className={`flex items-center justify-between pb-2 mb-3 border-b-2 ${col.headerColor}`}>
                                    <h3 className="font-heading font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wide">
                                        {col.label}
                                    </h3>
                                    <span className="px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-bold text-[11px] shadow-2xs">
                                        {colOrders.length}
                                    </span>
                                </div>

                                <div className="space-y-2.5 flex-1 overflow-y-auto">
                                    {colOrders.map((wo) => (
                                        <div 
                                            key={wo.id}
                                            className="bg-white dark:bg-slate-800 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2.5 hover:shadow-xs transition-all"
                                        >
                                            <div className="flex items-start justify-between">
                                                <span className="font-mono text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-100 dark:border-sky-900/40">
                                                    {wo.numeroOt}
                                                </span>
                                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
                                                    {wo.tipo}
                                                </span>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-snug">
                                                    {wo.serviceNombre}
                                                </h4>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{wo.clientRazonSocial}</p>
                                            </div>

                                            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                                {wo.descripcion}
                                            </p>

                                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                                                <button
                                                    onClick={() => navigate(`/work-orders/${wo.id}/report`)}
                                                    className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                                                >
                                                    <span>Reporte Campo</span>
                                                    <ArrowUpRight className="w-3 h-3" />
                                                </button>

                                                {wo.estado === 'PENDIENTE' && (
                                                    <button
                                                        onClick={() => handleStatusTransition(wo.id!, 'EN_CURSO')}
                                                        className="px-2 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold text-[10px] rounded flex items-center gap-1 border border-amber-200 dark:border-amber-800"
                                                    >
                                                        <Play className="w-2.5 h-2.5" />
                                                        <span>Iniciar</span>
                                                    </button>
                                                )}

                                                {wo.estado === 'EN_CURSO' && (
                                                    <button
                                                        onClick={() => navigate(`/work-orders/${wo.id}/report`)}
                                                        className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] rounded flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                                                    >
                                                        <Check className="w-2.5 h-2.5" />
                                                        <span>Cerrar OT</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {colOrders.length === 0 && (
                                        <div className="py-12 text-center text-[11px] text-slate-400 italic">
                                            Sin órdenes activas
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Table View */
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-5 py-3">N° Orden</th>
                                <th className="px-5 py-3">Sede / Cliente</th>
                                <th className="px-5 py-3">Tipo</th>
                                <th className="px-5 py-3">Estado</th>
                                <th className="px-5 py-3">Programada</th>
                                <th className="px-5 py-3 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {orders.map((wo) => (
                                <tr key={wo.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-5 py-3.5 font-mono font-bold text-sky-700 dark:text-sky-300">
                                        {wo.numeroOt}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{wo.serviceNombre}</div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{wo.clientRazonSocial}</div>
                                    </td>
                                    <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                                        {wo.tipo}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                            wo.estado === 'COMPLETADA' 
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' 
                                                : wo.estado === 'EN_CURSO'
                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                        }`}>
                                            {wo.estado}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-500">
                                        {wo.fechaProgramada ? new Date(wo.fechaProgramada).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <button 
                                            onClick={() => navigate(`/work-orders/${wo.id}/report`)}
                                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded transition-all"
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
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 shadow-xl">
                        <h3 className="text-base font-heading font-bold text-slate-900 dark:text-slate-100">
                            Nueva Orden de Trabajo
                        </h3>
                        <form onSubmit={handleCreateOrder} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sede / Servicio *</label>
                                <select
                                    required
                                    value={orderForm.serviceId || ''}
                                    onChange={(e) => setOrderForm({ ...orderForm, serviceId: parseInt(e.target.value) })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                                >
                                    <option value="">Seleccione una sede...</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.clientRazonSocial} — {s.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tipo de Tarea</label>
                                <select
                                    value={orderForm.tipo}
                                    onChange={(e) => setOrderForm({ ...orderForm, tipo: e.target.value as any })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                                >
                                    <option value="PREVENTIVO">Mantenimiento Preventivo</option>
                                    <option value="CORRECTIVO">Reparación Correctiva</option>
                                    <option value="SERVICE_MAYOR">Service Mayor (Horas Críticas)</option>
                                    <option value="INSPECCION">Inspección de Rutina</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Descripción de la Tarea *</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Detalle los trabajos a ejecutar por el técnico..."
                                    value={orderForm.descripcion}
                                    onChange={(e) => setOrderForm({ ...orderForm, descripcion: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
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
