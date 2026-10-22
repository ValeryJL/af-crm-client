import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { ServiceDto, EquipmentDto } from '../api/crm';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Plus, HardHat, Calendar, Clock, Wrench, FileText, Check 
} from 'lucide-react';

export function ServiceDetail() {
    const { id } = useParams<{ id: string }>();
    const [service, setService] = useState<ServiceDto | null>(null);
    const [equipments, setEquipments] = useState<EquipmentDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewEqModal, setShowNewEqModal] = useState(false);
    const [eqForm, setEqForm] = useState<Partial<EquipmentDto>>({
        nombre: '',
        marca: '',
        modelo: '',
        numeroSerie: '',
        ubicacion: '',
        horometroActual: 0,
        specs: {}
    });
    const [specsJson, setSpecsJson] = useState('{\n  "potencia_kva": 150,\n  "tension_salida": "380V/220V",\n  "combustible": "Diesel"\n}');
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            loadData(parseInt(id));
        }
    }, [id]);

    const loadData = async (serviceId: number) => {
        try {
            setLoading(true);
            const [servRes, eqRes] = await Promise.all([
                crmApi.getServiceById(serviceId),
                crmApi.getEquipmentsByService(serviceId)
            ]);
            setService(servRes.data);
            setEquipments(eqRes.data);
        } catch (e) {
            console.error('Error loading service details:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEquipment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!service || !eqForm.nombre) return;

        let parsedSpecs = {};
        try {
            parsedSpecs = JSON.parse(specsJson);
        } catch (e) {
            alert('El formato JSON de especificaciones técnicas no es válido.');
            return;
        }

        try {
            await crmApi.createEquipment({
                ...eqForm,
                serviceId: service.id!,
                specs: parsedSpecs
            } as EquipmentDto);
            setShowNewEqModal(false);
            setEqForm({ nombre: '', marca: '', modelo: '', numeroSerie: '', ubicacion: '', horometroActual: 0 });
            loadData(service.id!);
        } catch (e) {
            console.error('Error creating equipment:', e);
        }
    };

    if (loading) return <div className="py-20 text-center text-sm text-slate-400">Cargando sede de servicio...</div>;
    if (!service) return <div className="py-20 text-center text-slate-500">Servicio no encontrado</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigate('/services')} 
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
                            {service.nombre}
                        </h1>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                            {service.clientRazonSocial}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{service.direccionFisica}</p>
                </div>
            </div>

            {/* Equipments Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            Parque de Equipos Asignados ({equipments.length})
                        </h2>
                        <p className="text-xs text-slate-400">Ficha técnica dinámica JSONB, horómetros y control de partes.</p>
                    </div>
                    <button
                        onClick={() => setShowNewEqModal(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir Equipo</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {equipments.map((eq) => (
                        <div 
                            key={eq.id}
                            onClick={() => navigate(`/equipments/${eq.id}`)}
                            className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 p-5 rounded-2xl shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600/50 cursor-pointer transition-all space-y-4"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{eq.nombre}</h3>
                                    <p className="text-xs text-slate-400">{eq.marca} {eq.modelo} — S/N: {eq.numeroSerie || 'N/A'}</p>
                                </div>
                                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                    <HardHat className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Specs JSON preview */}
                            {eq.specs && Object.keys(eq.specs).length > 0 && (
                                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Especificaciones Dinámicas:</span>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                                        {Object.entries(eq.specs).map(([key, val]) => (
                                            <div key={key} className="truncate">
                                                <span className="text-slate-400 capitalize">{key.replace('_', ' ')}: </span>
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{String(val)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-700/50">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Horómetro:</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">{eq.horometroActual || 0} hs</span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Repuestos Críticos:</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">{eq.parts ? eq.parts.length : 0} items</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Crear Equipo */}
            {showNewEqModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            Añadir Equipo a {service.nombre}
                        </h3>
                        <form onSubmit={handleCreateEquipment} className="mt-4 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Nombre / Identificador *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Grupo Electrógeno Principal G1"
                                    value={eqForm.nombre}
                                    onChange={(e) => setEqForm({ ...eqForm, nombre: e.target.value })}
                                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Marca</label>
                                    <input
                                        type="text"
                                        placeholder="Caterpillar / Cummins"
                                        value={eqForm.marca}
                                        onChange={(e) => setEqForm({ ...eqForm, marca: e.target.value })}
                                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Modelo</label>
                                    <input
                                        type="text"
                                        placeholder="C15 / QSK60"
                                        value={eqForm.modelo}
                                        onChange={(e) => setEqForm({ ...eqForm, modelo: e.target.value })}
                                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Número de Serie</label>
                                    <input
                                        type="text"
                                        placeholder="SN-99882211"
                                        value={eqForm.numeroSerie}
                                        onChange={(e) => setEqForm({ ...eqForm, numeroSerie: e.target.value })}
                                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Horómetro Inicial (hs)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={eqForm.horometroActual}
                                        onChange={(e) => setEqForm({ ...eqForm, horometroActual: parseFloat(e.target.value) })}
                                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                    Ficha Técnica Flexible (JSONB):
                                </label>
                                <textarea
                                    rows={4}
                                    value={specsJson}
                                    onChange={(e) => setSpecsJson(e.target.value)}
                                    className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowNewEqModal(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 active:scale-95"
                                >
                                    Guardar Equipo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
