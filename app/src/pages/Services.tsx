import { useState, useEffect } from 'react';
import { Plus, Search, Calendar, MapPin, PowerOff, AlertCircle, X, Loader2 } from 'lucide-react';
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

    const handleCreateService = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiClient.post('/services', formData);
            setIsModalOpen(false);
            setFormData({
                cliente: '',
                nombre: '',
                direccion: '',
                frecuencia: 'Mensual',
                observaciones: ''
            });
            fetchServices(); // Refetch table
        } catch (err: any) {
            console.error('Failed to create service', err);
            alert(err.response?.data?.message || 'Failed to create service.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredServices = services.filter(svc =>
        svc.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        svc.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        svc.direccion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Services & Contracts</h1>
                    <p className="text-slate-500 mt-1">Manage generator maintenance schedules</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto">
                    <Plus size={20} />
                    <span>New Service Request</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                    </div>
                    {/* Filters */}
                    <div className="flex gap-2 w-full sm:w-auto">
                        <select className="flex-1 sm:w-auto border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                                    <div key={svc.id} className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col gap-4 ${isActive ? 'border-slate-200' : 'border-rose-200 bg-rose-50/30'}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-xl text-slate-800 tracking-tight">{svc.cliente || 'Unknown Client'}</h3>
                                                <span className={`inline-block px-3 py-1 mt-2 text-xs font-bold uppercase tracking-wider rounded-md ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </div>
                                            <button title={isActive ? "Cancel Service" : "Service Disabled"} disabled={!isActive} className={`p-2 rounded-xl transition-colors ${isActive ? 'text-slate-400 hover:text-rose-500 hover:bg-rose-50' : 'text-slate-300 cursor-not-allowed'}`}>
                                                <PowerOff size={20} />
                                            </button>
                                        </div>

                                        <div className="space-y-3 text-sm text-slate-600 mt-2 flex-1 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
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

                                        <div className="pt-4 border-t border-slate-100 mt-2 flex justify-between items-center">
                                            <span className="text-xs text-slate-400 font-medium">ID: #{svc.id.toString().padStart(4, '0')}</span>
                                            <button className="text-indigo-600 font-bold text-sm hover:text-indigo-700 flex items-center gap-1 group">
                                                View Details
                                                <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
                                            </button>
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
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-fade-in-up my-8">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800">New Service Contract</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors bg-white p-1 rounded-full shadow-sm">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateService} className="p-6 flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Company/Client <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.cliente}
                                        onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="AF-CRM Corp"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Equipment Name <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="Main Data Center UPS"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Service Address <span className="text-rose-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.direccion}
                                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="Av. Corrientes 1234, CABA"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Frequency <span className="text-rose-500">*</span></label>
                                <select
                                    required
                                    value={formData.frecuencia}
                                    onChange={(e) => setFormData({ ...formData, frecuencia: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                >
                                    <option value="Mensual">Mensual (12/year)</option>
                                    <option value="Bimestral">Bimestral (6/year)</option>
                                    <option value="Trimestral">Trimestral (4/year)</option>
                                    <option value="Semestral">Semestral (2/year)</option>
                                    <option value="Anual">Anual (1/year)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Observations</label>
                                <textarea
                                    rows={2}
                                    value={formData.observaciones}
                                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
                                    placeholder="Gate access code, special requirements..."
                                />
                            </div>

                            <div className="flex gap-3 justify-end mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
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
