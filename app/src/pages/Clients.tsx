import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { ClientDto } from '../api/crm';
import { Building2, Plus, Search, MapPin, Phone, Mail, ArrowUpRight, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Clients() {
    const [clients, setClients] = useState<ClientDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<ClientDto>>({
        razonSocial: '',
        cuitRut: '',
        condicionFiscal: 'Responsable Inscripto',
        direccionFiscal: '',
        telefonoGeneral: '',
        emailComercial: '',
        notas: '',
    });
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const res = await crmApi.getClients();
            setClients(res.data);
        } catch (e) {
            console.error('Error fetching clients:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.razonSocial) return;

        try {
            setSaving(true);
            await crmApi.createClient(formData as ClientDto);
            setDrawerOpen(false);
            setFormData({
                razonSocial: '',
                cuitRut: '',
                condicionFiscal: 'Responsable Inscripto',
                direccionFiscal: '',
                telefonoGeneral: '',
                emailComercial: '',
                notas: '',
            });
            fetchClients();
        } catch (e) {
            console.error('Error creating client:', e);
        } finally {
            setSaving(false);
        }
    };

    const filtered = clients.filter(c => 
        c.razonSocial.toLowerCase().includes(query.toLowerCase()) ||
        (c.cuitRut && c.cuitRut.includes(query))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                        Gestión de Clientes (Visión 360°)
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Empresas, contratos de servicio asociados y sus respectivos equipos instalados.
                    </p>
                </div>
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Cliente</span>
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 p-3 rounded-2xl">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar por Razón Social o CUIT/RUT..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-3xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="py-16 text-center text-sm text-slate-400">Cargando cartera de clientes...</div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No hay clientes registrados</h3>
                        <p className="text-xs text-slate-400 mt-1">Empieza dando de alta una empresa para gestionar sus servicios y equipos.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900/40 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-100 dark:border-slate-700/50">
                                <tr>
                                    <th className="px-6 py-4">Razón Social / CUIT</th>
                                    <th className="px-6 py-4">Contacto / Fiscal</th>
                                    <th className="px-6 py-4">Servicios</th>
                                    <th className="px-6 py-4">Equipos</th>
                                    <th className="px-6 py-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {filtered.map((client) => (
                                    <tr 
                                        key={client.id}
                                        onClick={() => navigate(`/clients/${client.id}`)}
                                        className="hover:bg-slate-50/60 dark:hover:bg-slate-700/20 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 dark:text-slate-100">{client.razonSocial}</div>
                                            <div className="text-xs text-slate-400 font-mono mt-0.5">{client.cuitRut || 'Sin CUIT'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 space-y-0.5">
                                            {client.telefonoGeneral && (
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="w-3 h-3 text-slate-400" />
                                                    <span>{client.telefonoGeneral}</span>
                                                </div>
                                            )}
                                            {client.emailComercial && (
                                                <div className="flex items-center gap-1.5">
                                                    <Mail className="w-3 h-3 text-slate-400" />
                                                    <span>{client.emailComercial}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-xs">
                                                {client.totalServicios || 0} servicios
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs">
                                                {client.totalEquipos || 0} equipos
                                            </span>
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

            {/* Slide-over Drawer for Client Creation */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
                    <div 
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setDrawerOpen(false)}
                    />
                    <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                        <div className="w-screen max-w-md bg-white dark:bg-slate-800 shadow-2xl flex flex-col">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-indigo-600" />
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Nuevo Cliente</h2>
                                </div>
                                <button onClick={() => setDrawerOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateClient} className="p-6 space-y-4 flex-1 overflow-y-auto">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                        Razón Social *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: Cervecería Quilmes S.A."
                                        value={formData.razonSocial}
                                        onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                            CUIT / RUT
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="30-12345678-9"
                                            value={formData.cuitRut}
                                            onChange={(e) => setFormData({ ...formData, cuitRut: e.target.value })}
                                            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                            Condición Fiscal
                                        </label>
                                        <select
                                            value={formData.condicionFiscal}
                                            onChange={(e) => setFormData({ ...formData, condicionFiscal: e.target.value })}
                                            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="Responsable Inscripto">Resp. Inscripto</option>
                                            <option value="Monotributo">Monotributo</option>
                                            <option value="Exento">Exento</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                        Dirección Fiscal
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Av. 12 de Octubre 100, Quilmes"
                                        value={formData.direccionFiscal}
                                        onChange={(e) => setFormData({ ...formData, direccionFiscal: e.target.value })}
                                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                            Teléfono
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="+54 11 4444-5555"
                                            value={formData.telefonoGeneral}
                                            onChange={(e) => setFormData({ ...formData, telefonoGeneral: e.target.value })}
                                            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                            Email Comercial
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="contacto@empresa.com"
                                            value={formData.emailComercial}
                                            onChange={(e) => setFormData({ ...formData, emailComercial: e.target.value })}
                                            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                        Notas Internas
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Acceso por guardia lateral, requerir EPP..."
                                        value={formData.notas}
                                        onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-700">
                                    <button
                                        type="button"
                                        onClick={() => setDrawerOpen(false)}
                                        className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                                    >
                                        <Check className="w-4 h-4" />
                                        <span>{saving ? 'Guardando...' : 'Crear Cliente'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
