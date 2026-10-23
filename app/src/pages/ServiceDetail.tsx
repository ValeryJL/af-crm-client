import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { ServiceDto, EquipmentDto } from '../api/crm';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Plus, HardHat, Calendar, Clock, Wrench, FileText, Check, AlertTriangle, X, AlertCircle, RefreshCw, Edit3
} from 'lucide-react';
import { EquipmentSpecsBuilder } from '../components/EquipmentSpecsBuilder';

export function ServiceDetail() {
    const { id } = useParams<{ id: string }>();
    const [service, setService] = useState<ServiceDto | null>(null);
    const [equipments, setEquipments] = useState<EquipmentDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewEqModal, setShowNewEqModal] = useState(false);
    const [showEditServiceModal, setShowEditServiceModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savingService, setSavingService] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [serviceError, setServiceError] = useState<string | null>(null);

    const [serviceEditForm, setServiceEditForm] = useState<Partial<ServiceDto>>({});

    const [eqForm, setEqForm] = useState<Partial<EquipmentDto>>({
        nombre: '',
        marca: '',
        modelo: '',
        numeroSerie: '',
        ubicacion: '',
        periodicidadRegular: 'MENSUAL',
        intervaloHorasRegular: 250,
        periodicidadServiceMayor: 'ANUAL',
        intervaloHorasService: 1000,
        horometroActual: 0,
        specs: {}
    });
    const [specsData, setSpecsData] = useState<Record<string, any>>({});
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

    const handleOpenEditService = () => {
        if (!service) return;
        setServiceEditForm({
            nombre: service.nombre || '',
            direccionFisica: service.direccionFisica || '',
            localidad: service.localidad || 'La Plata',
            provincia: service.provincia || 'Buenos Aires',
            frecuenciaVisita: service.frecuenciaVisita || 'MENSUAL',
            diasAvisoAlerta: service.diasAvisoAlerta || 7,
            clientId: service.clientId,
            notas: service.notas || ''
        });
        setServiceError(null);
        setShowEditServiceModal(true);
    };

    const handleSaveService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!service || !serviceEditForm.nombre || !serviceEditForm.direccionFisica) return;

        try {
            setSavingService(true);
            setServiceError(null);
            await crmApi.updateService(service.id!, serviceEditForm as ServiceDto);
            setShowEditServiceModal(false);
            loadData(service.id!);
        } catch (e: any) {
            console.error('Error updating service:', e);
            setServiceError(e.response?.data?.message || e.message || 'Error al actualizar la sede');
        } finally {
            setSavingService(false);
        }
    };

    const handleCreateEquipment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!service || !eqForm.nombre) return;
        setErrorMsg(null);

        try {
            setSaving(true);
            await crmApi.createEquipment({
                ...eqForm,
                serviceId: service.id!,
                specs: specsData
            } as EquipmentDto);
            setShowNewEqModal(false);
            setEqForm({
                nombre: '',
                marca: '',
                modelo: '',
                numeroSerie: '',
                ubicacion: '',
                periodicidadRegular: 'MENSUAL',
                intervaloHorasRegular: 250,
                periodicidadServiceMayor: 'ANUAL',
                intervaloHorasService: 1000,
                horometroActual: 0
            });
            setSpecsData({});
            loadData(service.id!);
        } catch (e: any) {
            console.error('Error creating equipment:', e);
            setErrorMsg(e.response?.data?.message || e.message || 'Error al guardar el equipo');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="py-20 text-center text-xs font-mono text-slate-400 uppercase tracking-widest">Cargando sede de servicio...</div>;
    if (!service) return <div className="py-20 text-center text-slate-400 text-xs">Servicio no encontrado</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header / Navegación */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-300 dark:border-[#333639]">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/services')} 
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-200 dark:hover:bg-[#282a2d] rounded-none transition-colors"
                        title="Volver a Sedes"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
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

                <button
                    onClick={handleOpenEditService}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-[#1e2022] hover:bg-slate-200 dark:hover:bg-[#282a2d] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#333639] rounded-none font-heading font-bold text-xs uppercase tracking-wider transition-colors shadow-xs self-start sm:self-auto"
                >
                    <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Editar Sede</span>
                </button>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-[#1e2022] p-4 rounded-none border border-slate-300 dark:border-[#333639] shadow-xs">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">Frecuencia Contractual</span>
                    <span className="text-lg font-heading font-black text-amber-500 mt-1 block font-mono">
                        {service.frecuenciaVisita}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Aviso preventivo: {service.diasAvisoAlerta} días</span>
                </div>

                <div className="bg-white dark:bg-[#1e2022] p-4 rounded-none border border-slate-300 dark:border-[#333639] shadow-xs">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">Parque de Maquinaria</span>
                    <span className="text-lg font-heading font-black text-slate-800 dark:text-slate-100 mt-1 block">
                        {equipments.length} <span className="text-xs font-mono font-normal text-slate-400">equipos</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Activos en sede</span>
                </div>

                <div className="bg-white dark:bg-[#1e2022] p-4 rounded-none border border-slate-300 dark:border-[#333639] shadow-xs">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">Última Visita Registrada</span>
                    <span className="text-lg font-heading font-bold text-slate-800 dark:text-slate-100 mt-1 block font-mono">
                        {service.fechaUltimaVisita || 'Sin registro'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Historial de servicio</span>
                </div>

                <div className="bg-white dark:bg-[#1e2022] p-4 rounded-none border border-slate-300 dark:border-[#333639] shadow-xs">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">Estado SLA Preventivo</span>
                    <span className="text-lg font-heading font-bold text-slate-800 dark:text-slate-100 mt-1 block font-mono">
                        {service.fechaProximaVisitaLimite || 'Calculando'}
                    </span>
                    <span className="text-[10px] text-amber-500 font-mono mt-0.5 block font-bold">Fecha límite sugerida</span>
                </div>
            </div>

            {/* Equipos Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#333639]">
                    <div className="flex items-center gap-2">
                        <HardHat className="w-4 h-4 text-amber-500" />
                        <h2 className="text-sm font-heading font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                            Equipos Electromecánicos Asignados ({equipments.length})
                        </h2>
                    </div>
                    <button
                        onClick={() => {
                            setErrorMsg(null);
                            setShowNewEqModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-none shadow-xs transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Equipo</span>
                    </button>
                </div>

                {equipments.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none">
                        <HardHat className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No hay maquinaria dada de alta en esta sede.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {equipments.map((eq) => (
                            <div 
                                key={eq.id}
                                onClick={() => navigate(`/equipments/${eq.id}`)}
                                className="bg-white dark:bg-[#1e2022] p-4 border border-slate-300 dark:border-[#333639] hover:border-amber-500 dark:hover:border-amber-500 cursor-pointer transition-colors shadow-xs space-y-3"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-sm font-heading font-bold text-slate-800 dark:text-slate-100 uppercase">
                                            {eq.nombre}
                                        </h3>
                                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                            {eq.marca} {eq.modelo} — S/N: {eq.numeroSerie || 'N/A'}
                                        </p>
                                    </div>
                                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-[#141517] border border-slate-300 dark:border-[#333639] text-slate-600 dark:text-slate-300">
                                        {eq.horometroActual || 0} hs
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-[#333639] text-[11px] font-mono">
                                    <div>
                                        <span className="text-slate-400 block text-[9px] uppercase">Rutina Regular</span>
                                        <span className="text-slate-700 dark:text-slate-200 font-bold">{eq.periodicidadRegular || 'MENSUAL'}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-slate-400 block text-[9px] uppercase">Service Mayor</span>
                                        <span className="text-amber-500 font-bold">{eq.periodicidadServiceMayor || 'ANUAL'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Editar Sede */}
            {showEditServiceModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] w-full max-w-lg shadow-2xl p-6 relative">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-300 dark:border-[#333639] mb-4">
                            <div>
                                <h2 className="text-sm font-heading font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                                    Editar Sede / Contrato
                                </h2>
                                <p className="text-[11px] text-slate-400">Modifica los parámetros operativos de la instalación</p>
                            </div>
                            <button
                                onClick={() => setShowEditServiceModal(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveService} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                    Nombre de la Sede / Planta *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={serviceEditForm.nombre || ''}
                                    onChange={(e) => setServiceEditForm({ ...serviceEditForm, nombre: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                    Dirección Física *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={serviceEditForm.direccionFisica || ''}
                                    onChange={(e) => setServiceEditForm({ ...serviceEditForm, direccionFisica: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Localidad</label>
                                    <input
                                        type="text"
                                        value={serviceEditForm.localidad || ''}
                                        onChange={(e) => setServiceEditForm({ ...serviceEditForm, localidad: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Provincia</label>
                                    <input
                                        type="text"
                                        value={serviceEditForm.provincia || ''}
                                        onChange={(e) => setServiceEditForm({ ...serviceEditForm, provincia: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Frecuencia Base</label>
                                    <select
                                        value={serviceEditForm.frecuenciaVisita || 'MENSUAL'}
                                        onChange={(e) => setServiceEditForm({ ...serviceEditForm, frecuenciaVisita: e.target.value as any })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                    >
                                        <option value="SEMANAL">Semanal</option>
                                        <option value="QUINCENAL">Quincenal</option>
                                        <option value="MENSUAL">Mensual</option>
                                        <option value="BIMESTRAL">Bimestral</option>
                                        <option value="TRIMESTRAL">Trimestral</option>
                                        <option value="SEMESTRAL">Semestral</option>
                                        <option value="ANUAL">Anual</option>
                                        <option value="A_DEMANDA">A Demanda</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Días Aviso Alerta</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={serviceEditForm.diasAvisoAlerta || 7}
                                        onChange={(e) => setServiceEditForm({ ...serviceEditForm, diasAvisoAlerta: parseInt(e.target.value) || 7 })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Notas / Instrucciones</label>
                                <textarea
                                    rows={2}
                                    value={serviceEditForm.notas || ''}
                                    onChange={(e) => setServiceEditForm({ ...serviceEditForm, notas: e.target.value })}
                                    className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                />
                            </div>

                            {serviceError && (
                                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{serviceError}</span>
                                </div>
                            )}

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-[#333639]">
                                <button
                                    type="button"
                                    onClick={() => setShowEditServiceModal(false)}
                                    className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white rounded-none transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingService}
                                    className="px-4 py-1.5 text-xs font-heading font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-none shadow-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                                >
                                    {savingService ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Crear Equipo */}
            {showNewEqModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] w-full max-w-2xl shadow-2xl p-6 relative">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-300 dark:border-[#333639] mb-4">
                            <div>
                                <h2 className="text-sm font-heading font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                                    Nuevo Equipo para {service.nombre}
                                </h2>
                                <p className="text-[11px] text-slate-400">Registra un grupo electrógeno o activo para mantenimiento</p>
                            </div>
                            <button
                                onClick={() => setShowNewEqModal(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateEquipment} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Nombre Identificador *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="ej. Grupo CETEC John Deere 60kVA"
                                    value={eqForm.nombre}
                                    onChange={(e) => setEqForm({ ...eqForm, nombre: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                                        placeholder="C150 D5"
                                        value={eqForm.modelo}
                                        onChange={(e) => setEqForm({ ...eqForm, modelo: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">N° de Serie</label>
                                    <input
                                        type="text"
                                        placeholder="SN-445588"
                                        value={eqForm.numeroSerie}
                                        onChange={(e) => setEqForm({ ...eqForm, numeroSerie: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                    />
                                </div>
                            </div>

                            {/* Periodicidades de Mantenimiento Preventivo y Mayor */}
                            <div className="p-3 bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#333639] space-y-3">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500 block">
                                    Periodicidades de Servicio de este Equipo
                                </span>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                            Periodicidad Regular (Rutina)
                                        </label>
                                        <select
                                            value={eqForm.periodicidadRegular || 'MENSUAL'}
                                            onChange={(e) => setEqForm({ ...eqForm, periodicidadRegular: e.target.value })}
                                            className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                        >
                                            <option value="SEMANAL">Semanal</option>
                                            <option value="QUINCENAL">Quincenal</option>
                                            <option value="MENSUAL">Mensual</option>
                                            <option value="BIMESTRAL">Bimestral</option>
                                            <option value="TRIMESTRAL">Trimestral</option>
                                            <option value="SEMESTRAL">Semestral</option>
                                            <option value="ANUAL">Anual</option>
                                            <option value="HORAS">Por Horas de Uso</option>
                                            <option value="NINGUNA">Sin Periodicidad</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                            Intervalo Horas (Regular)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="250 hs"
                                            value={eqForm.intervaloHorasRegular || ''}
                                            onChange={(e) => setEqForm({ ...eqForm, intervaloHorasRegular: parseInt(e.target.value) || undefined })}
                                            className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                            Periodicidad Service Mayor
                                        </label>
                                        <select
                                            value={eqForm.periodicidadServiceMayor || 'ANUAL'}
                                            onChange={(e) => setEqForm({ ...eqForm, periodicidadServiceMayor: e.target.value })}
                                            className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                        >
                                            <option value="ANUAL">Anual</option>
                                            <option value="BIANUAL">Bianual (2 Años)</option>
                                            <option value="HORAS">Por Horas (1000/1500 hs)</option>
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
                                            value={eqForm.intervaloHorasService || ''}
                                            onChange={(e) => setEqForm({ ...eqForm, intervaloHorasService: parseInt(e.target.value) || undefined })}
                                            className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                        Horómetro Inicial (Opcional - hs)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="0.0"
                                        value={eqForm.horometroActual ?? 0}
                                        onChange={(e) => setEqForm({ ...eqForm, horometroActual: parseFloat(e.target.value) || 0 })}
                                        className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                    />
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
