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
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg sm:text-xl font-heading font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                        Cartera de Clientes Industriales (360°)
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Empresas vinculadas, contratos de mantenimiento electromecánico y parques de equipos.
                    </p>
                </div>
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-none font-bold text-xs shadow-2xs transition-all self-start sm:self-auto"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nuevo Cliente</span>
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-2.5 bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] px-3 py-2 rounded-none shadow-2xs">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Filtrar por Razón Social o CUIT/RUT..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none overflow-hidden shadow-2xs">
                {loading ? (
                    <div className="py-12 text-center text-xs text-slate-400">Cargando empresas clientes...</div>
                ) : filtered.length === 0 ? (
                    <div className="py-12 text-center">
                        <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">Sin Clientes Registrados</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Comienza dando de alta una empresa para asignar sedes y maquinaria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#2d3033] dark:bg-[#18191b] text-slate-200 uppercase text-[10px] font-bold border-b border-[#3f4246] dark:border-[#2a2c2e]">
                                <tr>
                                    <th className="px-4 py-2.5">Razón Social / CUIT</th>
                                    <th className="px-4 py-2.5">Fiscal / Contacto</th>
                                    <th className="px-4 py-2.5">Sedes</th>
                                    <th className="px-4 py-2.5">Equipos</th>
                                    <th className="px-4 py-2.5 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-[#2a2c2e]">
                                {filtered.map((client) => (
                                    <tr 
                                        key={client.id}
                                        onClick={() => navigate(`/clients/${client.id}`)}
                                        className="hover:bg-slate-100/70 dark:hover:bg-white/5 cursor-pointer transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{client.razonSocial}</div>
                                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{client.cuitRut || 'Sin CUIT'}</div>
                                        </td>
                                        <td className="px-4 py-3 space-y-0.5">
                                            <div className="font-semibold text-slate-700 dark:text-slate-300">{client.condicionFiscal || 'N/A'}</div>
                                            {client.telefonoGeneral && (
                                                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                                                    <Phone className="w-3 h-3 text-slate-400" />
                                                    <span>{client.telefonoGeneral}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-[#141517] text-slate-800 dark:text-slate-200 font-bold rounded-none text-[11px] border border-slate-300 dark:border-[#333639]">
                                                {client.totalServicios || 0} sedes
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-[#141517] text-slate-800 dark:text-slate-200 font-bold rounded-none text-[11px] border border-slate-300 dark:border-[#333639]">
                                                {client.totalEquipos || 0} equipos
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white">
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
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setDrawerOpen(false)}
                    />
                    <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                        <div className="w-screen max-w-md bg-white dark:bg-[#1e2022] shadow-2xl flex flex-col border-l border-slate-300 dark:border-[#333639]">
                            <div className="p-4 border-b border-slate-300 dark:border-[#333639] bg-[#2d3033] text-white flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-amber-400" />
                                    <h2 className="text-sm font-heading font-black uppercase text-white">Nuevo Cliente B2B</h2>
                                </div>
                                <button onClick={() => setDrawerOpen(false)} className="p-1 text-slate-300 hover:text-white rounded-none">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateClient} className="p-4 space-y-3.5 flex-1 overflow-y-auto">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Razón Social *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: Cervecería Quilmes S.A."
                                        value={formData.razonSocial}
                                        onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                                        className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            CUIT / RUT
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="30-12345678-9"
                                            value={formData.cuitRut}
                                            onChange={(e) => setFormData({ ...formData, cuitRut: e.target.value })}
                                            className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Condición Fiscal
                                        </label>
                                        <select
                                            value={formData.condicionFiscal}
                                            onChange={(e) => setFormData({ ...formData, condicionFiscal: e.target.value })}
                                            className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
                                        >
                                            <option value="Responsable Inscripto">Resp. Inscripto</option>
                                            <option value="Monotributo">Monotributo</option>
                                            <option value="Exento">Exento</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Dirección Fiscal
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Av. 12 de Octubre 100, Quilmes"
                                        value={formData.direccionFiscal}
                                        onChange={(e) => setFormData({ ...formData, direccionFiscal: e.target.value })}
                                        className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Teléfono
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="+54 11 4444-5555"
                                            value={formData.telefonoGeneral}
                                            onChange={(e) => setFormData({ ...formData, telefonoGeneral: e.target.value })}
                                            className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Email Comercial
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="contacto@empresa.com"
                                            value={formData.emailComercial}
                                            onChange={(e) => setFormData({ ...formData, emailComercial: e.target.value })}
                                            className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Observaciones de Acceso / Requisitos
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Ingreso con seguro de vida y EPP obligatorio..."
                                        value={formData.notas}
                                        onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                        className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
                                    />
                                </div>

                                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-300 dark:border-[#333639]">
                                    <button
                                        type="button"
                                        onClick={() => setDrawerOpen(false)}
                                        className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-none"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-none shadow-2xs"
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
