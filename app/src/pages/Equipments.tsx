import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { EquipmentDto } from '../api/crm';
import { HardHat, Search, ArrowUpRight, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Equipments() {
    const [equipments, setEquipments] = useState<EquipmentDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchEquipments();
    }, []);

    const fetchEquipments = async () => {
        try {
            setLoading(true);
            const res = await crmApi.getEquipments();
            setEquipments(res.data);
        } catch (e) {
            console.error('Error fetching equipments:', e);
        } finally {
            setLoading(false);
        }
    };

    const filtered = equipments.filter(e => 
        e.nombre.toLowerCase().includes(query.toLowerCase()) ||
        (e.marca && e.marca.toLowerCase().includes(query.toLowerCase())) ||
        (e.modelo && e.modelo.toLowerCase().includes(query.toLowerCase())) ||
        (e.clientRazonSocial && e.clientRazonSocial.toLowerCase().includes(query.toLowerCase()))
    );

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Header Industrial */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-300 dark:border-[#333639]">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-6 bg-amber-500 inline-block"></span>
                        <h1 className="text-xl sm:text-2xl font-heading font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase">
                            Inventario de Equipos & Ficha Técnica JSONB
                        </h1>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-4.5">
                        Parque de grupos electrógenos, maquinaria pesada, control de horómetros y consumibles críticos.
                    </p>
                </div>
            </div>

            {/* Buscador Angular */}
            <div className="flex items-center gap-3 bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] p-2.5 rounded-none shadow-xs">
                <Search className="w-4 h-4 text-slate-400 ml-1" />
                <input
                    type="text"
                    placeholder="Buscar por equipo, marca, modelo o cliente..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400 font-sans"
                />
            </div>

            {/* Tabla Angular Industrial */}
            <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none overflow-hidden shadow-xs">
                {loading ? (
                    <div className="py-16 text-center text-xs font-mono text-slate-400 uppercase tracking-widest">
                        Cargando parque de equipos electromecánicos...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <HardHat className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                        <h3 className="text-sm font-heading font-bold text-slate-700 dark:text-slate-200 uppercase">
                            No hay equipos registrados
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Ingresa a una sede de servicio para asociar nueva maquinaria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#f1f3f5] dark:bg-[#141517] text-slate-500 dark:text-slate-400 uppercase text-[10px] font-heading font-bold border-b border-slate-300 dark:border-[#333639] tracking-wider">
                                <tr>
                                    <th className="px-5 py-3">Equipo / Marca / S/N</th>
                                    <th className="px-5 py-3">Sede / Cliente</th>
                                    <th className="px-5 py-3 text-center">Horómetro</th>
                                    <th className="px-5 py-3">Ficha Técnica JSONB</th>
                                    <th className="px-5 py-3 text-center">Partes Críticas</th>
                                    <th className="px-5 py-3 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-[#333639]">
                                {filtered.map((eq) => (
                                    <tr 
                                        key={eq.id}
                                        onClick={() => navigate(`/equipments/${eq.id}`)}
                                        className="hover:bg-slate-100 dark:hover:bg-[#282a2d] cursor-pointer transition-colors"
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">{eq.nombre}</div>
                                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                                {eq.marca} {eq.modelo} — S/N: {eq.numeroSerie || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">{eq.serviceNombre}</div>
                                            <div className="text-[11px] text-slate-400">{eq.clientRazonSocial}</div>
                                        </td>
                                        <td className="px-5 py-3.5 text-center font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
                                            {eq.horometroActual || 0} hs
                                        </td>
                                        <td className="px-5 py-3.5 text-xs">
                                            {eq.specs && Object.keys(eq.specs).length > 0 ? (
                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-[#141517] text-slate-700 dark:text-slate-300 rounded-none font-mono text-[10px] border border-slate-300 dark:border-[#333639]">
                                                    {Object.keys(eq.specs).length} atributos JSONB
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 font-mono text-[11px]">Sin specs</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-center font-mono font-semibold text-slate-600 dark:text-slate-300 text-xs">
                                            {eq.parts ? eq.parts.length : 0} items
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <button className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors">
                                                <ArrowUpRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
