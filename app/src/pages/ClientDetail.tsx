import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { ClientDto, ServiceDto } from '../api/crm';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Building2, ArrowLeft, Plus, MapPin, Calendar, Clock, 
    AlertCircle, CheckCircle2, Wrench, HardHat, Phone, Mail, X
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
        return <div className="py-20 text-center text-xs font-mono text-slate-400 uppercase tracking-widest">Cargando vista 360° del cliente...</div>;
    }

    if (!client) {
        return (
            <div className="py-20 text-center">
                <p className="text-slate-400 text-xs">Cliente no encontrado</p>
                <button onClick={() => navigate('/clients')} className="mt-3 text-amber-500 font-bold text-xs uppercase">
                    Volver al listado
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Navigation / Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-300 dark:border-[#333639]">
                <button 
                    onClick={() => navigate('/clients')} 
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-200 dark:hover:bg-[#282a2d] rounded-none transition-colors"
                    title="Volver a Clientes"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="w-2.5 h-6 bg-amber-500 inline-block"></span>
                        <h1 className="text-xl sm:text-2xl font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                            {client.razonSocial}
                        </h1>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-none bg-amber-500/10 text-amber-500 border border-amber-500/30">
                            {client.cuitRut || 'CUIT no asignado'}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 pl-4.5 font-mono">{client.direccionFiscal || 'Sin dirección fiscal registrada'}</p>
                </div>
            </div>

            {/* Client Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-[#1e2022] p-4 rounded-none border border-slate-300 dark:border-[#333639] shadow-xs space-y-2">
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Datos Fiscales & Contacto</h3>
                    <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                        <div><strong className="text-slate-700 dark:text-slate-200">Condición Fiscal:</strong> {client.condicionFiscal || 'N/A'}</div>
                        <div><strong className="text-slate-700 dark:text-slate-200">Teléfono:</strong> {client.telefonoGeneral || 'N/A'}</div>
                        <div><strong className="text-slate-700 dark:text-slate-200">Email:</strong> {client.emailComercial || 'N/A'}</div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1e2022] p-4 rounded-none border border-slate-300 dark:border-[#333639] shadow-xs space-y-2">
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Resumen Operativo</h3>
                    <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2.5 bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#333639]">
                            <span className="block text-2xl font-heading font-black text-amber-500">{services.length}</span>
                            <span className="text-[9px] font-mono uppercase font-bold text-slate-400">Sedes Activas</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#333639]">
                            <span className="block text-2xl font-heading font-black text-slate-800 dark:text-slate-100">
                                {services.reduce((acc, s) => acc + (s.totalEquipos || 0), 0)}
                            </span>
                            <span className="text-[9px] font-mono uppercase font-bold text-slate-400">Equipos Totales</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1e2022] p-4 rounded-none border border-slate-300 dark:border-[#333639] shadow-xs space-y-2">
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Notas de Cuenta</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        {client.notas || 'Sin observaciones registradas.'}
                    </p>
                </div>
            </div>

            {/* Services / Locations Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#333639]">
                    <div>
                        <h2 className="text-sm font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                            Sedes & Contratos de Servicio ({services.length})
                        </h2>
                        <p className="text-xs text-slate-400">Sedes físicas vinculadas, periodicidad preventiva y estatus SLA.</p>
                    </div>
                    <button
                        onClick={() => setShowNewServiceModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-none font-heading font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
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
                                className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] p-4 rounded-none shadow-xs hover:border-amber-500 dark:hover:border-amber-500 cursor-pointer transition-colors space-y-3"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-heading font-bold text-slate-800 dark:text-slate-100 text-sm">
                                                {service.nombre}
                                            </h3>
                                            <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-none border ${
                                                isOverdue 
                                                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
                                                    : isUpcoming 
                                                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                                                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                            }`}>
                                                {service.slaStatus}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                                            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                            <span className="truncate">{service.direccionFisica}</span>
                                        </div>
                                    </div>

                                    <div className="p-2 bg-slate-100 dark:bg-[#141517] text-slate-400 border border-slate-300 dark:border-[#333639]">
                                        <Wrench className="w-4 h-4" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-[#333639]">
                                    <div>
                                        <span className="block text-[10px] font-mono uppercase font-bold text-slate-400">Frecuencia:</span>
                                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{service.frecuenciaVisita}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-mono uppercase font-bold text-slate-400">Próx. Visita Límite:</span>
                                        <span className={`font-mono font-semibold ${isOverdue ? 'text-rose-500 font-bold' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {service.fechaProximaVisitaLimite || 'No programada'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {services.length === 0 && (
                        <div className="col-span-full py-8 text-center text-xs text-slate-400 bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639]">
                            No hay sedes operativas registradas para este cliente.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Crear Servicio */}
            {showNewServiceModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none max-w-md w-full p-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#333639]">
                            <h3 className="text-sm font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                                Añadir Sede a {client.razonSocial}
                            </h3>
                            <button onClick={() => setShowNewServiceModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateService} className="mt-4 space-y-3">
                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Nombre / Identificador Sede *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Planta Principal / Nave 2"
                                    value={serviceForm.nombre}
                                    onChange={(e) => setServiceForm({ ...serviceForm, nombre: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Dirección Física de Instalación *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Calle 123, Parque Industrial"
                                    value={serviceForm.direccionFisica}
                                    onChange={(e) => setServiceForm({ ...serviceForm, direccionFisica: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Periodicidad Preventiva</label>
                                    <select
                                        value={serviceForm.frecuenciaVisita}
                                        onChange={(e) => setServiceForm({ ...serviceForm, frecuenciaVisita: e.target.value as any })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
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
                                        value={serviceForm.diasAvisoAlerta}
                                        onChange={(e) => setServiceForm({ ...serviceForm, diasAvisoAlerta: parseInt(e.target.value) })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-[#333639]">
                                <button
                                    type="button"
                                    onClick={() => setShowNewServiceModal(false)}
                                    className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white rounded-none transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 text-xs font-heading font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-none shadow-xs uppercase tracking-wider transition-colors"
                                >
                                    Crear Sede
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
