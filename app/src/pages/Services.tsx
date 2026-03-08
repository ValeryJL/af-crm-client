import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, MapPin, AlertCircle, X, Loader2, Trash2, ChevronRight, Wrench, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

interface Grupo {
    id: number;
    nombre: string;
}

interface Service {
    id: number;
    cliente: string;
    nombre: string; // Used for identifying the service/contract name
    equipo: string; // Specific equipment details
    direccion: string;
    frecuencia: 'Mensual' | 'Semanal' | 'Quincenal' | 'EVENTUAL';
    observaciones?: string;
    fechaInicio: string;
    fechaFin: string;
    serviceToggle?: boolean;
    fechaPrimerService?: string;
    baja?: string | null;
    grupos?: Grupo | null;
}

export function Services() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterFrequency, setFilterFrequency] = useState('all');
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    // Form State
    const [formData, setFormData] = useState({
        cliente: '',
        nombre: '',
        equipo: '',
        direccion: '',
        frecuencia: 'Mensual' as Service['frecuencia'],
        observaciones: '',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        serviceToggle: false,
        fechaPrimerService: ''
    });

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/services');
            setServices(response.data);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching services:', err);
            setError(err.response?.data?.message || 'Failed to connect to the server.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleCreateOrUpdateService = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                frecuencia: formData.frecuencia.toLowerCase(),
                // Send null instead of empty string so backend does not try to parse it
                fechaPrimerService: formData.fechaPrimerService || null
            };
            if (editingServiceId) {
                await apiClient.put(`/services/${editingServiceId}`, payload);
            } else {
                await apiClient.post('/services', payload);
            }
            setIsModalOpen(false);
            setEditingServiceId(null);
            setFormData({
                cliente: '',
                nombre: '',
                equipo: '',
                direccion: '',
                frecuencia: 'Mensual',
                observaciones: '',
                fechaInicio: new Date().toISOString().split('T')[0],
                fechaFin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                serviceToggle: false,
                fechaPrimerService: ''
            });
            fetchServices(); // Refetch table
        } catch (err: any) {
            console.error('Failed to save service', err);
            alert(err.response?.data?.message || 'Failed to save service.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredServices = services.filter(svc => {
        const matchesSearch =
            svc.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            svc.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            svc.direccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            svc.equipo?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFrequency = filterFrequency === 'all' || svc.frecuencia === filterFrequency;

        return matchesSearch && matchesFrequency;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Services & Contracts</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage generator maintenance schedules</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => {
                            setEditingServiceId(null);
                            setFormData({
                                cliente: '',
                                nombre: '',
                                equipo: '',
                                direccion: '',
                                frecuencia: 'Mensual',
                                observaciones: '',
                                fechaInicio: new Date().toISOString().split('T')[0],
                                fechaFin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                                serviceToggle: false,
                                fechaPrimerService: ''
                            });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto">
                        <Plus size={20} />
                        <span>New Service Request</span>
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500 focus:border-transparent transition-shadow"
                        />
                    </div>
                    {/* Filters */}
                    <div className="flex gap-2 w-full sm:w-auto">
                        <select
                            value={filterFrequency}
                            onChange={(e) => setFilterFrequency(e.target.value)}
                            className="flex-1 sm:w-auto border border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500"
                        >
                            <option value="all">Frequency: All</option>
                            <option value="Semanal">Semanal</option>
                            <option value="Quincenal">Quincenal</option>
                            <option value="Mensual">Mensual</option>
                            <option value="EVENTUAL">EVENTUAL</option>
                        </select>
                    </div>
                </div>

                <div className="min-h-[300px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                            <p>Loading services...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center p-12 text-rose-500">
                            <AlertCircle size={32} className="mb-2 opacity-50" />
                            <p className="font-medium text-center">{error}</p>
                        </div>
                    ) : services.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-16 text-slate-400">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                                <Plus size={24} className="text-slate-300" />
                            </div>
                            <p className="font-medium text-slate-600 text-lg">No services found.</p>
                            <p className="text-sm mt-1">Create a new service contract to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {filteredServices.map((svc) => (
                                <div
                                    key={svc.id}
                                    onClick={() => navigate(`/services/${svc.id}`)}
                                    className="cursor-pointer border rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col gap-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{svc.cliente || 'Unknown Client'}</h3>
                                            <p className="text-sm text-slate-500 mt-0.5">{svc.nombre}</p>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0 mt-1" />
                                    </div>

                                    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 flex-1 font-medium bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <Wrench size={16} className="text-indigo-400 shrink-0" />
                                            <span className="truncate">{svc.equipo || 'Unspecified Equipment'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar size={16} className="text-sky-400 shrink-0" />
                                            <span className="capitalize">{svc.frecuencia || 'Unscheduled'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MapPin size={16} className="text-amber-400 shrink-0" />
                                            <span className="truncate">{svc.direccion || 'Unspecified Location'}</span>
                                        </div>
                                        <div className="pt-2 mt-1 border-t border-slate-200/50 dark:border-slate-600/50 flex items-center gap-2">
                                            <Clock size={14} className="text-slate-400" />
                                            <span className="text-xs text-slate-400">{new Date(svc.fechaInicio).toLocaleDateString()} → {new Date(svc.fechaFin).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {isAdmin && (
                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this service?')) apiClient.delete(`/services/${svc.id}`).then(fetchServices); }}
                                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                                title="Delete Service"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* New Service Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">{editingServiceId ? 'Edit Service Contract' : 'New Service Contract'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="close-btn">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateOrUpdateService} className="flex flex-col h-full overflow-hidden">
                            <div className="modal-body space-y-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="form-label">Company/Client <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.cliente}
                                            onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                                            className="form-input"
                                            placeholder="AF-CRM Corp / John Doe"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="form-label">Service Title <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                            className="form-input"
                                            placeholder="Annual Maintenance Contract"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="form-label">Equipment Details <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.equipo}
                                        onChange={(e) => setFormData({ ...formData, equipo: e.target.value })}
                                        className="form-input"
                                        placeholder="Fire Alarm Model X / Electrogen Grupo Model Y"
                                    />
                                </div>

                                <div>
                                    <label className="form-label">Service Address <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.direccion}
                                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                        className="form-input"
                                        placeholder="Av. Corrientes 1234, CABA"
                                    />
                                </div>

                                <div>
                                    <label className="form-label">Frequency <span className="text-rose-500">*</span></label>
                                    <select
                                        required
                                        value={formData.frecuencia}
                                        onChange={(e) => setFormData({ ...formData, frecuencia: e.target.value as Service['frecuencia'] })}
                                        className="form-select"
                                    >
                                        <option value="Mensual">Mensual</option>
                                        <option value="Semanal">Semanal</option>
                                        <option value="Quincenal">Quincenal (15 days)</option>
                                        <option value="EVENTUAL">EVENTUAL</option>
                                    </select>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="form-label">Start Date <span className="text-rose-500">*</span></label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.fechaInicio}
                                            onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="form-label">End Date <span className="text-rose-500">*</span></label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.fechaFin}
                                            onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100/50 dark:border-indigo-900/20">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.serviceToggle}
                                            onChange={(e) => setFormData({ ...formData, serviceToggle: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                    </label>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Generate Yearly Service Events</span>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">If enabled, the system will create a special "Service" event once per year on the anniversary.</span>
                                    </div>
                                </div>

                                {formData.serviceToggle && (
                                    <div className="ml-2 pl-4 border-l-2 border-indigo-200 dark:border-indigo-700">
                                        <label className="form-label">
                                            First Service Date <span className="text-slate-400 font-normal">(optional)</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.fechaPrimerService}
                                            min={formData.fechaInicio}
                                            max={formData.fechaFin}
                                            onChange={(e) => setFormData({ ...formData, fechaPrimerService: e.target.value })}
                                            className="form-input"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1 italic">
                                            If empty, the first yearly service will be created 1 year from the start date. Subsequent services repeat annually until the end date.
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="form-label">Observations</label>
                                    <textarea
                                        rows={2}
                                        value={formData.observaciones}
                                        onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                        className="form-textarea resize-none"
                                        placeholder="Gate access code, special requirements..."
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex items-center gap-2">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                    <span>{editingServiceId ? 'Update Service' : 'Create Service'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
