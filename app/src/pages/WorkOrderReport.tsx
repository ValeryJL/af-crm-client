import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { WorkOrderDto, ServiceDto } from '../api/crm';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, CheckCircle2, Check, Wrench, Gauge, FileText 
} from 'lucide-react';

export function WorkOrderReport() {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<WorkOrderDto | null>(null);
    const [service, setService] = useState<ServiceDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    // Field Report Mobile State
    const [horometro, setHorometro] = useState<number>(0);
    const [tension, setTension] = useState<string>('380V');
    const [frecuencia, setFrecuencia] = useState<string>('50.0 Hz');
    const [presionAceite, setPresionAceite] = useState<string>('4.5 bar');
    const [tempMotor, setTempMotor] = useState<string>('82 °C');
    const [nivelCombustible, setNivelCombustible] = useState<string>('85%');
    const [repuestosReemplazados, setRepuestosReemplazados] = useState<Record<string, boolean>>({});
    const [firmaNombre, setFirmaNombre] = useState<string>('');
    const [firmaDni, setFirmaDni] = useState<string>('');
    const [observaciones, setObservaciones] = useState<string>('');

    useEffect(() => {
        if (id) loadData(parseInt(id));
    }, [id]);

    const loadData = async (orderId: number) => {
        try {
            setLoading(true);
            const woRes = await crmApi.getWorkOrderById(orderId);
            setOrder(woRes.data);

            if (woRes.data.serviceId) {
                const sRes = await crmApi.getServiceById(woRes.data.serviceId);
                setService(sRes.data);
            }

            if (woRes.data.formDataReporte) {
                const rep = woRes.data.formDataReporte;
                if (rep.horometro) setHorometro(rep.horometro);
                if (rep.tension) setTension(rep.tension);
                if (rep.frecuencia) setFrecuencia(rep.frecuencia);
                if (rep.presionAceite) setPresionAceite(rep.presionAceite);
                if (rep.tempMotor) setTempMotor(rep.tempMotor);
                if (rep.nivelCombustible) setNivelCombustible(rep.nivelCombustible);
            }
            if (woRes.data.firmaClienteNombre) setFirmaNombre(woRes.data.firmaClienteNombre);
            if (woRes.data.firmaClienteDni) setFirmaDni(woRes.data.firmaClienteDni);
            if (woRes.data.observacionesCierre) setObservaciones(woRes.data.observacionesCierre);
        } catch (e) {
            console.error('Error loading report:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!order) return;

        try {
            setSaving(true);
            const reportPayload: Partial<WorkOrderDto> = {
                formDataReporte: {
                    horometro,
                    tension,
                    frecuencia,
                    presionAceite,
                    tempMotor,
                    nivelCombustible,
                    timestamp: new Date().toISOString()
                },
                partesReemplazadas: repuestosReemplazados,
                firmaClienteNombre: firmaNombre,
                firmaClienteDni: firmaDni,
                observacionesCierre: observaciones
            };

            await crmApi.completeWorkOrder(order.id!, reportPayload);
            alert('¡Orden de trabajo completada y ciclo SLA preventivo actualizado!');
            navigate('/work-orders');
        } catch (e) {
            console.error('Error completing work order:', e);
            alert('Error al cerrar la orden de trabajo.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="py-16 text-center text-xs font-mono text-slate-400 uppercase tracking-widest">Cargando reporte de campo...</div>;
    if (!order) return <div className="py-16 text-center text-slate-400 text-xs">Orden de trabajo no encontrada</div>;

    const isCompleted = order.estado === 'COMPLETADA';

    return (
        <div className="max-w-3xl mx-auto space-y-5 pb-12 animate-fade-in">
            {/* Top Navigation */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-300 dark:border-[#333639]">
                <button 
                    onClick={() => navigate('/work-orders')} 
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-200 dark:hover:bg-[#282a2d] rounded-none transition-colors"
                    title="Volver a Órdenes"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-none border border-amber-500/30">
                            {order.numeroOt}
                        </span>
                        <h1 className="text-xl sm:text-2xl font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                            Reporte Técnico Electromecánico
                        </h1>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                        {order.clientRazonSocial} — {order.serviceNombre} ({order.direccionFisica})
                    </p>
                </div>
            </div>

            {isCompleted && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-none flex items-center gap-3 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-mono font-bold">Esta orden fue completada con éxito. El ciclo preventivo y SLA del servicio han sido recalculados.</span>
                </div>
            )}

            <form onSubmit={handleCompleteReport} className="space-y-5">
                {/* 1. Medición de Parámetros de Operación */}
                <div className="bg-white dark:bg-[#1e2022] p-5 rounded-none border border-slate-300 dark:border-[#333639] shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-[#333639]">
                        <Gauge className="w-4 h-4 text-amber-500" />
                        <h2 className="text-xs font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                            1. Parámetros Técnicos & Mediciones en Operación
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                Horómetro Leído (hs)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                disabled={isCompleted}
                                value={horometro}
                                onChange={(e) => setHorometro(parseFloat(e.target.value))}
                                className="w-full text-xs font-mono font-bold p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                Tensión Generada (V)
                            </label>
                            <input
                                type="text"
                                disabled={isCompleted}
                                value={tension}
                                onChange={(e) => setTension(e.target.value)}
                                className="w-full text-xs font-mono font-bold p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                Frecuencia (Hz)
                            </label>
                            <input
                                type="text"
                                disabled={isCompleted}
                                value={frecuencia}
                                onChange={(e) => setFrecuencia(e.target.value)}
                                className="w-full text-xs font-mono font-bold p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                Presión Aceite (bar)
                            </label>
                            <input
                                type="text"
                                disabled={isCompleted}
                                value={presionAceite}
                                onChange={(e) => setPresionAceite(e.target.value)}
                                className="w-full text-xs font-mono font-bold p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                Temperatura Motor (°C)
                            </label>
                            <input
                                type="text"
                                disabled={isCompleted}
                                value={tempMotor}
                                onChange={(e) => setTempMotor(e.target.value)}
                                className="w-full text-xs font-mono font-bold p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                Nivel Combustible (%)
                            </label>
                            <input
                                type="text"
                                disabled={isCompleted}
                                value={nivelCombustible}
                                onChange={(e) => setNivelCombustible(e.target.value)}
                                className="w-full text-xs font-mono font-bold p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Checklist de Reemplazo de Partes Críticas */}
                {service && service.equipments && service.equipments.length > 0 && (
                    <div className="bg-white dark:bg-[#1e2022] p-5 rounded-none border border-slate-300 dark:border-[#333639] shadow-xs space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-[#333639]">
                            <Wrench className="w-4 h-4 text-amber-500" />
                            <h2 className="text-xs font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                                2. Sustitución de Consumibles y Partes en esta Visita
                            </h2>
                        </div>

                        <div className="space-y-2">
                            {service.equipments.flatMap(eq => (eq.parts || []).map(part => (
                                <label 
                                    key={part.id} 
                                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#141517] rounded-none border border-slate-200 dark:border-[#333639] cursor-pointer hover:border-amber-500 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            disabled={isCompleted}
                                            checked={!!repuestosReemplazados[String(part.id)]}
                                            onChange={(e) => setRepuestosReemplazados({
                                                ...repuestosReemplazados,
                                                [String(part.id)]: e.target.checked
                                            })}
                                            className="w-4 h-4 rounded-none text-amber-600 focus:ring-amber-500"
                                        />
                                        <div>
                                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
                                                {part.nombreParte}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                {eq.nombre} — Código: {part.codigoRepuesto || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">
                                        {repuestosReemplazados[String(part.id)] ? 'Reemplazado Hoy' : 'Sin cambio'}
                                    </span>
                                </label>
                            )))}
                        </div>
                    </div>
                )}

                {/* 3. Firma y Cierre */}
                <div className="bg-white dark:bg-[#1e2022] p-5 rounded-none border border-slate-300 dark:border-[#333639] shadow-xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-[#333639]">
                        <FileText className="w-4 h-4 text-amber-500" />
                        <h2 className="text-xs font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                            3. Conformidad del Cliente & Observaciones Finales
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                Nombre y Apellido del Responsable Receptor *
                            </label>
                            <input
                                type="text"
                                required
                                disabled={isCompleted}
                                placeholder="Ej: Roberto Pérez"
                                value={firmaNombre}
                                onChange={(e) => setFirmaNombre(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                DNI / Documento del Responsable *
                            </label>
                            <input
                                type="text"
                                required
                                disabled={isCompleted}
                                placeholder="Ej: 32.456.789"
                                value={firmaDni}
                                onChange={(e) => setFirmaDni(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                            Observaciones Técnicas de Cierre
                        </label>
                        <textarea
                            rows={3}
                            disabled={isCompleted}
                            placeholder="Se ejecutó prueba de carga en vacío por 20 minutos sin anomalías térmicas..."
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 font-sans"
                        />
                    </div>
                </div>

                {!isCompleted && (
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate('/work-orders')}
                            className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white rounded-none transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-heading font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-none uppercase tracking-wider transition-colors shadow-xs"
                        >
                            <Check className="w-4 h-4" />
                            <span>{saving ? 'Cerrando y Actualizando SLA...' : 'Firmar y Finalizar Servicio'}</span>
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
