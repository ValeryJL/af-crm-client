import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, Loader2, X, Calendar as CalendarIcon, Briefcase } from 'lucide-react';
import apiClient from '../api/client';

const locales = {
    'en-US': enUS,
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})

interface BackendTask {
    id: number;
    fechaPlanificada: string;
    estado: string; // e.g., 'PENDING', 'COMPLETED', 'CANCELLED'
    servicios?: {
        cliente: string;
        nombre: string;
    };
    tareaEventual?: {
        cliente: string;
        titulo: string;
    }
}

interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    status: string;
    allDay: boolean;
    resource: BackendTask;
}

interface ServiceObj {
    id: number;
    cliente: string;
    nombre: string;
}

export function CalendarView() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEventualModalOpen, setIsEventualModalOpen] = useState(false);
    const [services, setServices] = useState<ServiceObj[]>([]);

    // Form state
    const [eventualDesc, setEventualDesc] = useState('');
    const [eventualDate, setEventualDate] = useState('');
    const [eventualServiceId, setEventualServiceId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Details Modal
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    const fetchTasks = async (start?: Date, end?: Date) => {
        setIsLoading(true);
        try {
            const startDateStr = start ? format(start, 'yyyy-MM-dd') : format(startOfMonth(new Date()), 'yyyy-MM-dd');
            const endDateStr = end ? format(end, 'yyyy-MM-dd') : format(endOfMonth(new Date()), 'yyyy-MM-dd');
            const response = await apiClient.get(`/calendar?start=${startDateStr}&end=${endDateStr}`);

            const fetchedEvents: CalendarEvent[] = response.data.map((task: BackendTask) => {
                const date = new Date(task.fechaPlanificada + 'T12:00:00'); // Normalize to midday to prevent timezone shifts
                let titleStr = 'Unknown Task';

                if (task.servicios) {
                    titleStr = `[Routine] ${task.servicios.cliente} - ${task.servicios.nombre}`;
                } else if (task.tareaEventual) {
                    titleStr = `[Eventual] ${task.tareaEventual.cliente} - ${task.tareaEventual.titulo}`;
                }

                return {
                    id: task.id,
                    title: titleStr,
                    start: date,
                    end: date,
                    status: task.estado || 'PENDING',
                    allDay: true,
                    resource: task
                };
            });

            setEvents(fetchedEvents);
        } catch (error) {
            console.error('Failed to fetch calendar tasks', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load initial month
    useEffect(() => {
        const start = startOfMonth(new Date());
        const end = endOfMonth(new Date());
        fetchTasks(start, end);

        // Fetch services for dropdown
        apiClient.get('/services').then(res => setServices(res.data));
    }, []);

    const handleRangeChange = (range: Date[] | { start: Date; end: Date }) => {
        let start: Date;
        let end: Date;

        if (Array.isArray(range)) {
            // week/day view gives an array of dates
            start = range[0];
            end = range[range.length - 1];
        } else {
            // month view gives an object
            start = range.start;
            end = range.end;
        }

        // Add padding to ensure we get adjacent days
        fetchTasks(start, end);
    };

    const eventStyleGetter = (event: CalendarEvent) => {
        let backgroundColor = '#e2e8f0'; // slate-200 pending/default
        let color = '#475569'; // slate-600

        if (event.status === 'COMPLETED') {
            backgroundColor = '#d1fae5'; // emerald-100
            color = '#047857'; // emerald-700
        } else if (event.status === 'PENDING') {
            backgroundColor = '#fef3c7'; // amber-100
            color = '#b45309'; // amber-700
        } else if (event.status === 'CANCELLED') {
            backgroundColor = '#ffe4e6'; // rose-100
            color = '#be123c'; // rose-700
        }

        return {
            style: {
                backgroundColor,
                color,
                borderRadius: '6px',
                opacity: 0.9,
                border: '0px',
                display: 'block',
                fontWeight: 'bold',
                padding: '2px 6px',
                fontSize: '0.75rem'
            }
        };
    };

    const handleCreateEventual = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiClient.post('/calendar/eventual', {
                descripcion: eventualDesc,
                fecha: eventualDate,
                serviceId: Number(eventualServiceId)
            });
            setIsEventualModalOpen(false);
            setEventualDesc('');
            setEventualDate('');
            setEventualServiceId('');
            fetchTasks(); // Refetch basic month view
        } catch (error) {
            console.error('Failed to create eventual task', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 shrink-0">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Schedule</h1>
                        {isLoading && <Loader2 className="animate-spin text-indigo-500" size={24} />}
                    </div>
                    <p className="text-slate-500 mt-1">Manage routine and eventual service tasks</p>
                </div>
                <button
                    onClick={() => setIsEventualModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto">
                    <Plus size={20} />
                    <span>New Eventual Task</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 p-6 flex-1 min-h-[500px]">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onRangeChange={handleRangeChange}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={setSelectedEvent}
                    views={['month', 'week', 'agenda']}
                />
            </div>

            {/* Eventual Task Modal */}
            {isEventualModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-fade-in-up">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800">New Eventual Task</h2>
                            <button onClick={() => setIsEventualModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors bg-white p-1 rounded-full shadow-sm">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateEventual} className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Select Service <span className="text-rose-500">*</span></label>
                                <select
                                    required
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    value={eventualServiceId}
                                    onChange={(e) => setEventualServiceId(e.target.value)}
                                >
                                    <option value="" disabled>Select a contracted service...</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.cliente} - {s.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Planned Date <span className="text-rose-500">*</span></label>
                                <input
                                    type="date"
                                    required
                                    value={eventualDate}
                                    onChange={(e) => setEventualDate(e.target.value)}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Description <span className="text-rose-500">*</span></label>
                                <textarea
                                    required
                                    rows={3}
                                    value={eventualDesc}
                                    onChange={(e) => setEventualDesc(e.target.value)}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
                                    placeholder="Brief details about the eventual task..."
                                />
                            </div>
                            <div className="flex gap-3 justify-end mt-4">
                                <button type="button" onClick={() => setIsEventualModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-md shadow-indigo-200">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                    <span>Create Task</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Task Details Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-fade-in-up">
                        <div className="flex justify-between items-start p-6 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md mb-2
                                    ${selectedEvent.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                        selectedEvent.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                                            'bg-amber-100 text-amber-700'}`}>
                                    {selectedEvent.status}
                                </span>
                                <h2 className="text-xl font-bold text-slate-800 leading-tight">{selectedEvent.title}</h2>
                            </div>
                            <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-rose-500 transition-colors bg-white p-1 rounded-full shadow-sm">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4 text-sm font-medium text-slate-600">
                            <div className="flex items-center gap-3">
                                <CalendarIcon className="text-sky-500" size={18} />
                                <span>{format(selectedEvent.start, 'MMMM do, yyyy')}</span>
                            </div>
                            {selectedEvent.resource.servicios && (
                                <div className="flex items-start gap-3">
                                    <Briefcase className="text-indigo-500 shrink-0" size={18} />
                                    <div>
                                        <p className="text-slate-800 font-bold">{selectedEvent.resource.servicios.cliente}</p>
                                        <p className="text-xs text-slate-500">{selectedEvent.resource.servicios.nombre}</p>
                                    </div>
                                </div>
                            )}
                            {selectedEvent.resource.tareaEventual && (
                                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <Briefcase className="text-indigo-500 shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-slate-800 font-bold">{selectedEvent.resource.tareaEventual.cliente}</p>
                                        <p className="text-xs italic text-slate-500 mt-1">Eventual Task</p>
                                    </div>
                                </div>
                            )}
                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                                <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition-colors">
                                    View Service Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
