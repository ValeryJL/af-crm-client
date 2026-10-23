import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { EquipmentDto, EquipmentPartDto } from '../api/crm';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Plus, HardHat, Wrench, AlertTriangle, Check, Trash2, Calendar, X, Edit3, AlertCircle
} from 'lucide-react';
import { EquipmentSpecsBuilder } from '../components/EquipmentSpecsBuilder';

export function EquipmentDetail() {
    const { id } = useParams<{ id: string }>();
    const [equipment, setEquipment] = useState<EquipmentDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPartModal, setShowPartModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [editForm, setEditForm] = useState<Partial<EquipmentDto>>({});
    const [specsData, setSpecsData] = useState<Record<string, any>>({});

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
            setEditForm(res.data);
            setSpecsData(res.data.specs || {});
        } catch (e) {
            console.error('Error loading equipment:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEquipment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!equipment?.id) return;
        setErrorMsg(null);

        try {
            setSaving(true);
            await crmApi.updateEquipment(equipment.id, {
                ...editForm,
                specs: specsData
            } as EquipmentDto);
            setShowEditModal(false);
            loadData(equipment.id);
        } catch (e: any) {
            console.error('Error updating equipment:', e);
            setErrorMsg(e.response?.data?.message || e.message || 'Error al actualizar equipo');
        } finally {
            setSaving(false);
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

    if (loading) return <div className="py-20 text-center text-xs font-mono text-slate-400 uppercase tracking-widest">Cargando ficha técnica...</div>;
    if (!equipment) return <div className="py-20 text-center text-slate-400 text-xs">Equipo no encontrado</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header / Navegación */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-300 dark:border-[#333639]">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate(`/services/${equipment.serviceId}`)} 
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-200 dark:hover:bg-[#282a2d] rounded-none transition-colors"
                        title="Volver a Sede"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-6 bg-amber-500 inline-block"></span>
                            <h1 className="text-xl sm:text-2xl font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                                {equipment.nombre}
                            </h1>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 pl-4.5 font-mono">
                            {equipment.marca} {equipment.modelo} — Instalado en: {equipment.serviceNombre} ({equipment.clientRazonSocial})
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setEditForm(equipment);
                        setSpecsData(equipment.specs || {});
                        setShowEditModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-none font-heading font-bold text-xs uppercase tracking-wider transition-colors shadow-xs self-start sm:self-auto"
                >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Ficha Técnica</span>
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-[#1e2022] p-4 rounded-none border border-slate-300 dark:border-[#333639] shadow-xs">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">Horómetro Actual</span>
                    <span className="text-2xl font-heading font-black text-slate-800 dark:text-slate-100 mt-1 block">
                        {equipment.horometroActual || 0} <span className="text-xs font-mono font-normal text-slate-400">hs</span>
                    </span>
                </div>
                <div className="bg-white dark:bg-[#1e2022] p-4 rounded-none border border-slate-300 dark:border-[#333639] shadow-xs">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-500 block tracking-wider">Preventivo Regular</span>
                    <span className="text-sm font-heading font-bold text-slate-800 dark:text-slate-100 mt-1 block font-mono">
                        {equipment.periodicidadRegular || 'MENSUAL'}
                        {equipment.intervaloHorasRegular ? ` (${equipment.intervaloHorasRegular} hs)` : ''}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        Próx: {equipment.fechaProximaVisitaRegular 
                            ? new Date(equipment.fechaProximaVisitaRegular + 'T00:00:00').toLocaleDateString('es-AR')
                            : 'Sin programar'}
                    </span>
                </div>
                <div className="bg-white dark:bg-[#1e2022] p-4 rounded-none border border-slate-300 dark:border-[#333639] shadow-xs">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">Service Mayor (Overhaul)</span>
                    <span className="text-sm font-heading font-bold text-slate-800 dark:text-slate-100 mt-1 block font-mono">
                        {equipment.periodicidadServiceMayor || 'ANUAL'}
                        {equipment.intervaloHorasService ? ` (${equipment.intervaloHorasService} hs)` : ''}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        {equipment.fechaProximoServiceMayor || 'No agendado'}
                    </span>
                </div>
                <div className="bg-white dark:bg-[#1e2022] p-4 rounded-none border border-slate-300 dark:border-[#333639] shadow-xs">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">N° Serie & Ubicación</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 mt-1 block truncate">
                        S/N: {equipment.numeroSerie || 'N/A'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono mt-1 block truncate">
                        {equipment.ubicacion || 'Sin ubicación específica'}
                    </span>
                </div>
            </div>

            {/* Specs JSON Viewer */}
            <div className="bg-white dark:bg-[#1e2022] p-4 rounded-none border border-slate-300 dark:border-[#333639] shadow-xs space-y-3">
                <h2 className="text-xs font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Ficha Técnica Dinámica (JSONB)
                </h2>
                {equipment.specs && Object.keys(equipment.specs).length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(equipment.specs).map(([k, v]) => (
                            <div key={k} className="p-2.5 bg-slate-50 dark:bg-[#141517] rounded-none border border-slate-200 dark:border-[#333639]">
                                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-wider">{k.replace('_', ' ')}</span>
                                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">{String(v)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-slate-400">Sin especificaciones técnicas adicionales registradas.</p>
                )}
            </div>

            {/* Parts & Consumables Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#333639]">
                    <div>
                        <h2 className="text-sm font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                            Piezas, Consumibles & Vencimientos ({equipment.parts ? equipment.parts.length : 0})
                        </h2>
                        <p className="text-xs text-slate-400">Control de filtros de aceite, combustible, correas y baterías.</p>
                    </div>
                    <button
                        onClick={() => setShowPartModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-none font-heading font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir Parte Crítica</span>
                    </button>
                </div>

                <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none overflow-hidden shadow-xs">
                    {(!equipment.parts || equipment.parts.length === 0) ? (
                        <div className="py-12 text-center text-xs text-slate-400">No hay partes registradas para control preventivo de esta máquina.</div>
                    ) : (
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#f1f3f5] dark:bg-[#141517] text-slate-500 dark:text-slate-400 uppercase text-[10px] font-heading font-bold border-b border-slate-300 dark:border-[#333639] tracking-wider">
                                <tr>
                                    <th className="px-5 py-3">Repuesto / Parte</th>
                                    <th className="px-5 py-3">Último Cambio</th>
                                    <th className="px-5 py-3">Vida Útil Programada</th>
                                    <th className="px-5 py-3">Vencimiento Estimado</th>
                                    <th className="px-5 py-3 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-[#333639]">
                                {equipment.parts.map((part) => (
                                    <tr key={part.id} className="hover:bg-slate-100 dark:hover:bg-[#282a2d] transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="font-bold text-slate-800 dark:text-slate-100">{part.nombreParte}</div>
                                            <div className="text-[11px] text-slate-400 font-mono">{part.codigoRepuesto || 'Sin código'}</div>
                                        </td>
                                        <td className="px-5 py-3 text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
                                            {part.fechaUltimoCambio || 'No registrada'}
                                        </td>
                                        <td className="px-5 py-3 text-xs font-mono text-slate-500">
                                            {part.vidaUtilMeses ? `${part.vidaUtilMeses} meses` : ''} 
                                            {part.vidaUtilHoras ? ` / ${part.vidaUtilHoras} hs` : ''}
                                        </td>
                                        <td className="px-5 py-3">
                                            {part.vencido ? (
                                                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono font-bold rounded-none text-[10px] flex items-center gap-1 w-max">
                                                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                                                    <span>{part.fechaVencimientoEstimada} (Vencido)</span>
                                                </span>
                                            ) : (
                                                <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                                                    {part.fechaVencimientoEstimada || 'N/A'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <button 
                                                onClick={() => handleDeletePart(part.id!)}
                                                className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                                                title="Eliminar Parte"
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
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none max-w-md w-full p-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#333639]">
                            <h3 className="text-sm font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                                Añadir Componente Crítico
                            </h3>
                            <button onClick={() => setShowPartModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleAddPart} className="mt-4 space-y-3">
                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Nombre Componente / Repuesto *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Filtro de Aceite LF9009 / Batería 12V 110Ah"
                                    value={partForm.nombreParte}
                                    onChange={(e) => setPartForm({ ...partForm, nombreParte: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Código de Repuesto</label>
                                <input
                                    type="text"
                                    placeholder="OEM / Fabricante"
                                    value={partForm.codigoRepuesto}
                                    onChange={(e) => setPartForm({ ...partForm, codigoRepuesto: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Vida Útil (Meses)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={partForm.vidaUtilMeses}
                                        onChange={(e) => setPartForm({ ...partForm, vidaUtilMeses: parseInt(e.target.value) })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Vida Útil (Horas)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={partForm.vidaUtilHoras}
                                        onChange={(e) => setPartForm({ ...partForm, vidaUtilHoras: parseFloat(e.target.value) })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-[#333639]">
                                <button
                                    type="button"
                                    onClick={() => setShowPartModal(false)}
                                    className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white rounded-none transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 text-xs font-heading font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-none shadow-xs uppercase tracking-wider transition-colors"
                                >
                                    Guardar Parte
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal Editar Ficha Técnica y Parámetros */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none max-w-xl w-full p-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#333639]">
                            <h3 className="text-sm font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                                Editar Ficha Técnica: {equipment.nombre}
                            </h3>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateEquipment} className="mt-4 space-y-3 max-h-[80vh] overflow-y-auto pr-1">
                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Nombre / Identificador *</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.nombre || ''}
                                    onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Marca</label>
                                    <input
                                        type="text"
                                        value={editForm.marca || ''}
                                        onChange={(e) => setEditForm({ ...editForm, marca: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Modelo</label>
                                    <input
                                        type="text"
                                        value={editForm.modelo || ''}
                                        onChange={(e) => setEditForm({ ...editForm, modelo: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">N° de Serie</label>
                                    <input
                                        type="text"
                                        value={editForm.numeroSerie || ''}
                                        onChange={(e) => setEditForm({ ...editForm, numeroSerie: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                    />
                                </div>
                            </div>

                            {/* Periodicidades */}
                            <div className="p-3 bg-slate-50 dark:bg-[#141517] border border-slate-300 dark:border-[#333639] space-y-3 rounded-none">
                                <span className="text-[10px] font-mono font-bold uppercase text-amber-500 tracking-wider block">
                                    Periodicidad de Mantenimiento del Equipo
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                            Preventivo Regular (Rutina)
                                        </label>
                                        <select
                                            value={editForm.periodicidadRegular || 'MENSUAL'}
                                            onChange={(e) => setEditForm({ ...editForm, periodicidadRegular: e.target.value })}
                                            className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                        >
                                            <option value="SEMANAL">Semanal</option>
                                            <option value="QUINCENAL">Quincenal</option>
                                            <option value="MENSUAL">Mensual</option>
                                            <option value="BIMESTRAL">Bimestral</option>
                                            <option value="TRIMESTRAL">Trimestral</option>
                                            <option value="SEMESTRAL">Semestral</option>
                                            <option value="ANUAL">Anual</option>
                                            <option value="HORAS">Por Horas de Marcha</option>
                                            <option value="A_DEMANDA">A Demanda</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                            Intervalo Horas (Regular)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="250 hs"
                                            value={editForm.intervaloHorasRegular ?? ''}
                                            onChange={(e) => setEditForm({ ...editForm, intervaloHorasRegular: parseInt(e.target.value) || undefined })}
                                            className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                            Service Mayor / Overhaul
                                        </label>
                                        <select
                                            value={editForm.periodicidadServiceMayor || 'ANUAL'}
                                            onChange={(e) => setEditForm({ ...editForm, periodicidadServiceMayor: e.target.value })}
                                            className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                        >
                                            <option value="ANUAL">Anual</option>
                                            <option value="BIANUAL">Bianual (2 Años)</option>
                                            <option value="HORAS">Por Horas (1000 hs)</option>
                                            <option value="NINGUNA">No Aplica</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                            Intervalo Horas (Mayor)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="1000 hs"
                                            value={editForm.intervaloHorasService ?? ''}
                                            onChange={(e) => setEditForm({ ...editForm, intervaloHorasService: parseInt(e.target.value) || undefined })}
                                            className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                            Horómetro Actual (hs)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={editForm.horometroActual ?? 0}
                                            onChange={(e) => setEditForm({ ...editForm, horometroActual: parseFloat(e.target.value) || 0 })}
                                            className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                            Ubicación Física en Planta
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Sala de máquinas / Azotea"
                                            value={editForm.ubicacion || ''}
                                            onChange={(e) => setEditForm({ ...editForm, ubicacion: e.target.value })}
                                            className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Specs Builder Component */}
                            <EquipmentSpecsBuilder
                                value={specsData}
                                onChange={(specs) => setSpecsData(specs)}
                            />

                            {errorMsg && (
                                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-[#333639]">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white rounded-none transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-1.5 text-xs font-heading font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-none shadow-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
