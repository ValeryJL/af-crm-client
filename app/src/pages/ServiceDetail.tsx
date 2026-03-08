import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Edit2, Calendar, MapPin, Wrench, Clock, CheckCircle2,
    AlertCircle, Loader2, X, Plus, RefreshCw, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import apiClient from '../api/client.ts';

interface Service {
    id: number;
    cliente: string;
    nombre: string;
    equipo: string;
    direccion: string;
    frecuencia: string;
    observaciones?: string;
    fechaInicio: string;
    fechaFin: string;
    serviceToggle?: boolean;
    fechaPrimerService?: string;
    baja?: string | null;
}

interface Task {
    id: number;
    status: 'UNASSIGNED' | 'PENDING' | 'RESOLVED' | 'OVERDUE' | 'CANCELLED';
    type: 'MAINTENANCE' | 'SERVICE' | 'EVENTUAL';
    fechaProgramada: string | null;
    reportID: string | null;
    serviceId: number;
    serviceName: string;
}

type TabKey = 'upcoming' | 'pending' | 'history';

const STATUS_COLORS: Record<string, string> = {
    UNASSIGNED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    PENDING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    RESOLVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    OVERDUE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
    CANCELLED: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
};

const TYPE_LABELS: Record<string, string> = {
    MAINTENANCE: 'Maintenance',
    SERVICE: 'Annual Service',
    EVENTUAL: 'Eventual',
};

export function ServiceDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    const [service, setService] = useState<Service | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>('upcoming');

    // Edit modal state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<Partial<Service>>({});

    // Task assign modal state
    const [assigningTask, setAssigningTask] = useState<Task | null>(null);
    const [assignDate, setAssignDate] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [svcRes, tasksRes] = await Promise.all([
                apiClient.get(`/services/${id}`),
                apiClient.get(`/services/${id}/tasks`)
            ]);
            setService(svcRes.data);
            setTasks(tasksRes.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load service.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [id]);

    const now = new Date();
    const upcomingTasks = tasks.filter(t =>
        t.status === 'UNASSIGNED' ||
        (t.status === 'PENDING' && t.fechaProgramada && new Date(t.fechaProgramada) >= now)
    );
    const pendingTasks = tasks.filter(t =>
        t.status === 'OVERDUE' ||
        (t.status === 'PENDING' && t.fechaProgramada && new Date(t.fechaProgramada) < now)
    );
    const historyTasks = tasks.filter(t => t.status === 'RESOLVED' || t.status === 'CANCELLED');

    const tabData: Record<TabKey, Task[]> = {
        upcoming: upcomingTasks,
        pending: pendingTasks,
        history: historyTasks,
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!service) return;
        setIsSubmitting(true);
        try {
            const payload = { ...formData, frecuencia: (formData.frecuencia || '').toLowerCase() };
            await apiClient.put(`/services/${service.id}`, payload);
            setIsEditOpen(false);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update service.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEdit = () => {
        if (!service) return;
        setFormData({ ...service });
        setIsEditOpen(true);
    };

    const handleAssignDate = async () => {
        if (!assigningTask || !assignDate) return;
        setIsAssigning(true);
        try {
            const isReprogram = assigningTask.status !== 'UNASSIGNED';
            const endpoint = isReprogram
                ? `/calendar/tasks/${assigningTask.id}/reprogram`
                : `/calendar/tasks/${assigningTask.id}/assign`;
            const body = isReprogram
                ? { newDate: new Date(assignDate).toISOString() }
                : { fechaProgramada: assignDate.split('T')[0] }; // date-only for assign
            await apiClient.patch(endpoint, body);
            setAssigningTask(null);
            setAssignDate('');
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to assign date.');
        } finally {
            setIsAssigning(false);
        }
    };

    const handleResolveTask = async (task: Task) => {
        if (!window.confirm('Mark this visit as resolved?')) return;
        try {
            await apiClient.patch(`/calendar/tasks/${task.id}/resolve`, {});
            fetchData();
        } catch {
            alert('Failed to resolve task.');
        }
    };

    const handleReprogramTask = async (task: Task) => {
        setAssigningTask(task);
        setAssignDate(task.fechaProgramada ? task.fechaProgramada.slice(0, 16) : '');
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-64 text-slate-400">
            <Loader2 className="animate-spin mr-2" size={24} /> Loading service...
        </div>
    );

    if (error || !service) return (
        <div className="flex flex-col items-center justify-center h-64 text-rose-500">
            <AlertCircle size={32} className="mb-2 opacity-50" />
            <p>{error || 'Service not found.'}</p>
            <button onClick={() => navigate('/services')} className="mt-4 text-indigo-500 hover:underline text-sm">
                ← Back to Services
            </button>
        </div>
    );

    const tabs: { key: TabKey; label: string; icon: React.ReactNode; count: number }[] = [
        { key: 'upcoming', label: 'Upcoming Visits', icon: <Calendar size={16} />, count: upcomingTasks.length },
        { key: 'pending', label: 'Alerts', icon: <AlertCircle size={16} />, count: pendingTasks.length },
        { key: 'history', label: 'History', icon: <FileText size={16} />, count: historyTasks.length },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => navigate('/services')}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="min-w-0 pr-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate">{service.cliente}</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">{service.nombre}</p>
                    </div>
                </div>
                {isAdmin && (
                    <button
                        onClick={openEdit}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto"
                    >
                        <Edit2 size={18} />
                        <span>Edit Service</span>
                    </button>
                )}
            </div>

            {/* Service Info Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Equipment</span>
                        <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                            <Wrench size={15} className="text-indigo-400 shrink-0" />
                            {service.equipo || '—'}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Frequency</span>
                        <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                            <RefreshCw size={15} className="text-sky-400 shrink-0" />
                            <span className="capitalize">{service.frecuencia}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Address</span>
                        <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                            <MapPin size={15} className="text-amber-400 shrink-0" />
                            {service.direccion}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Contract Period</span>
                        <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                            <Clock size={15} className="text-emerald-400 shrink-0" />
                            <span>{new Date(service.fechaInicio).toLocaleDateString()} → {new Date(service.fechaFin).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                {service.observaciones && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-sm text-slate-500 italic">
                        {service.observaciones}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="flex border-b border-slate-100 dark:border-slate-700">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab.key
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${tab.key === 'pending' && tab.count > 0 ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="min-h-[200px]">
                    {tabData[activeTab].length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <CheckCircle2 size={32} className="mb-2 opacity-30" />
                            <p className="text-sm">No items in this category.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                            {tabData[activeTab].map(task => (
                                <div key={task.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${STATUS_COLORS[task.status]}`}>
                                                    {task.status}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                                    {TYPE_LABELS[task.type] || task.type}
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">
                                                {task.status === 'UNASSIGNED'
                                                    ? 'No date assigned yet'
                                                    : task.fechaProgramada
                                                        ? new Date(task.fechaProgramada).toLocaleString()
                                                        : '—'
                                                }
                                            </p>
                                            {task.reportID && (
                                                <p className="text-xs text-emerald-500 font-semibold">Report: {task.reportID}</p>
                                            )}
                                        </div>
                                    </div>
                                    {isAdmin && (task.status === 'UNASSIGNED' || task.status === 'PENDING' || task.status === 'OVERDUE') && (
                                        <div className="flex gap-2 shrink-0">
                                            {task.status === 'UNASSIGNED' ? (
                                                <button
                                                    onClick={() => { setAssigningTask(task); setAssignDate(''); }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg text-xs font-bold transition-colors border border-indigo-100 dark:border-indigo-800"
                                                >
                                                    <Plus size={13} /> Assign Date
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleReprogramTask(task)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg text-xs font-bold transition-colors border border-slate-200 dark:border-slate-600"
                                                    >
                                                        <RefreshCw size={13} /> Reprogram
                                                    </button>
                                                    <button
                                                        onClick={() => handleResolveTask(task)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors border border-emerald-100 dark:border-emerald-800"
                                                    >
                                                        <CheckCircle2 size={13} /> Resolve
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Assign / Reprogram Modal */}
            {assigningTask && (
                <div className="modal-overlay">
                    <div className="modal-content !max-w-sm">
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {assigningTask.status === 'UNASSIGNED' ? 'Assign Date' : 'Reprogram Visit'}
                            </h2>
                            <button onClick={() => setAssigningTask(null)} className="close-btn">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div>
                                <label className="form-label">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={assignDate}
                                    onChange={e => setAssignDate(e.target.value)}
                                    className="form-input"
                                />
                                <p className="mt-1 text-[10px] text-slate-400 italic">
                                    {assigningTask.status === 'UNASSIGNED'
                                        ? 'Assigning a date will move this task to PENDING.'
                                        : 'This will update the scheduled date for this visit.'}
                                </p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setAssigningTask(null)} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignDate}
                                disabled={isAssigning || !assignDate}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                {isAssigning ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Service Modal */}
            {isEditOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Edit Service</h2>
                            <button onClick={() => setIsEditOpen(false)} className="close-btn">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSave} className="flex flex-col h-full overflow-hidden">
                            <div className="modal-body space-y-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="form-label">Client <span className="text-rose-500">*</span></label>
                                        <input required value={formData.cliente || ''} onChange={e => setFormData({ ...formData, cliente: e.target.value })}
                                            className="form-input" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="form-label">Title <span className="text-rose-500">*</span></label>
                                        <input required value={formData.nombre || ''} onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                            className="form-input" />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Equipment <span className="text-rose-500">*</span></label>
                                    <input required value={formData.equipo || ''} onChange={e => setFormData({ ...formData, equipo: e.target.value })}
                                        className="form-input" />
                                </div>
                                <div>
                                    <label className="form-label">Address <span className="text-rose-500">*</span></label>
                                    <input required value={formData.direccion || ''} onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                                        className="form-input" />
                                </div>
                                <div>
                                    <label className="form-label">Frequency</label>
                                    <select value={formData.frecuencia || 'mensual'} onChange={e => setFormData({ ...formData, frecuencia: e.target.value })}
                                        className="form-select">
                                        <option value="mensual">Mensual</option>
                                        <option value="semanal">Semanal</option>
                                        <option value="quincenal">Quincenal</option>
                                        <option value="eventual">EVENTUAL</option>
                                    </select>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="form-label">Start Date</label>
                                        <input type="date" value={formData.fechaInicio || ''} onChange={e => setFormData({ ...formData, fechaInicio: e.target.value })}
                                            className="form-input" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="form-label">End Date</label>
                                        <input type="date" value={formData.fechaFin || ''} onChange={e => setFormData({ ...formData, fechaFin: e.target.value })}
                                            className="form-input" />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Observations</label>
                                    <textarea rows={2} value={formData.observaciones || ''} onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                                        className="form-textarea resize-none" />
                                </div>
                                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 text-xs text-amber-700 dark:text-amber-400 font-medium">
                                    ⚠️ Saving will erase all future unassigned tasks and regenerate them based on the new configuration.
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex items-center gap-2">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Edit2 size={18} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
