import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { WorkOrderDto, ServiceDto } from '../api/crm';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, CheckCircle2, Check, AlertCircle, Wrench, Shield, Gauge, Zap, FileText 
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
    const [frecuencia, setFrecuencia] = useState<string>('50.1 Hz');
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

            // Populate form if existing
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
            alert('¡Orden de trabajo completada y SLA de visita recalculado con éxito!');
            navigate('/work-orders');
        } catch (e) {
            console.error('Error completing work order:', e);
            alert('Error al cerrar la orden de trabajo.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="py-20 text-center text-sm text-slate-400">Cargando reporte de campo...</div>;
    if (!order) return <div className="py-20 text-center text-slate-500">Orden de trabajo no encontrada</div>;

    const isCompleted = order.estado === 'COMPLETADA';

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            {/* Top Navigation */}
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigate('/work-orders')} 
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-lg">
                            {order.numeroOt}
                        </span>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                            Reporte de Servicio en Campo
                        </h1>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {order.clientRazonSocial} — {order.serviceNombre} ({order.direccionFisica})
                    </p>
                </div>
            </div>

            {isCompleted && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-bold">Esta orden fue completada con éxito. El ciclo preventivo y SLA del servicio han sido actualizados.</span>
                </div>
            )}

            <form onSubmit={handleCompleteReport} className="space-y-6">
                {/* 1. Medición de Parámetros de Operación (Mobile-First Large Inputs) */}
                <div className="bg-white dark:bg-slate-800/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/50">
                        <Gauge className="w-4 h-4 text-indigo-600" />
                        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                            1. Parámetros Técnicos & Mediciones Eléctricas
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                Horómetro Leído (hs)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                disabled={isCompleted}
                                value={horometro}
                                onChange={(e) => setHorometro(parseFloat(e.target.value))}
                                className="w-full text-base font-bold p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                Tensión Generada (V)
                            </label>
                            <input
                                type="text"
                                disabled={isCompleted}
                                value={tension}
                                onChange={(e) => setTension(e.target.value)}
                                className="w-full text-base font-bold p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                Frecuencia (Hz)
                            </label>
                            <input
                                type="text"
                                disabled={isCompleted}
                                value={frecuencia}
                                onChange={(e) => setFrecuencia(e.target.value)}
                                className="w-full text-base font-bold p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                Presión Aceite (bar)
                            </label>
                            <input
                                type="text"
                                disabled={isCompleted}
                                value={presionAceite}
                                onChange={(e) => setPresionAceite(e.target.value)}
                                className="w-full text-base font-bold p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                Temperatura Motor (°C)
                            </label>
                            <input
                                type="text"
                                disabled={isCompleted}
                                value={tempMotor}
                                onChange={(e) => setTempMotor(e.target.value)}
                                className="w-full text-base font-bold p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                Nivel Tanque (%)
                            </label>
                            <input
                                type="text"
                                disabled={isCompleted}
                                value={nivelCombustible}
                                onChange={(e) => setNivelCombustible(e.target.value)}
                                className="w-full text-base font-bold p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Checklist de Reemplazo de Partes Críticas */}
                {service && service.equipments && service.equipments.length > 0 && (
                    <div className="bg-white dark:bg-slate-800/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/50">
                            <Wrench className="w-4 h-4 text-indigo-600" />
                            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                                2. Sustitución de Consumibles y Partes en esta Visita
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {service.equipments.flatMap(eq => (eq.parts || []).map(part => (
                                <label 
                                    key={part.id} 
                                    className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
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
                                            className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div>
                                            <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">
                                                {part.nombreParte}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {eq.nombre} — Código: {part.codigoRepuesto || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                                        {repuestosReemplazados[String(part.id)] ? 'Reemplazado Hoy' : 'Sin cambio'}
                                    </span>
                                </label>
                            )))}
                        </div>
                    </div>
                )}

                {/* 3. Firma y Cierre */}
                <div className="bg-white dark:bg-slate-800/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/50">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                            3. Conformidad del Cliente & Observaciones Finales
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                Nombre y Apellido del Responsable Receptor *
                            </label>
                            <input
                                type="text"
                                required
                                disabled={isCompleted}
                                placeholder="Ej: Roberto Pérez"
                                value={firmaNombre}
                                onChange={(e) => setFirmaNombre(e.target.value)}
                                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                DNI / Documento del Responsable *
                            </label>
                            <input
                                type="text"
                                required
                                disabled={isCompleted}
                                placeholder="Ej: 32.456.789"
                                value={firmaDni}
                                onChange={(e) => setFirmaDni(e.target.value)}
                                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                            Observaciones Técnicas de Cierre
                        </label>
                        <textarea
                            rows={3}
                            disabled={isCompleted}
                            placeholder="Se ejecutó prueba de carga en vacío por 20 minutos sin anomalías térmicas..."
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {!isCompleted && (
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/work-orders')}
                            className="px-5 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
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
