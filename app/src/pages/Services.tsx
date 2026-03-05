import { useState, useEffect } from 'react';
import { Plus, Search, Calendar, MapPin, PowerOff, RefreshCw, AlertCircle, X, Loader2, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

interface Grupo {
    id: number;
    nombre: string;
}

interface Service {
    id: number;
    cliente: string;
    nombre: string;
    direccion: string;
    frecuencia: string;
    baja?: string | null;
    grupos?: Grupo | null;
}

export function Services() {
    const [searchTerm, setSearchTerm] = useState('');
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    // Form State
    const [formData, setFormData] = useState({
        cliente: '',
        nombre: '',
        direccion: '',
        frecuencia: 'Mensual',
        observaciones: ''
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
            if (editingServiceId) {
                await apiClient.put(`/services/${editingServiceId}`, formData);
            } else {
                await apiClient.post('/services', formData);
            }
            setIsModalOpen(false);
            setEditingServiceId(null);
            setFormData({
                cliente: '',
                nombre: '',
                direccion: '',
                frecuencia: 'Mensual',
                observaciones: ''
            });
            fetchServices(); // Refetch table
        } catch (err: any) {
            console.error('Failed to save service', err);
            alert(err.response?.data?.message || 'Failed to save service.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (svc: Service) => {
        setEditingServiceId(svc.id);
        setFormData({
            cliente: svc.cliente || '',
            nombre: svc.nombre || '',
            direccion: svc.direccion || '',
            frecuencia: svc.frecuencia || 'Mensual',
            observaciones: ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this service contract?")) return;
        try {
            await apiClient.delete(`/services/${id}`);
            fetchServices();
        } catch (err: any) {
            console.error('Failed to delete service', err);
            alert('Failed to delete service contract.');
        }
    };

    const handleCancelService = async (svc: Service) => {
        if (!window.confirm(`Are you sure you want to cancel the service for ${svc.cliente}? This will stop future scheduling.`)) return;
        try {
            const today = new Date().toISOString().split('T')[0];
            await apiClient.put(`/services/${svc.id}`, {
                ...svc,
                grupos: undefined,
                baja: today
            });
            fetchServices();
        } catch (err: any) {
            console.error('Failed to cancel service', err);
            alert('Failed to cancel service.');
        }
    };

    const handleReactivateService = async (svc: Service) => {
        if (!window.confirm(`Reactivate service for ${svc.cliente}? This will regenerate the scheduling calendar.`)) return;
        try {
            await apiClient.put(`/services/${svc.id}`, {
                ...svc,
                grupos: undefined,
                baja: null
            });
            fetchServices();
        } catch (err: any) {
            console.error('Failed to reactivate service', err);
            alert('Failed to reactivate service.');
        }
    };

    const filteredServices = services.filter(svc =>
        svc.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        svc.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        svc.direccion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                direccion: '',
                                frecuencia: 'Mensual',
                                observaciones: ''
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
                        <select className="flex-1 sm:w-auto border border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500">
                            <option value="all">Frequency: All</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
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
                            {filteredServices.map((svc) => {
                                const isActive = !svc.baja;
                                return (
                                    <div key={svc.id} className={`border rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col gap-4 ${isActive ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-rose-50/30 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/50'}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 tracking-tight">{svc.cliente || 'Unknown Client'}</h3>
                                                <span className={`inline-block px-3 py-1 mt-2 text-xs font-bold uppercase tracking-wider rounded-md ${isActive ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400'}`}>
                                                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </div>
                                            {isAdmin && (
                                                isActive ? (
                                                    <button
                                                        onClick={() => handleCancelService(svc)}
                                                        title="Cancel Service"
                                                        className="p-2 rounded-xl transition-colors text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                                                        <PowerOff size={20} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleReactivateService(svc)}
                                                        title="Reactivate Service"
                                                        className="p-2 rounded-xl transition-colors text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10">
                                                        <RefreshCw size={20} />
                                                    </button>
                                                )
                                            )}
                                        </div>

                                        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 mt-2 flex-1 font-medium bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <div className="flex items-center gap-3">
                                                <WrenchIcon size={18} className="text-indigo-400" />
                                                <span>{svc.grupos?.nombre || svc.nombre || 'Unspecified Engine'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Calendar size={18} className="text-sky-400" />
                                                <span>{svc.frecuencia || 'Unscheduled'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <MapPin size={18} className="text-amber-400" />
                                                <span>{svc.direccion || 'Unspecified Location'}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 mt-2 flex justify-between items-center">
                                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">ID: #{svc.id.toString().padStart(4, '0')}</span>
                                            {isAdmin && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEditClick(svc)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors" title="Edit Service">
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(svc.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors" title="Delete Service">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* New Service Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-fade-in-up my-8">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{editingServiceId ? 'Edit Service Contract' : 'New Service Contract'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors bg-white dark:bg-slate-700 p-1 rounded-full shadow-sm">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateOrUpdateService} className="p-6 flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Company/Client <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.cliente}
                                        onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="AF-CRM Corp"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Equipment Name <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="Main Data Center UPS"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Service Address <span className="text-rose-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.direccion}
                                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="Av. Corrientes 1234, CABA"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Frequency <span className="text-rose-500">*</span></label>
                                <select
                                    required
                                    value={formData.frecuencia}
                                    onChange={(e) => setFormData({ ...formData, frecuencia: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                >
                                    <option value="Mensual">Mensual (12/year)</option>
                                    <option value="Bimestral">Bimestral (6/year)</option>
                                    <option value="Trimestral">Trimestral (4/year)</option>
                                    <option value="Semestral">Semestral (2/year)</option>
                                    <option value="Anual">Anual (1/year)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Observations</label>
                                <textarea
                                    rows={2}
                                    value={formData.observaciones}
                                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
                                    placeholder="Gate access code, special requirements..."
                                />
                            </div>

                            <div className="flex gap-3 justify-end mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-md shadow-indigo-200">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                    <span>Create Service</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Temporary inline Wrench proxy
function WrenchIcon({ size, className }: { size: number, className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
    );
}
