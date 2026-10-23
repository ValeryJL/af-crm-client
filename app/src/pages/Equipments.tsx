import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crm';
import type { EquipmentDto, ServiceDto } from '../api/crm';
import { HardHat, Search, ArrowUpRight, Plus, X, AlertCircle, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EquipmentSpecsBuilder } from '../components/EquipmentSpecsBuilder';

export function Equipments() {
    const [equipments, setEquipments] = useState<EquipmentDto[]>([]);
    const [services, setServices] = useState<ServiceDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<EquipmentDto | null>(null);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [form, setForm] = useState<Partial<EquipmentDto>>({
        nombre: '',
        marca: '',
        modelo: '',
        numeroSerie: '',
        ubicacion: '',
        serviceId: undefined,
        periodicidadRegular: 'MENSUAL',
        intervaloHorasRegular: 250,
        periodicidadServiceMayor: 'ANUAL',
        intervaloHorasService: 1000,
        horometroActual: 0,
        specs: {}
    });
    const [specsData, setSpecsData] = useState<Record<string, any>>({});
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [eqRes, servRes] = await Promise.all([
                crmApi.getEquipments(),
                crmApi.getServices()
            ]);
            setEquipments(eqRes.data);
            setServices(servRes.data);
            if (servRes.data.length > 0 && !form.serviceId) {
                setForm(prev => ({ ...prev, serviceId: servRes.data[0].id }));
            }
        } catch (e) {
            console.error('Error fetching equipments:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingEquipment(null);
        setErrorMsg(null);
        setForm({
            nombre: '',
            marca: '',
            modelo: '',
            numeroSerie: '',
            ubicacion: '',
            serviceId: services[0]?.id,
            periodicidadRegular: 'MENSUAL',
            intervaloHorasRegular: 250,
            periodicidadServiceMayor: 'ANUAL',
            intervaloHorasService: 1000,
            horometroActual: 0,
            specs: {}
        });
        setSpecsData({});
        setShowModal(true);
    };

    const handleOpenEdit = (eq: EquipmentDto, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingEquipment(eq);
        setErrorMsg(null);
        setForm({
            nombre: eq.nombre || '',
            marca: eq.marca || '',
            modelo: eq.modelo || '',
            numeroSerie: eq.numeroSerie || '',
            ubicacion: eq.ubicacion || '',
            serviceId: eq.serviceId,
            periodicidadRegular: eq.periodicidadRegular || 'MENSUAL',
            intervaloHorasRegular: eq.intervaloHorasRegular || 250,
            periodicidadServiceMayor: eq.periodicidadServiceMayor || 'ANUAL',
            intervaloHorasService: eq.intervaloHorasService || 1000,
            horometroActual: eq.horometroActual || 0,
            specs: eq.specs || {}
        });
        setSpecsData(eq.specs || {});
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.serviceId || !form.nombre) return;
        setErrorMsg(null);

        try {
            setSaving(true);
            if (editingEquipment && editingEquipment.id) {
                await crmApi.updateEquipment(editingEquipment.id, {
                    ...form,
                    specs: specsData
                } as EquipmentDto);
            } else {
                await crmApi.createEquipment({
                    ...form,
                    specs: specsData
                } as EquipmentDto);
            }
            setShowModal(false);
            setEditingEquipment(null);
            loadData();
        } catch (e: any) {
            console.error('Error saving equipment:', e);
            setErrorMsg(e.response?.data?.message || e.message || 'Error al guardar el equipo');
        } finally {
            setSaving(false);
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
                            Inventario de Equipos Electromecánicos
                        </h1>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-4.5">
                        Parque de grupos electrógenos, maquinaria pesada, periodicidades técnicas y consumibles críticos.
                    </p>
                </div>

                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-none font-heading font-bold text-xs uppercase tracking-wider transition-colors shadow-xs self-start sm:self-auto"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nuevo Equipo</span>
                </button>
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
                        <p className="text-xs text-slate-400 mt-1">Registra nueva maquinaria para comenzar su control preventivo.</p>
                        <button
                            onClick={handleOpenCreate}
                            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-none"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Crear Primer Equipo</span>
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#f1f3f5] dark:bg-[#141517] text-slate-500 dark:text-slate-400 uppercase text-[10px] font-heading font-bold border-b border-slate-300 dark:border-[#333639] tracking-wider">
                                <tr>
                                    <th className="px-5 py-3">Equipo / Marca / S/N</th>
                                    <th className="px-5 py-3">Sede / Cliente</th>
                                    <th className="px-5 py-3">Periodicidad Preventiva</th>
                                    <th className="px-5 py-3 text-center">Horómetro</th>
                                    <th className="px-5 py-3">Parámetros Dinámicos</th>
                                    <th className="px-5 py-3 text-center">Partes Críticas</th>
                                    <th className="px-5 py-3 text-right">Acciones</th>
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
                                        <td className="px-5 py-3.5">
                                            <span className="font-mono font-bold text-amber-500 text-[11px] block">
                                                {eq.periodicidadRegular || 'MENSUAL'}
                                                {eq.intervaloHorasRegular ? ` (${eq.intervaloHorasRegular} hs)` : ''}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-mono block">
                                                Mayor: {eq.periodicidadServiceMayor || 'ANUAL'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-center font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
                                            {eq.horometroActual || 0} hs
                                        </td>
                                        <td className="px-5 py-3.5 text-xs">
                                            {eq.specs && Object.keys(eq.specs).length > 0 ? (
                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-[#141517] text-slate-700 dark:text-slate-300 rounded-none font-mono text-[10px] border border-slate-300 dark:border-[#333639]">
                                                    {Object.keys(eq.specs).length} parámetros
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 font-mono text-[11px]">Sin parámetros</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-center font-mono font-semibold text-slate-600 dark:text-slate-300 text-xs">
                                            {eq.parts ? eq.parts.length : 0} items
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={(e) => handleOpenEdit(eq, e)}
                                                    className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-slate-200 dark:hover:bg-[#282a2d] transition-colors"
                                                    title="Editar Equipo"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors"
                                                    title="Ver Ficha Técnica"
                                                >
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Crear / Editar Equipo */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] w-full max-w-2xl shadow-2xl p-6 relative">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-300 dark:border-[#333639] mb-4">
                            <div>
                                <h2 className="text-sm font-heading font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                                    {editingEquipment ? 'Editar Equipo Electromecánico' : 'Alta de Nuevo Equipo Electromecánico'}
                                </h2>
                                <p className="text-[11px] text-slate-400">
                                    {editingEquipment ? 'Modifica los datos nominales, periodicidades y parámetros técnicos' : 'Asocia un activo industrial a una sede física de cliente'}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                    Sede Física de Destino *
                                </label>
                                <select
                                    required
                                    value={form.serviceId || ''}
                                    onChange={(e) => setForm({ ...form, serviceId: parseInt(e.target.value) })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-bold"
                                >
                                    <option value="" disabled>Selecciona una sede / servicio</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.nombre} ({s.clientRazonSocial})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                    Nombre Identificador del Equipo *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="ej. Grupo Cummins 150 kVA Sala Bombas"
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Marca</label>
                                    <input
                                        type="text"
                                        placeholder="Cummins / Scania"
                                        value={form.marca || ''}
                                        onChange={(e) => setForm({ ...form, marca: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Modelo</label>
                                    <input
                                        type="text"
                                        placeholder="C150 D5"
                                        value={form.modelo || ''}
                                        onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">N° de Serie</label>
                                    <input
                                        type="text"
                                        placeholder="SN-998823"
                                        value={form.numeroSerie || ''}
                                        onChange={(e) => setForm({ ...form, numeroSerie: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                    />
                                </div>
                            </div>

                            {/* Periodicidades de Mantenimiento Preventivo y Mayor */}
                            <div className="p-3 bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#333639] space-y-3">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500 block">
                                    Configuración de Periodicidades de Servicio
                                </span>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                            Periodicidad Regular (Rutina)
                                        </label>
                                        <select
                                            value={form.periodicidadRegular || 'MENSUAL'}
                                            onChange={(e) => setForm({ ...form, periodicidadRegular: e.target.value })}
                                            className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                        >
                                            <option value="SEMANAL">Semanal</option>
                                            <option value="QUINCENAL">Quincenal</option>
                                            <option value="MENSUAL">Mensual</option>
                                            <option value="BIMESTRAL">Bimestral</option>
                                            <option value="TRIMESTRAL">Trimestral</option>
                                            <option value="SEMESTRAL">Semestral</option>
                                            <option value="ANUAL">Anual</option>
                                            <option value="HORAS">Por Horas de Uso</option>
                                            <option value="NINGUNA">Sin Periodicidad</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                            Intervalo Horas Regular
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="250 hs"
                                            value={form.intervaloHorasRegular ?? ''}
                                            onChange={(e) => setForm({ ...form, intervaloHorasRegular: parseInt(e.target.value) || undefined })}
                                            className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                            Periodicidad Service Mayor (Overhaul)
                                        </label>
                                        <select
                                            value={form.periodicidadServiceMayor || 'ANUAL'}
                                            onChange={(e) => setForm({ ...form, periodicidadServiceMayor: e.target.value })}
                                            className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                        >
                                            <option value="ANUAL">Anual</option>
                                            <option value="BIANUAL">Bianual (2 Años)</option>
                                            <option value="HORAS">Por Horas de Uso</option>
                                            <option value="NINGUNA">Sin Service Mayor</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                            Intervalo Horas Service Mayor
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="1000 hs"
                                            value={form.intervaloHorasService ?? ''}
                                            onChange={(e) => setForm({ ...form, intervaloHorasService: parseInt(e.target.value) || undefined })}
                                            className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                            Horómetro Inicial (Opcional - hs)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            placeholder="0.0"
                                            value={form.horometroActual ?? 0}
                                            onChange={(e) => setForm({ ...form, horometroActual: parseFloat(e.target.value) || 0 })}
                                            className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                            Ubicación en Planta
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Sala de transformadores / Patio"
                                            value={form.ubicacion || ''}
                                            onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                                            className="w-full text-xs p-2 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Specs Builder Component */}
                            <EquipmentSpecsBuilder
                                value={specsData}
                                onChange={(specs) => setSpecsData(specs)}
                            />

                            {errorMsg && (
                                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-[#333639]">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white rounded-none transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-1.5 text-xs font-heading font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-none shadow-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Guardando...' : editingEquipment ? 'Guardar Cambios' : 'Crear Equipo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
