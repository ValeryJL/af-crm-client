import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { ServiceDto } from '../api/crm';
import { Wrench, MapPin, Search, ArrowUpRight, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
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
                        Supervisión de frecuencias preventivas, cumplimiento estricto de SLA y maquinaria vinculada.
                    </p>
                </div>
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
                        <p className="text-xs text-slate-400 mt-1">Crea un cliente o añade una sede física para comenzar a operar.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#f1f3f5] dark:bg-[#141517] text-slate-500 dark:text-slate-400 uppercase text-[10px] font-heading font-bold border-b border-slate-300 dark:border-[#333639] tracking-wider">
                                <tr>
                                    <th className="px-5 py-3">Sede / Servicio</th>
                                    <th className="px-5 py-3">Cliente</th>
                                    <th className="px-5 py-3 text-center">Frecuencia</th>
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
        </div>
    );
}
