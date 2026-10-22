import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { ServiceDto, EquipmentDto } from '../api/crm';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Plus, HardHat, Calendar, Clock, Wrench, FileText, Check, AlertTriangle, X
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

    if (loading) return <div className="py-20 text-center text-xs font-mono text-slate-400 uppercase tracking-widest">Cargando sede de servicio...</div>;
    if (!service) return <div className="py-20 text-center text-slate-400 text-xs">Servicio no encontrado</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header / Navegación */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-300 dark:border-[#333639]">
                <button 
                    onClick={() => navigate('/services')} 
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-200 dark:hover:bg-[#282a2d] rounded-none transition-colors"
                    title="Volver a Sedes"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="w-2.5 h-6 bg-amber-500 inline-block"></span>
                        <h1 className="text-xl sm:text-2xl font-heading font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase">
                            {service.nombre}
                        </h1>
                        <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-none bg-amber-500/10 text-amber-500 border border-amber-500/30">
                            {service.clientRazonSocial}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 pl-4.5 font-mono">{service.direccionFisica}</p>
                </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-[#1e2022] p-4 rounded-none border border-slate-300 dark:border-[#333639]">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">Frecuencia Preventiva</span>
                    <span className="text-base font-heading font-black text-slate-800 dark:text-slate-100 mt-1 block">
                        {service.frecuenciaVisita}
                    </span>
                </div>
                <div className="bg-white dark:bg-[#1e2022] p-4 rounded-none border border-slate-300 dark:border-[#333639]">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">Estado SLA</span>
                    <span className={`text-base font-heading font-black mt-1 block uppercase ${
                        service.slaStatus === 'OVERDUE' ? 'text-rose-500' : service.slaStatus === 'UPCOMING' ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                        {service.slaStatus}
                    </span>
                </div>
                <div className="bg-white dark:bg-[#1e2022] p-4 rounded-none border border-slate-300 dark:border-[#333639]">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">Próxima Visita Límite</span>
                    <span className="text-base font-mono font-bold text-slate-800 dark:text-slate-100 mt-1 block">
                        {service.fechaProximaVisitaLimite || 'No agendada'}
                    </span>
                </div>
            </div>

            {/* Equipments Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#333639]">
                    <div>
                        <h2 className="text-sm font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                            Parque de Equipos Asignados ({equipments.length})
                        </h2>
                        <p className="text-xs text-slate-400">Ficha técnica dinámica JSONB, horómetros y control de partes críticas.</p>
                    </div>
                    <button
                        onClick={() => setShowNewEqModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-none font-heading font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
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
                            className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] p-4 rounded-none shadow-xs hover:border-amber-500 dark:hover:border-amber-500 cursor-pointer transition-colors space-y-3"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-heading font-bold text-slate-800 dark:text-slate-100 text-sm">{eq.nombre}</h3>
                                    <p className="text-xs text-slate-400">{eq.marca} {eq.modelo} — S/N: {eq.numeroSerie || 'N/A'}</p>
                                </div>
                                <div className="p-2 bg-slate-100 dark:bg-[#141517] text-amber-500 border border-slate-300 dark:border-[#333639]">
                                    <HardHat className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Specs JSON preview */}
                            {eq.specs && Object.keys(eq.specs).length > 0 && (
                                <div className="p-2.5 bg-slate-50 dark:bg-[#141517] rounded-none border border-slate-200 dark:border-[#333639] space-y-1">
                                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">Ficha Técnica JSONB:</span>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs">
                                        {Object.entries(eq.specs).map(([key, val]) => (
                                            <div key={key} className="truncate">
                                                <span className="text-slate-400 font-mono text-[11px] capitalize">{key.replace('_', ' ')}: </span>
                                                <span className="font-semibold text-slate-700 dark:text-slate-200 text-[11px]">{String(val)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-[#333639]">
                                <div>
                                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Horómetro:</span>
                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{eq.horometroActual || 0} hs</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Partes Seguidas:</span>
                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{eq.parts ? eq.parts.length : 0} items</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {equipments.length === 0 && (
                        <div className="col-span-full py-8 text-center text-xs text-slate-400 bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639]">
                            No hay maquinaria asignada a esta sede todavía.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Crear Equipo */}
            {showNewEqModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none max-w-lg w-full p-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#333639]">
                            <h3 className="text-sm font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                                Añadir Equipo a {service.nombre}
                            </h3>
                            <button onClick={() => setShowNewEqModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateEquipment} className="mt-4 space-y-3 max-h-[80vh] overflow-y-auto">
                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Nombre / Identificador *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Grupo Electrógeno Principal G1"
                                    value={eqForm.nombre}
                                    onChange={(e) => setEqForm({ ...eqForm, nombre: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Marca</label>
                                    <input
                                        type="text"
                                        placeholder="Caterpillar / Cummins"
                                        value={eqForm.marca}
                                        onChange={(e) => setEqForm({ ...eqForm, marca: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Modelo</label>
                                    <input
                                        type="text"
                                        placeholder="C15 / QSK60"
                                        value={eqForm.modelo}
                                        onChange={(e) => setEqForm({ ...eqForm, modelo: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Número de Serie</label>
                                    <input
                                        type="text"
                                        placeholder="SN-99882211"
                                        value={eqForm.numeroSerie}
                                        onChange={(e) => setEqForm({ ...eqForm, numeroSerie: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Horómetro Inicial (hs)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={eqForm.horometroActual}
                                        onChange={(e) => setEqForm({ ...eqForm, horometroActual: parseFloat(e.target.value) })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                    Ficha Técnica Flexible (JSONB):
                                </label>
                                <textarea
                                    rows={4}
                                    value={specsJson}
                                    onChange={(e) => setSpecsJson(e.target.value)}
                                    className="w-full font-mono text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-[#333639]">
                                <button
                                    type="button"
                                    onClick={() => setShowNewEqModal(false)}
                                    className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white rounded-none transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 text-xs font-heading font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-none shadow-xs uppercase tracking-wider transition-colors"
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
