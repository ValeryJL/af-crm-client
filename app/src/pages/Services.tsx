import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { ServiceDto, ClientDto } from '../api/crm';
import { Wrench, MapPin, Search, ArrowUpRight, Plus, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Services() {
    const [services, setServices] = useState<ServiceDto[]>([]);
    const [clients, setClients] = useState<ClientDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [form, setForm] = useState<Partial<ServiceDto>>({
        nombre: '',
        direccionFisica: '',
        localidad: '',
        provincia: '',
        frecuenciaVisita: 'MENSUAL',
        diasAvisoAlerta: 7,
        clientId: undefined,
        notas: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [servRes, clientRes] = await Promise.all([
                crmApi.getServices(),
                crmApi.getClients()
            ]);
            setServices(servRes.data);
            setClients(clientRes.data);
            if (clientRes.data.length > 0 && !form.clientId) {
                setForm(prev => ({ ...prev, clientId: clientRes.data[0].id }));
            }
        } catch (e) {
            console.error('Error fetching services:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.clientId || !form.nombre || !form.direccionFisica) return;
        setErrorMsg(null);

        try {
            setSaving(true);
            await crmApi.createService(form as ServiceDto);
            setShowCreateModal(false);
            setForm({
                nombre: '',
                direccionFisica: '',
                localidad: '',
                provincia: '',
                frecuenciaVisita: 'MENSUAL',
                diasAvisoAlerta: 7,
                clientId: clients[0]?.id,
                notas: ''
            });
            loadData();
        } catch (e: any) {
            console.error('Error creating service:', e);
            setErrorMsg(e.response?.data?.message || e.message || 'Error al guardar la sede');
        } finally {
            setSaving(false);
        }
    };

    const filtered = services.filter(s => 
        s.nombre.toLowerCase().includes(query.toLowerCase()) ||
        (s.clientRazonSocial && s.clientRazonSocial.toLowerCase().includes(query.toLowerCase())) ||
        s.direccionFisica.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Header de Sección Industrial */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-300 dark:border-[#333639]">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-6 bg-amber-500 inline-block"></span>
                        <h1 className="text-xl sm:text-2xl font-heading font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase">
                            Sedes & Contratos de Servicios
                        </h1>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-4.5">
                        Plantas industriales, sedes operativas de clientes y maquinaria asociada.
                    </p>
                </div>

                <button
                    onClick={() => {
                        setErrorMsg(null);
                        setShowCreateModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-none font-heading font-bold text-xs uppercase tracking-wider transition-colors shadow-xs self-start sm:self-auto"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nueva Sede / Servicio</span>
                </button>
            </div>

            {/* Barra de Búsqueda Angular */}
            <div className="flex items-center gap-3 bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] p-2.5 rounded-none shadow-xs">
                <Search className="w-4 h-4 text-slate-400 ml-1" />
                <input
                    type="text"
                    placeholder="Buscar sede por nombre, cliente o dirección física..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400 font-sans"
                />
            </div>

            {/* Tabla Industrial Angular */}
            <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none overflow-hidden shadow-xs">
                {loading ? (
                    <div className="py-16 text-center text-xs font-mono text-slate-400 uppercase tracking-widest">
                        Cargando catálogo de sedes y servicios...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <Wrench className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                        <h3 className="text-sm font-heading font-bold text-slate-700 dark:text-slate-200 uppercase">
                            No se encontraron servicios
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Crea una sede física vinculada a un cliente para comenzar a operar.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-none"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Crear Primera Sede</span>
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#f1f3f5] dark:bg-[#141517] text-slate-500 dark:text-slate-400 uppercase text-[10px] font-heading font-bold border-b border-slate-300 dark:border-[#333639] tracking-wider">
                                <tr>
                                    <th className="px-5 py-3">Sede / Servicio</th>
                                    <th className="px-5 py-3">Cliente</th>
                                    <th className="px-5 py-3 text-center">Frecuencia Base</th>
                                    <th className="px-5 py-3 text-center">Estado SLA</th>
                                    <th className="px-5 py-3">Próx. Visita Límite</th>
                                    <th className="px-5 py-3 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-[#333639]">
                                {filtered.map((service) => {
                                    const isOverdue = service.slaStatus === 'OVERDUE';
                                    const isUpcoming = service.slaStatus === 'UPCOMING';
                                    return (
                                        <tr 
                                            key={service.id}
                                            onClick={() => navigate(`/services/${service.id}`)}
                                            className="hover:bg-slate-100 dark:hover:bg-[#282a2d] cursor-pointer transition-colors"
                                        >
                                            <td className="px-5 py-3.5">
                                                <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                                                    {service.nombre}
                                                </div>
                                                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                                                    <span className="truncate">{service.direccionFisica}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 font-semibold text-slate-700 dark:text-slate-200">
                                                {service.clientRazonSocial}
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-[#141517] text-slate-700 dark:text-slate-300 font-mono font-bold rounded-none text-[10px] border border-slate-300 dark:border-[#333639]">
                                                    {service.frecuenciaVisita}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-none border ${
                                                    isOverdue 
                                                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
                                                        : isUpcoming 
                                                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                                                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                }`}>
                                                    {service.slaStatus}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 font-mono text-xs">
                                                <span className={isOverdue ? 'text-rose-500 font-bold' : 'text-slate-600 dark:text-slate-300'}>
                                                    {service.fechaProximaVisitaLimite || 'No agendada'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <button className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors">
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Crear Sede / Servicio */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none max-w-lg w-full p-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#333639]">
                            <h3 className="text-sm font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                                Crear Nueva Sede / Planta de Cliente
                            </h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateService} className="mt-4 space-y-3">
                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                    Cliente Propietario *
                                </label>
                                <select
                                    required
                                    value={form.clientId || ''}
                                    onChange={(e) => setForm({ ...form, clientId: parseInt(e.target.value) })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                >
                                    <option value="" disabled>Selecciona un cliente</option>
                                    {clients.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.razonSocial} (CUIT: {c.cuitRut || 'S/D'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                    Nombre de la Sede / Planta *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Planta Zárate - Depósito Logístico"
                                    value={form.nombre || ''}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                    Dirección Física de la Planta *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Ruta 9 Km 88, Zárate"
                                    value={form.direccionFisica || ''}
                                    onChange={(e) => setForm({ ...form, direccionFisica: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Localidad</label>
                                    <input
                                        type="text"
                                        placeholder="Zárate"
                                        value={form.localidad || ''}
                                        onChange={(e) => setForm({ ...form, localidad: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Provincia</label>
                                    <input
                                        type="text"
                                        placeholder="Buenos Aires"
                                        value={form.provincia || ''}
                                        onChange={(e) => setForm({ ...form, provincia: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Frecuencia Base</label>
                                    <select
                                        value={form.frecuenciaVisita || 'MENSUAL'}
                                        onChange={(e) => setForm({ ...form, frecuenciaVisita: e.target.value as any })}
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
                                        value={form.diasAvisoAlerta || 7}
                                        onChange={(e) => setForm({ ...form, diasAvisoAlerta: parseInt(e.target.value) || 7 })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                    />
                                </div>
                            </div>

                            {errorMsg && (
                                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-[#333639]">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white rounded-none transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-1.5 text-xs font-heading font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-none shadow-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Guardando...' : 'Crear Sede'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
