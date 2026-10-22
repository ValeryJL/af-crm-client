import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { ServiceDto } from '../api/crm';
import { Wrench, MapPin, Search, ArrowUpRight, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Services() {
    const [services, setServices] = useState<ServiceDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const res = await crmApi.getServices();
            setServices(res.data);
        } catch (e) {
            console.error('Error fetching services:', e);
        } finally {
            setLoading(false);
        }
    };

    const filtered = services.filter(s => 
        s.nombre.toLowerCase().includes(query.toLowerCase()) ||
        (s.clientRazonSocial && s.clientRazonSocial.toLowerCase().includes(query.toLowerCase())) ||
        s.direccionFisica.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                    Sedes & Contratos de Servicios
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Control de frecuencias preventivas, cumplimiento de SLA y parque de maquinaria instalada.
                </p>
            </div>

            <div className="flex items-center gap-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 p-3 rounded-2xl">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar por Sede, Cliente o Dirección..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400"
                />
            </div>

            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-3xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="py-16 text-center text-sm text-slate-400">Cargando servicios y contratos...</div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No se encontraron servicios</h3>
                        <p className="text-xs text-slate-400 mt-1">Crea un cliente o añade una sede física para comenzar a operar.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900/40 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-100 dark:border-slate-700/50">
                                <tr>
                                    <th className="px-6 py-4">Sede / Servicio</th>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4">Frecuencia</th>
                                    <th className="px-6 py-4">Estado SLA</th>
                                    <th className="px-6 py-4">Próx. Visita Límite</th>
                                    <th className="px-6 py-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {filtered.map((service) => {
                                    const isOverdue = service.slaStatus === 'OVERDUE';
                                    const isUpcoming = service.slaStatus === 'UPCOMING';
                                    return (
                                        <tr 
                                            key={service.id}
                                            onClick={() => navigate(`/services/${service.id}`)}
                                            className="hover:bg-slate-50/60 dark:hover:bg-slate-700/20 cursor-pointer transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800 dark:text-slate-100">{service.nombre}</div>
                                                <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="w-3 h-3" />
                                                    <span>{service.direccionFisica}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">
                                                {service.clientRazonSocial}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs">
                                                    {service.frecuenciaVisita}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${
                                                    isOverdue 
                                                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' 
                                                        : isUpcoming 
                                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' 
                                                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                }`}>
                                                    {service.slaStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-semibold">
                                                <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600 dark:text-slate-300'}>
                                                    {service.fechaProximaVisitaLimite || 'No agendada'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
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
        </div>
    );
}
