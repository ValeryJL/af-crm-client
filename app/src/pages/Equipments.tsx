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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                    Inventario de Equipos & Ficha Técnica JSONB
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Parque de grupos electrógenos, maquinaria, control de horómetros y consumibles críticos.
                </p>
            </div>

            <div className="flex items-center gap-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 p-3 rounded-2xl">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar por Equipo, Marca, Modelo o Cliente..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400"
                />
            </div>

            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-3xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="py-16 text-center text-sm text-slate-400">Cargando parque de equipos...</div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <HardHat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No hay equipos registrados</h3>
                        <p className="text-xs text-slate-400 mt-1">Ingresa a una sede de servicio para asociar nueva maquinaria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900/40 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-100 dark:border-slate-700/50">
                                <tr>
                                    <th className="px-6 py-4">Equipo / Marca</th>
                                    <th className="px-6 py-4">Sede / Cliente</th>
                                    <th className="px-6 py-4">Horómetro</th>
                                    <th className="px-6 py-4">Ficha Técnica JSONB</th>
                                    <th className="px-6 py-4">Partes</th>
                                    <th className="px-6 py-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {filtered.map((eq) => (
                                    <tr 
                                        key={eq.id}
                                        onClick={() => navigate(`/equipments/${eq.id}`)}
                                        className="hover:bg-slate-50/60 dark:hover:bg-slate-700/20 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 dark:text-slate-100">{eq.nombre}</div>
                                            <div className="text-xs text-slate-400">{eq.marca} {eq.modelo} — S/N: {eq.numeroSerie || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-700 dark:text-slate-200">{eq.serviceNombre}</div>
                                            <div className="text-xs text-slate-400">{eq.clientRazonSocial}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
                                            {eq.horometroActual || 0} hs
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            {eq.specs && Object.keys(eq.specs).length > 0 ? (
                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-md font-mono text-[11px]">
                                                    {Object.keys(eq.specs).length} atributos
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">Sin specs</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                            {eq.parts ? eq.parts.length : 0} items
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
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
