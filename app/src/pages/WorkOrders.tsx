import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { WorkOrderDto, ServiceDto } from '../api/crm';
import { 
    FileText, Plus, CheckCircle2, Clock, Play, Check, 
    ArrowUpRight, AlertTriangle, UserCheck, Calendar, Filter, Kanban, Table as TableIcon, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function WorkOrders() {
    const [orders, setOrders] = useState<WorkOrderDto[]>([]);
    const [services, setServices] = useState<ServiceDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [orderForm, setOrderForm] = useState<Partial<WorkOrderDto>>({
        serviceId: undefined,
        tipo: 'PREVENTIVO',
        descripcion: '',
        fechaProgramada: new Date().toISOString().split('T')[0]
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
            await crmApi.createWorkOrder(orderForm as WorkOrderDto);
            setShowCreateModal(false);
            setOrderForm({
                serviceId: undefined,
                tipo: 'PREVENTIVO',
                descripcion: '',
                fechaProgramada: new Date().toISOString().split('T')[0]
            });
            loadData();
        } catch (e) {
            console.error('Error creating work order:', e);
        }
    };

    const handleStatusTransition = async (id: number, nextStatus: 'EN_CURSO' | 'COMPLETADA') => {
        try {
            await crmApi.updateWorkOrderStatus(id, nextStatus);
            loadData();
        } catch (e) {
            console.error('Error transitioning order status:', e);
        }
    };

    const columns = [
        { id: 'PENDIENTE', label: 'Pendientes', headerColor: 'border-slate-400' },
        { id: 'ASIGNADA', label: 'Asignadas', headerColor: 'border-amber-500' },
        { id: 'EN_CURSO', label: 'En Curso', headerColor: 'border-amber-600' },
        { id: 'COMPLETADA', label: 'Completadas', headerColor: 'border-emerald-500' },
    ];

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Header Industrial */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-300 dark:border-[#333639]">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-6 bg-amber-500 inline-block"></span>
                        <h1 className="text-xl sm:text-2xl font-heading font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase">
                            Órdenes de Trabajo (Work Orders)
                        </h1>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-4.5">
                        Flujo operativo de campo, servicios electromecánicos y reportes técnicos certificados.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => navigate('/planner')}
                        className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-[#141517] dark:hover:bg-[#25282c] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#333639] rounded-none font-heading font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span>Planificador Semanal</span>
                    </button>

                    <div className="flex items-center bg-slate-200 dark:bg-[#141517] p-0.5 rounded-none border border-slate-300 dark:border-[#333639] text-xs">
                        <button
                            onClick={() => setViewMode('KANBAN')}
                            className={`flex items-center gap-1.5 px-3 py-1 font-heading font-bold uppercase text-[10px] tracking-wider rounded-none transition-all ${
                                viewMode === 'KANBAN' 
                                    ? 'bg-amber-600 text-white' 
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Kanban className="w-3.5 h-3.5" />
                            <span>Kanban</span>
                        </button>
                        <button
                            onClick={() => setViewMode('TABLE')}
                            className={`flex items-center gap-1.5 px-3 py-1 font-heading font-bold uppercase text-[10px] tracking-wider rounded-none transition-all ${
                                viewMode === 'TABLE' 
                                    ? 'bg-amber-600 text-white' 
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <TableIcon className="w-3.5 h-3.5" />
                            <span>Tabla</span>
                        </button>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-none font-heading font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Nueva OT</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-16 text-center text-xs font-mono text-slate-400 uppercase tracking-widest">Cargando órdenes de trabajo...</div>
            ) : viewMode === 'KANBAN' ? (
                /* Kanban View */
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {columns.map((col) => {
                        const colOrders = orders.filter(o => o.estado === col.id);
                        return (
                            <div key={col.id} className="bg-white dark:bg-[#1e2022] p-3 rounded-none border border-slate-300 dark:border-[#333639] flex flex-col min-h-[550px] shadow-xs">
                                <div className={`flex items-center justify-between pb-2 mb-3 border-b-2 ${col.headerColor}`}>
                                    <h3 className="font-heading font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                                        {col.label}
                                    </h3>
                                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-[#141517] text-slate-700 dark:text-slate-300 rounded-none font-mono font-bold text-[10px] border border-slate-300 dark:border-[#333639]">
                                        {colOrders.length}
                                    </span>
                                </div>

                                <div className="space-y-2.5 flex-1 overflow-y-auto">
                                    {colOrders.map((wo) => (
                                        <div 
                                            key={wo.id}
                                            className="bg-slate-50 dark:bg-[#141517] p-3 rounded-none border border-slate-200 dark:border-[#333639] space-y-2 hover:border-amber-500 dark:hover:border-amber-500 transition-colors shadow-xs"
                                        >
                                            <div className="flex items-start justify-between">
                                                <span className="font-mono text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-none border border-amber-500/30">
                                                    {wo.numeroOt}
                                                </span>
                                                <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 bg-slate-200 dark:bg-[#282a2d] rounded-none text-slate-600 dark:text-slate-400">
                                                    {wo.tipo}
                                                </span>
                                            </div>

                                            <div>
                                                <h4 className="font-heading font-bold text-slate-900 dark:text-slate-100 text-xs leading-snug">
                                                    {wo.serviceNombre}
                                                </h4>
                                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{wo.clientRazonSocial}</p>
                                            </div>

                                            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                                {wo.descripcion}
                                            </p>

                                            <div className="pt-2 border-t border-slate-200 dark:border-[#333639] flex items-center justify-between gap-2">
                                                <button
                                                    onClick={() => navigate(`/work-orders/${wo.id}/report`)}
                                                    className="text-xs font-heading font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 uppercase tracking-wider"
                                                >
                                                    <span>Reporte</span>
                                                    <ArrowUpRight className="w-3 h-3" />
                                                </button>

                                                {wo.estado === 'PENDIENTE' && (
                                                    <button
                                                        onClick={() => handleStatusTransition(wo.id!, 'EN_CURSO')}
                                                        className="px-2 py-0.5 bg-amber-500/10 text-amber-500 font-mono font-bold text-[10px] rounded-none flex items-center gap-1 border border-amber-500/30 hover:bg-amber-500/20"
                                                    >
                                                        <Play className="w-2.5 h-2.5" />
                                                        <span>Iniciar</span>
                                                    </button>
                                                )}

                                                {wo.estado === 'EN_CURSO' && (
                                                    <button
                                                        onClick={() => navigate(`/work-orders/${wo.id}/report`)}
                                                        className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-mono font-bold text-[10px] rounded-none flex items-center gap-1 border border-emerald-500/30 hover:bg-emerald-500/20"
                                                    >
                                                        <Check className="w-2.5 h-2.5" />
                                                        <span>Cerrar OT</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {colOrders.length === 0 && (
                                        <div className="py-12 text-center text-[10px] font-mono text-slate-400 uppercase tracking-wider">
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
                <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-[#f1f3f5] dark:bg-[#141517] text-slate-500 dark:text-slate-400 uppercase text-[10px] font-heading font-bold border-b border-slate-300 dark:border-[#333639] tracking-wider">
                            <tr>
                                <th className="px-5 py-3">N° Orden</th>
                                <th className="px-5 py-3">Sede / Cliente</th>
                                <th className="px-5 py-3">Tipo</th>
                                <th className="px-5 py-3 text-center">Estado</th>
                                <th className="px-5 py-3">Programada</th>
                                <th className="px-5 py-3 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-[#333639]">
                            {orders.map((wo) => (
                                <tr key={wo.id} className="hover:bg-slate-100 dark:hover:bg-[#282a2d] transition-colors">
                                    <td className="px-5 py-3.5 font-mono font-bold text-amber-500">
                                        {wo.numeroOt}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{wo.serviceNombre}</div>
                                        <div className="text-[11px] text-slate-400">{wo.clientRazonSocial}</div>
                                    </td>
                                    <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                                        {wo.tipo}
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-none border ${
                                            wo.estado === 'COMPLETADA' 
                                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                                : wo.estado === 'EN_CURSO'
                                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                                    : 'bg-slate-100 dark:bg-[#141517] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#333639]'
                                        }`}>
                                            {wo.estado}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">
                                        {wo.fechaProgramada ? new Date(wo.fechaProgramada).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <button 
                                            onClick={() => navigate(`/work-orders/${wo.id}/report`)}
                                            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-heading font-bold rounded-none uppercase tracking-wider transition-colors"
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
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none max-w-md w-full p-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#333639]">
                            <h3 className="text-sm font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                                Nueva Orden de Trabajo
                            </h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateOrder} className="mt-4 space-y-3">
                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Sede / Servicio *</label>
                                <select
                                    required
                                    value={orderForm.serviceId || ''}
                                    onChange={(e) => setOrderForm({ ...orderForm, serviceId: parseInt(e.target.value) })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
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
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Tipo de Tarea</label>
                                <select
                                    value={orderForm.tipo}
                                    onChange={(e) => setOrderForm({ ...orderForm, tipo: e.target.value as any })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                >
                                    <option value="PREVENTIVO">Mantenimiento Preventivo</option>
                                    <option value="CORRECTIVO">Reparación Correctiva</option>
                                    <option value="SERVICE_MAYOR">Service Mayor (Horas Críticas)</option>
                                    <option value="INSPECCION">Inspección de Rutina</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Descripción de la Tarea *</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Detalle los trabajos electromecánicos a ejecutar..."
                                    value={orderForm.descripcion}
                                    onChange={(e) => setOrderForm({ ...orderForm, descripcion: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-sans"
                                />
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-[#333639]">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white rounded-none transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 text-xs font-heading font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-none shadow-xs uppercase tracking-wider transition-colors"
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
