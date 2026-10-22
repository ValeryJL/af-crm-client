import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { ClientDto } from '../api/crm';
import { Building2, Plus, Search, Phone, Mail, ArrowUpRight, X, Check } from 'lucide-react';
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                        Cartera de Clientes (Visión 360°)
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Empresas industriales, plantas productivas y contratos de mantenimiento asignados.
                    </p>
                </div>
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs shadow-xs transition-all self-start sm:self-auto"
                >
                    <Plus className="w-3.5 h-3.5 text-sky-400" />
                    <span>Nuevo Cliente</span>
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl shadow-2xs">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Filtrar por Razón Social o CUIT/RUT..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                {loading ? (
                    <div className="py-12 text-center text-xs text-slate-400">Cargando empresas clientes...</div>
                ) : filtered.length === 0 ? (
                    <div className="py-12 text-center">
                        <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No hay clientes registrados</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Comienza creando una empresa para vincular servicios y equipos.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-3">Razón Social / CUIT</th>
                                    <th className="px-5 py-3">Fiscal / Contacto</th>
                                    <th className="px-5 py-3">Sedes</th>
                                    <th className="px-5 py-3">Equipos</th>
                                    <th className="px-5 py-3 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filtered.map((client) => (
                                    <tr 
                                        key={client.id}
                                        onClick={() => navigate(`/clients/${client.id}`)}
                                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{client.razonSocial}</div>
                                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{client.cuitRut || 'Sin CUIT'}</div>
                                        </td>
                                        <td className="px-5 py-3.5 space-y-0.5">
                                            <div className="font-semibold text-slate-700 dark:text-slate-300">{client.condicionFiscal || 'N/A'}</div>
                                            {client.telefonoGeneral && (
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <Phone className="w-3 h-3 text-slate-400" />
                                                    <span>{client.telefonoGeneral}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="px-2.5 py-1 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold rounded text-xs border border-sky-100 dark:border-sky-900/40">
                                                {client.totalServicios || 0} sedes
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded text-xs">
                                                {client.totalEquipos || 0} equipos
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <button className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400">
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
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-2xs"
                        onClick={() => setDrawerOpen(false)}
                    />
                    <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
                            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                                    <h2 className="text-base font-heading font-bold text-slate-900 dark:text-slate-100">Nuevo Cliente B2B</h2>
                                </div>
                                <button onClick={() => setDrawerOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateClient} className="p-5 space-y-4 flex-1 overflow-y-auto">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Razón Social *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: Cervecería Quilmes S.A."
                                        value={formData.razonSocial}
                                        onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            CUIT / RUT
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="30-12345678-9"
                                            value={formData.cuitRut}
                                            onChange={(e) => setFormData({ ...formData, cuitRut: e.target.value })}
                                            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Condición Fiscal
                                        </label>
                                        <select
                                            value={formData.condicionFiscal}
                                            onChange={(e) => setFormData({ ...formData, condicionFiscal: e.target.value })}
                                            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                                        >
                                            <option value="Responsable Inscripto">Resp. Inscripto</option>
                                            <option value="Monotributo">Monotributo</option>
                                            <option value="Exento">Exento</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Dirección Fiscal
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Av. 12 de Octubre 100, Quilmes"
                                        value={formData.direccionFiscal}
                                        onChange={(e) => setFormData({ ...formData, direccionFiscal: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Teléfono
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="+54 11 4444-5555"
                                            value={formData.telefonoGeneral}
                                            onChange={(e) => setFormData({ ...formData, telefonoGeneral: e.target.value })}
                                            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Email Comercial
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="contacto@empresa.com"
                                            value={formData.emailComercial}
                                            onChange={(e) => setFormData({ ...formData, emailComercial: e.target.value })}
                                            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Observaciones de Acceso / Requisitos
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Ingreso con seguro de vida y EPP obligatorio..."
                                        value={formData.notas}
                                        onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>

                                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setDrawerOpen(false)}
                                        className="px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                                    >
                                        <Check className="w-3.5 h-3.5" />
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
