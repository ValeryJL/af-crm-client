import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { ClientDto, ServiceDto } from '../api/crm';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Building2, ArrowLeft, Plus, MapPin, Calendar, Clock, 
    AlertCircle, CheckCircle2, Wrench, HardHat, UserPlus, Phone, Mail
} from 'lucide-react';

export function ClientDetail() {
    const { id } = useParams<{ id: string }>();
    const [client, setClient] = useState<ClientDto | null>(null);
    const [services, setServices] = useState<ServiceDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewServiceModal, setShowNewServiceModal] = useState(false);
    const [serviceForm, setServiceForm] = useState<Partial<ServiceDto>>({
        nombre: '',
        direccionFisica: '',
        frecuenciaVisita: 'MENSUAL',
        diasAvisoAlerta: 7,
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            loadData(parseInt(id));
        }
    }, [id]);

    const loadData = async (clientId: number) => {
        try {
            setLoading(true);
            const [clientRes, servicesRes] = await Promise.all([
                crmApi.getClientById(clientId),
                crmApi.getServicesByClient(clientId)
            ]);
            setClient(clientRes.data);
            setServices(servicesRes.data);
        } catch (e) {
            console.error('Error loading client 360 data:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!client || !serviceForm.nombre || !serviceForm.direccionFisica) return;

        try {
            await crmApi.createService({
                ...serviceForm,
                clientId: client.id!,
                frecuenciaVisita: serviceForm.frecuenciaVisita || 'MENSUAL',
            } as ServiceDto);
            setShowNewServiceModal(false);
            setServiceForm({ nombre: '', direccionFisica: '', frecuenciaVisita: 'MENSUAL', diasAvisoAlerta: 7 });
            loadData(client.id!);
        } catch (e) {
            console.error('Error creating service:', e);
        }
    };

    if (loading) {
        return <div className="py-20 text-center text-sm text-slate-400">Cargando vista 360° del cliente...</div>;
    }

    if (!client) {
        return (
            <div className="py-20 text-center">
                <p className="text-slate-500">Cliente no encontrado</p>
                <button onClick={() => navigate('/clients')} className="mt-3 text-indigo-600 font-bold text-sm">
                    Volver al listado
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Navigation / Header */}
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigate('/clients')} 
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
                            {client.razonSocial}
                        </h1>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                            {client.cuitRut || 'CUIT no asignado'}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{client.direccionFiscal || 'Sin dirección fiscal registrada'}</p>
                </div>
            </div>

            {/* Client Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Datos Fiscales & Contacto</h3>
                    <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                        <div><strong className="text-slate-700 dark:text-slate-200">Condición Fiscal:</strong> {client.condicionFiscal || 'N/A'}</div>
                        <div><strong className="text-slate-700 dark:text-slate-200">Teléfono:</strong> {client.telefonoGeneral || 'N/A'}</div>
                        <div><strong className="text-slate-700 dark:text-slate-200">Email:</strong> {client.emailComercial || 'N/A'}</div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Resumen Operativo</h3>
                    <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl">
                            <span className="block text-2xl font-black text-indigo-600 dark:text-indigo-400">{services.length}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Servicios / Sedes</span>
                        </div>
                        <div className="p-3 bg-slate-100 dark:bg-slate-700/40 rounded-xl">
                            <span className="block text-2xl font-black text-slate-800 dark:text-slate-100">
                                {services.reduce((acc, s) => acc + (s.totalEquipos || 0), 0)}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Equipos Totales</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Notas de Cuenta</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        {client.notas || 'Sin observaciones registradas.'}
                    </p>
                </div>
            </div>

            {/* Services / Locations Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            Sedes & Contratos de Servicio ({services.length})
                        </h2>
                        <p className="text-xs text-slate-400">Sede física, periodicidad de visita y estatus de SLA.</p>
                    </div>
                    <button
                        onClick={() => setShowNewServiceModal(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir Servicio / Sede</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => {
                        const isOverdue = service.slaStatus === 'OVERDUE';
                        const isUpcoming = service.slaStatus === 'UPCOMING';
                        return (
                            <div 
                                key={service.id}
                                onClick={() => navigate(`/services/${service.id}`)}
                                className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 p-5 rounded-2xl shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600/50 cursor-pointer transition-all space-y-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                                                {service.nombre}
                                            </h3>
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                                isOverdue 
                                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' 
                                                    : isUpcoming 
                                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' 
                                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                            }`}>
                                                {service.slaStatus}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span>{service.direccionFisica}</span>
                                        </div>
                                    </div>

                                    <div className="p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-slate-500">
                                        <Wrench className="w-4 h-4" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                                    <div>
                                        <span className="block text-[10px] uppercase font-bold text-slate-400">Frecuencia:</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">{service.frecuenciaVisita}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] uppercase font-bold text-slate-400">Próx. Visita Límite:</span>
                                        <span className={`font-semibold ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {service.fechaProximaVisitaLimite || 'No programada'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal Crear Servicio */}
            {showNewServiceModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            Añadir Nuevo Servicio a {client.razonSocial}
                        </h3>
                        <form onSubmit={handleCreateService} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Nombre / Identificador Sede *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Planta Principal / Nave 2"
                                    value={serviceForm.nombre}
                                    onChange={(e) => setServiceForm({ ...serviceForm, nombre: e.target.value })}
                                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Dirección Física de Instalación *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Calle 123, Parque Industrial"
                                    value={serviceForm.direccionFisica}
                                    onChange={(e) => setServiceForm({ ...serviceForm, direccionFisica: e.target.value })}
                                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Periodicidad Preventiva</label>
                                    <select
                                        value={serviceForm.frecuenciaVisita}
                                        onChange={(e) => setServiceForm({ ...serviceForm, frecuenciaVisita: e.target.value as any })}
                                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
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
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Días Aviso Alerta</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={serviceForm.diasAvisoAlerta}
                                        onChange={(e) => setServiceForm({ ...serviceForm, diasAvisoAlerta: parseInt(e.target.value) })}
                                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowNewServiceModal(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 active:scale-95"
                                >
                                    Crear Servicio
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
