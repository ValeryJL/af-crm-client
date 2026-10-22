import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { EquipmentDto, EquipmentPartDto } from '../api/crm';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Plus, HardHat, Wrench, AlertTriangle, Check, Trash2, Calendar 
} from 'lucide-react';

export function EquipmentDetail() {
    const { id } = useParams<{ id: string }>();
    const [equipment, setEquipment] = useState<EquipmentDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPartModal, setShowPartModal] = useState(false);
    const [partForm, setPartForm] = useState<Partial<EquipmentPartDto>>({
        nombreParte: '',
        codigoRepuesto: '',
        vidaUtilMeses: 12,
        vidaUtilHoras: 250,
        alertaTempranaDias: 15,
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (id) loadData(parseInt(id));
    }, [id]);

    const loadData = async (eqId: number) => {
        try {
            setLoading(true);
            const res = await crmApi.getEquipmentById(eqId);
            setEquipment(res.data);
        } catch (e) {
            console.error('Error loading equipment:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPart = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!equipment || !partForm.nombreParte) return;

        try {
            await crmApi.addPart(equipment.id!, partForm as EquipmentPartDto);
            setShowPartModal(false);
            setPartForm({ nombreParte: '', codigoRepuesto: '', vidaUtilMeses: 12, vidaUtilHoras: 250, alertaTempranaDias: 15 });
            loadData(equipment.id!);
        } catch (e) {
            console.error('Error adding part:', e);
        }
    };

    const handleDeletePart = async (partId: number) => {
        if (!confirm('¿Eliminar seguimiento de este componente?')) return;
        try {
            await crmApi.deletePart(partId);
            if (equipment) loadData(equipment.id!);
        } catch (e) {
            console.error('Error deleting part:', e);
        }
    };

    if (loading) return <div className="py-20 text-center text-sm text-slate-400">Cargando ficha técnica...</div>;
    if (!equipment) return <div className="py-20 text-center text-slate-500">Equipo no encontrado</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigate(`/services/${equipment.serviceId}`)} 
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
                        {equipment.nombre}
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {equipment.marca} {equipment.modelo} — Instalado en: {equipment.serviceNombre} ({equipment.clientRazonSocial})
                    </p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Horómetro Actual</span>
                    <span className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1 block">
                        {equipment.horometroActual || 0} <span className="text-sm font-semibold text-slate-400">hs</span>
                    </span>
                </div>
                <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Próximo Service Mayor</span>
                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1 block">
                        {equipment.fechaProximoServiceMayor || 'No definido'}
                    </span>
                </div>
                <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Ubicación / N° Serie</span>
                    <span className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1 block truncate">
                        {equipment.ubicacion || 'N/A'} — S/N: {equipment.numeroSerie || 'N/A'}
                    </span>
                </div>
            </div>

            {/* Specs JSON Viewer */}
            <div className="bg-white dark:bg-slate-800/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Ficha Técnica Flexible (Atributos Dinámicos)
                </h2>
                {equipment.specs && Object.keys(equipment.specs).length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {Object.entries(equipment.specs).map(([k, v]) => (
                            <div key={k} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">{k.replace('_', ' ')}</span>
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">{String(v)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-slate-400">Sin especificaciones técnicas adicionales.</p>
                )}
            </div>

            {/* Parts & Consumables Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            Piezas, Consumibles & Vencimientos ({equipment.parts ? equipment.parts.length : 0})
                        </h2>
                        <p className="text-xs text-slate-400">Baterías, filtros de aceite/combustible y correas críticas.</p>
                    </div>
                    <button
                        onClick={() => setShowPartModal(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir Parte Crítica</span>
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-3xl overflow-hidden shadow-sm">
                    {(!equipment.parts || equipment.parts.length === 0) ? (
                        <div className="py-12 text-center text-xs text-slate-400">No hay partes registradas para control preventivo.</div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900/40 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-100 dark:border-slate-700/50">
                                <tr>
                                    <th className="px-6 py-4">Repuesto / Parte</th>
                                    <th className="px-6 py-4">Último Cambio</th>
                                    <th className="px-6 py-4">Vida Útil</th>
                                    <th className="px-6 py-4">Vencimiento Estimado</th>
                                    <th className="px-6 py-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {equipment.parts.map((part) => (
                                    <tr key={part.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 dark:text-slate-100">{part.nombreParte}</div>
                                            <div className="text-xs text-slate-400 font-mono">{part.codigoRepuesto || 'Sin código'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                            {part.fechaUltimoCambio || 'No registrada'}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500">
                                            {part.vidaUtilMeses ? `${part.vidaUtilMeses} meses` : ''} 
                                            {part.vidaUtilHoras ? ` / ${part.vidaUtilHoras} hs` : ''}
                                        </td>
                                        <td className="px-6 py-4">
                                            {part.vencido ? (
                                                <span className="px-2.5 py-1 bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold rounded-lg text-xs flex items-center gap-1 w-max">
                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                    <span>{part.fechaVencimientoEstimada} (Vencido)</span>
                                                </span>
                                            ) : (
                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    {part.fechaVencimientoEstimada || 'N/A'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDeletePart(part.id!)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal Añadir Parte */}
            {showPartModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            Añadir Componente Crítico a {equipment.nombre}
                        </h3>
                        <form onSubmit={handleAddPart} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Nombre Componente / Repuesto *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Filtro de Aceite LF9009 / Batería 12V 110Ah"
                                    value={partForm.nombreParte}
                                    onChange={(e) => setPartForm({ ...partForm, nombreParte: e.target.value })}
                                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Código de Repuesto</label>
                                <input
                                    type="text"
                                    placeholder="OEM / Fabricante"
                                    value={partForm.codigoRepuesto}
                                    onChange={(e) => setPartForm({ ...partForm, codigoRepuesto: e.target.value })}
                                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Vida Útil (Meses)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={partForm.vidaUtilMeses}
                                        onChange={(e) => setPartForm({ ...partForm, vidaUtilMeses: parseInt(e.target.value) })}
                                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Vida Útil (Horas)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={partForm.vidaUtilHoras}
                                        onChange={(e) => setPartForm({ ...partForm, vidaUtilHoras: parseFloat(e.target.value) })}
                                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPartModal(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 active:scale-95"
                                >
                                    Guardar Parte
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
