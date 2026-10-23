import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { ClientDto, ServiceDto } from '../api/crm';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Building2, ArrowLeft, Plus, MapPin, Calendar, Clock, 
    AlertCircle, CheckCircle2, Wrench, HardHat, Phone, Mail, X, Edit3, Check
} from 'lucide-react';

export function ClientDetail() {
    const { id } = useParams<{ id: string }>();
    const [client, setClient] = useState<ClientDto | null>(null);
    const [services, setServices] = useState<ServiceDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewServiceModal, setShowNewServiceModal] = useState(false);
    const [showEditClientModal, setShowEditClientModal] = useState(false);
    const [savingClient, setSavingClient] = useState(false);
    const [clientError, setClientError] = useState<string | null>(null);

    const [clientEditForm, setClientEditForm] = useState<Partial<ClientDto>>({});

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

    const handleOpenEditClient = () => {
        if (!client) return;
        setClientEditForm({
            razonSocial: client.razonSocial || '',
            cuitRut: client.cuitRut || '',
            condicionFiscal: client.condicionFiscal || 'Responsable Inscripto',
            direccionFiscal: client.direccionFiscal || '',
            telefonoGeneral: client.telefonoGeneral || '',
            emailComercial: client.emailComercial || '',
            notas: client.notas || '',
            activo: client.activo ?? true
        });
        setClientError(null);
        setShowEditClientModal(true);
    };

    const handleSaveClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!client || !clientEditForm.razonSocial) return;

        try {
            setSavingClient(true);
            setClientError(null);
            await crmApi.updateClient(client.id!, clientEditForm as ClientDto);
            setShowEditClientModal(false);
            loadData(client.id!);
        } catch (e: any) {
            console.error('Error updating client:', e);
            setClientError(e.response?.data?.message || e.message || 'Error al actualizar el cliente');
        } finally {
            setSavingClient(false);
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-300 dark:border-[#333639]">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/clients')} 
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-200 dark:hover:bg-[#282a2d] rounded-none transition-colors"
                        title="Volver a Clientes"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
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

                <button
                    onClick={handleOpenEditClient}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-[#1e2022] hover:bg-slate-200 dark:hover:bg-[#282a2d] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#333639] rounded-none font-heading font-bold text-xs uppercase tracking-wider transition-colors shadow-xs self-start sm:self-auto"
                >
                    <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Editar Cliente</span>
                </button>
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
                            <span className="block text-2xl font-heading font-black text-slate-800 dark:text-slate-100">{client.totalEquipos || 0}</span>
                            <span className="text-[9px] font-mono uppercase font-bold text-slate-400">Equipos Asignados</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1e2022] p-4 rounded-none border border-slate-300 dark:border-[#333639] shadow-xs space-y-2">
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Observaciones de Acceso</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        {client.notas || 'Sin instrucciones especiales registradas.'}
                    </p>
                </div>
            </div>

            {/* Sedes / Servicios Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#333639]">
                    <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-amber-500" />
                        <h2 className="text-sm font-heading font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                            Sedes Físicas y Puntos de Servicio ({services.length})
                        </h2>
                    </div>
                    <button
                        onClick={() => setShowNewServiceModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-none shadow-xs transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Nueva Sede</span>
                    </button>
                </div>

                {services.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none">
                        <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No hay sedes asociadas a esta empresa cliente.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map((srv) => (
                            <div 
                                key={srv.id}
                                onClick={() => navigate(`/services/${srv.id}`)}
                                className="bg-white dark:bg-[#1e2022] p-4 border border-slate-300 dark:border-[#333639] hover:border-amber-500 dark:hover:border-amber-500 cursor-pointer transition-colors shadow-xs space-y-3"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-sm font-heading font-bold text-slate-800 dark:text-slate-100 uppercase">
                                            {srv.nombre}
                                        </h3>
                                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                                            <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                                            <span>{srv.direccionFisica}</span>
                                        </div>
                                    </div>
                                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-[#141517] border border-slate-300 dark:border-[#333639] text-slate-600 dark:text-slate-300 uppercase">
                                        {srv.frecuenciaVisita}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-[#333639] text-[11px] font-mono">
                                    <div className="text-slate-500">
                                        Última visita: <span className="text-slate-700 dark:text-slate-300 font-bold">{srv.fechaUltimaVisita || 'N/A'}</span>
                                    </div>
                                    <div className="text-slate-500 text-right">
                                        Próx. límite: <span className="text-amber-500 font-bold">
                                            {srv.frecuenciaVisita === 'A_DEMANDA' 
                                                ? 'A Demanda' 
                                                : srv.fechaProximaVisitaLimite 
                                                    ? new Date(srv.fechaProximaVisitaLimite + 'T00:00:00').toLocaleDateString('es-AR')
                                                    : 'Sin programar'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Editar Cliente */}
            {showEditClientModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] w-full max-w-lg shadow-2xl p-6 relative">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-300 dark:border-[#333639] mb-4">
                            <div>
                                <h2 className="text-sm font-heading font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                                    Editar Cliente Industrial
                                </h2>
                                <p className="text-[11px] text-slate-400">Actualiza los datos comerciales y de contacto</p>
                            </div>
                            <button
                                onClick={() => setShowEditClientModal(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveClient} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                    Razón Social *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={clientEditForm.razonSocial || ''}
                                    onChange={(e) => setClientEditForm({ ...clientEditForm, razonSocial: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                        CUIT / RUT
                                    </label>
                                    <input
                                        type="text"
                                        value={clientEditForm.cuitRut || ''}
                                        onChange={(e) => setClientEditForm({ ...clientEditForm, cuitRut: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                        Condición Fiscal
                                    </label>
                                    <select
                                        value={clientEditForm.condicionFiscal || 'Responsable Inscripto'}
                                        onChange={(e) => setClientEditForm({ ...clientEditForm, condicionFiscal: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                    >
                                        <option value="Responsable Inscripto">Resp. Inscripto</option>
                                        <option value="Monotributo">Monotributo</option>
                                        <option value="Exento">Exento</option>
                                        <option value="Consumidor Final">Cons. Final</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                    Dirección Fiscal
                                </label>
                                <input
                                    type="text"
                                    value={clientEditForm.direccionFiscal || ''}
                                    onChange={(e) => setClientEditForm({ ...clientEditForm, direccionFiscal: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                        Teléfono General
                                    </label>
                                    <input
                                        type="text"
                                        value={clientEditForm.telefonoGeneral || ''}
                                        onChange={(e) => setClientEditForm({ ...clientEditForm, telefonoGeneral: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                        Email Comercial
                                    </label>
                                    <input
                                        type="email"
                                        value={clientEditForm.emailComercial || ''}
                                        onChange={(e) => setClientEditForm({ ...clientEditForm, emailComercial: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                    Observaciones / Requisitos de Acceso
                                </label>
                                <textarea
                                    rows={3}
                                    value={clientEditForm.notas || ''}
                                    onChange={(e) => setClientEditForm({ ...clientEditForm, notas: e.target.value })}
                                    className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                />
                            </div>

                            {clientError && (
                                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{clientError}</span>
                                </div>
                            )}

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-[#333639]">
                                <button
                                    type="button"
                                    onClick={() => setShowEditClientModal(false)}
                                    className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white rounded-none transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingClient}
                                    className="px-4 py-1.5 text-xs font-heading font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-none shadow-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                                >
                                    {savingClient ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Nueva Sede */}
            {showNewServiceModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] w-full max-w-lg shadow-2xl p-6 relative">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-300 dark:border-[#333639] mb-4">
                            <div>
                                <h2 className="text-sm font-heading font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                                    Nueva Sede / Punto de Servicio
                                </h2>
                                <p className="text-[11px] text-slate-400">Asocia una ubicación física a {client.razonSocial}</p>
                            </div>
                            <button
                                onClick={() => setShowNewServiceModal(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateService} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Nombre de la Sede *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Planta Principal / Edificio Central"
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
