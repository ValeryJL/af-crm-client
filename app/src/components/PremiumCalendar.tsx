import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, eachDayOfInterval, addDays, startOfDay, addHours } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, X, Clock, Trash2, CheckCircle2, ExternalLink, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Calendar.css';
import apiClient from '../api/client';

interface CalendarItem {
    id: string | number;
    title: string;
    description?: string;
    start: Date;
    end?: Date;
    allDay: boolean;
    type: 'EVENT' | 'TASK';
    status?: 'UNASSIGNED' | 'PENDING' | 'RESOLVED' | 'OVERDUE' | 'DONE'; // Support both new and legacy status for compatibility
    scheduledDate?: Date;
    color?: string;
    serviceId?: number;
}

interface PremiumCalendarProps {
    refreshTrigger?: number;
}

type CalendarView = 'month' | 'week' | 'agenda';

export const PremiumCalendar: React.FC<PremiumCalendarProps> = ({ refreshTrigger = 0 }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [items, setItems] = useState<CalendarItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<CalendarView>('month');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start: '',
        end: '',
        allDay: false
    });

    // Auto-detect responsive view on mount
    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        setView(isMobile ? 'agenda' : 'week');
    }, []);


    useEffect(() => {
        fetchData();
    }, [currentDate, refreshTrigger, view]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let start, end;
            if (view === 'month') {
                start = startOfWeek(startOfMonth(currentDate));
                end = endOfWeek(endOfMonth(currentDate));
            } else if (view === 'week') {
                start = startOfWeek(currentDate);
                end = endOfWeek(currentDate);
            } else {
                // Agenda: current day to end of week
                start = startOfDay(currentDate);
                end = addDays(start, 7);
            }

            const response = await apiClient.get('/calendar/events/all', {
                params: {
                    start: start.toISOString(),
                    end: end.toISOString(),
                }
            });

            const mappedEvents: CalendarItem[] = response.data.events.map((e: any) => ({
                id: e.id,
                title: e.title,
                description: e.description,
                start: new Date(e.start),
                end: new Date(e.end),
                allDay: e.allDay,
                type: 'EVENT',
                status: e.status,
                color: e.color || '#6366f1'
            }));

            const mappedTasks: CalendarItem[] = response.data.tasks.map((t: any) => {
                const dateVal = t.fechaProgramada || t.scheduledDate;
                const scheduledDate = dateVal ? new Date(dateVal) : null;
                const status = t.status as CalendarItem['status'];
                const isOverdue = status === 'PENDING' && scheduledDate && scheduledDate < new Date();

                return {
                    id: t.id,
                    title: t.serviceName,
                    description: `Client: ${t.cliente} | Equipment: ${t.equipo}`,
                    // Only set start if we have a real date, otherwise it won't show in grid
                    start: scheduledDate || new Date(0),
                    allDay: !dateVal,
                    type: 'TASK',
                    status: isOverdue ? 'OVERDUE' : status,
                    color: status === 'RESOLVED' || status === 'DONE' ? '#10b981' : (isOverdue || status === 'OVERDUE' ? '#ef4444' : (status === 'UNASSIGNED' ? '#f59e0b' : '#3b82f6')),
                    serviceId: t.serviceId,
                    scheduledDate: scheduledDate || undefined
                };
            });

            // Filter out tasks with no date (year 1970) for the grid views
            setItems([...mappedEvents, ...mappedTasks].filter(item => item.start.getTime() > 0 || view === 'agenda'));
        } catch (error) {
            console.error('Error fetching calendar data:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const nextRange = () => {
        if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
        else if (view === 'week') setCurrentDate(addDays(currentDate, 7));
        else setCurrentDate(addDays(currentDate, 1));
    };

    const prevRange = () => {
        if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
        else if (view === 'week') setCurrentDate(addDays(currentDate, -7));
        else setCurrentDate(addDays(currentDate, -1));
    };

    const handleDayClick = (date: Date) => {
        // Default to current hour + 1 for start time
        const start = new Date(date);
        const now = new Date();
        start.setHours(now.getHours() + 1, 0, 0, 0);

        const end = addHours(start, 1);

        setFormData({
            title: '',
            description: '',
            start: format(start, "yyyy-MM-dd'T'HH:mm"),
            end: format(end, "yyyy-MM-dd'T'HH:mm"),
            allDay: false
        });
        setShowCreateModal(true);
    };

    const handleItemClick = (e: React.MouseEvent, item: CalendarItem) => {
        e.stopPropagation();
        setSelectedItem(item);
        setFormData({
            title: item.title,
            description: item.description || '',
            start: format(item.start, "yyyy-MM-dd'T'HH:mm"),
            end: item.end ? format(item.end, "yyyy-MM-dd'T'HH:mm") : '',
            allDay: item.allDay
        });
        setShowEditModal(true);
    };

    const handleSaveEvent = async () => {
        setIsSaving(true);
        try {
            await apiClient.post('/calendar/events', {
                title: formData.title,
                description: formData.description,
                start: new Date(formData.start).toISOString(),
                end: formData.end ? new Date(formData.end).toISOString() : null,
                allDay: formData.allDay
            });
            setShowCreateModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving event:', error);
            alert('Failed to save event');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReprogramTask = async () => {
        if (!selectedItem || selectedItem.type !== 'TASK') return;
        setIsSaving(true);
        try {
            await apiClient.patch(`/calendar/tasks/${selectedItem.id}/reprogram`, {
                newDate: new Date(formData.start).toISOString()
            });
            setShowEditModal(false);
            fetchData();
        } catch (error) {
            console.error('Error reprogramming task:', error);
            alert('Failed to reprogram task');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateEvent = async () => {
        if (!selectedItem || selectedItem.type !== 'EVENT') return;
        setIsSaving(true);
        try {
            await apiClient.put(`/calendar/events/${selectedItem.id}`, {
                title: formData.title,
                description: formData.description,
                start: new Date(formData.start).toISOString(),
                end: formData.end ? new Date(formData.end).toISOString() : null,
                allDay: formData.allDay
            });
            setShowEditModal(false);
            fetchData();
        } catch (error) {
            console.error('Error updating event:', error);
            alert('Failed to update event');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteItem = async () => {
        if (!selectedItem) return;
        const typeLabel = selectedItem.type === 'TASK' ? 'task' : 'event';
        if (!window.confirm(`Are you sure you want to delete this ${typeLabel}?`)) return;

        setIsSaving(true);
        try {
            const endpoint = selectedItem.type === 'TASK' ? `/calendar/tasks/${selectedItem.id}` : `/calendar/events/${selectedItem.id}`;
            await apiClient.delete(endpoint);
            setShowEditModal(false);
            fetchData();
        } catch (error) {
            console.error(`Error deleting ${typeLabel}:`, error);
            alert(`Failed to delete ${typeLabel}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleTaskStatus = async () => {
        if (!selectedItem || selectedItem.type !== 'TASK') return;
        const newStatus = selectedItem.status === 'RESOLVED' ? 'PENDING' : 'RESOLVED';

        setIsSaving(true);
        try {
            await apiClient.patch(`/calendar/tasks/${selectedItem.id}`, {
                status: newStatus
            });
            setShowEditModal(false);
            fetchData();
        } catch (error) {
            console.error('Error updating task status:', error);
            alert('Failed to update task status');
        } finally {
            setIsSaving(false);
        }
    };

    const renderHeader = () => (
        <div className="calendar-header">
            <div className="calendar-title">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg text-indigo-600">
                    <CalendarIcon size={24} />
                </div>
                <div className="flex flex-col">
                    <span className="text-lg leading-tight">{format(currentDate, view === 'month' ? 'MMMM yyyy' : 'MMM d, yyyy')}</span>
                    <span className="text-xs text-indigo-500 font-medium uppercase tracking-wider">{view} view</span>
                </div>
                {loading && <Loader2 size={18} className="animate-spin text-indigo-500" />}
            </div>

            <div className="flex items-center gap-4">
                <div className="view-selector bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
                    {(['month', 'week', 'agenda'] as CalendarView[]).map(v => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === v ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="calendar-nav">
                    <button className="nav-btn" onClick={prevRange}><ChevronLeft size={20} /></button>
                    <button className="nav-btn" onClick={() => setCurrentDate(new Date())}>Today</button>
                    <button className="nav-btn" onClick={nextRange}><ChevronRight size={20} /></button>
                </div>
            </div>
        </div>
    );

    const renderMonthCells = () => {
        const monthStart = startOfMonth(currentDate);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(endOfMonth(monthStart));
        const allDays = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div className="calendar-scroll-wrapper month-view-wrapper">
                <div className="calendar-days month-view">
                    {allDays.map((d) => {
                        const isCurrentMonth = isSameMonth(d, monthStart);
                        const dayItems = items.filter(item => isSameDay(item.start, d));

                        return (
                            <div
                                key={d.toString()}
                                className={`calendar-day ${!isCurrentMonth ? "other-month" : ""} ${isSameDay(d, new Date()) ? "is-today" : ""}`}
                                onClick={() => handleDayClick(d)}
                            >
                                <span className="day-number">{format(d, 'd')}</span>
                                <div className="events-container">
                                    {dayItems.map((item: CalendarItem) => (
                                        <div
                                            key={`${item.type}-${item.id}`}
                                            className={`event-item ${item.type.toLowerCase()} ${item.status === 'OVERDUE' ? 'urgent ripple' : ''}`}
                                            title={`${item.title}${item.status === 'OVERDUE' ? ' - MISSING REPORT!' : ''}`}
                                            style={item.color ? { borderLeftColor: item.color } : {}}
                                            onClick={(e) => handleItemClick(e, item)}
                                        >
                                            <div className="event-time">
                                                {item.status === 'UNASSIGNED' ? 'TBD' : format(item.start, 'HH:mm')}
                                            </div>
                                            <div className="event-title">
                                                <span className={`item-type-badge ${item.status === 'OVERDUE' ? 'bg-rose-500' : ''}`}>
                                                    {item.status === 'OVERDUE' ? '!' : item.type[0]}
                                                </span>
                                                {item.title}
                                            </div>
                                            {item.status === 'OVERDUE' && (
                                                <div className="text-[10px] font-black text-rose-500 mt-1 uppercase tracking-tighter animate-pulse">
                                                    Missing Report
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderWeekCells = () => {
        const startDate = startOfWeek(currentDate);
        const days = eachDayOfInterval({ start: startDate, end: endOfWeek(currentDate) });
        const hours = Array.from({ length: 24 }).map((_, i) => i);

        return (
            <div className="calendar-scroll-wrapper week-scroll-wrapper">
                <div className="calendar-days week-view">
                    {/* Corner empty cell */}
                    <div className="time-col-header"></div>

                    {/* Days Headers */}
                    {days.map(d => (
                        <div key={`header-${d.toString()}`} className={`day-header-cell ${isSameDay(d, new Date()) ? "is-today" : ""}`}>
                            <span className="day-name">{format(d, 'EEE')}</span>
                            <span className="day-number">{format(d, 'd')}</span>
                        </div>
                    ))}

                    {/* Time Grid */}
                    {hours.map(hour => (
                        <React.Fragment key={`hour-row-${hour}`}>
                            <div className="time-label">
                                {`${hour.toString().padStart(2, '0')}:00`}
                            </div>
                            {days.map(d => {
                                const cellDate = new Date(d);
                                cellDate.setHours(hour, 0, 0, 0);

                                const cellItems = items.filter(item =>
                                    isSameDay(item.start, d) && item.start.getHours() === hour
                                );

                                return (
                                    <div
                                        key={`cell-${d.toString()}-${hour}`}
                                        className="week-grid-cell"
                                        onClick={() => handleDayClick(cellDate)}
                                    >
                                        <div className="events-container">
                                            {cellItems.map((item: CalendarItem) => (
                                                <div
                                                    key={`${item.type}-${item.id}`}
                                                    className={`event-item ${item.type.toLowerCase()} ${item.status === 'RESOLVED' ? 'opacity-50 line-through' : ''}`}
                                                    style={{ borderLeftColor: item.color }}
                                                    onClick={(e) => handleItemClick(e, item)}
                                                >
                                                    <div className="event-time">{format(item.start, 'HH:mm')}</div>
                                                    <div className="font-bold flex items-center gap-1">
                                                        {item.status === 'RESOLVED' && <CheckCircle2 size={10} className="text-emerald-500" />}
                                                        {item.title}
                                                    </div>
                                                    <div className="text-[10px] opacity-70">{item.description}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    };

    const renderAgendaView = () => (
        <div className="agenda-view p-6 space-y-6 overflow-y-auto">
            {items.sort((a: CalendarItem, b: CalendarItem) => a.start.getTime() - b.start.getTime()).map((item: CalendarItem) => (
                <div key={`${item.type}-${item.id}`} className="agenda-item flex gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80" onClick={(e) => handleItemClick(e, item)}>
                    <div className="agenda-date flex flex-col items-center justify-center min-w-[60px] border-r border-slate-100 dark:border-slate-700 pr-4">
                        <span className="text-xs font-bold text-indigo-500 uppercase">{format(item.start, 'EEE')}</span>
                        <span className="text-xl font-bold">{format(item.start, 'd')}</span>
                    </div>
                    <div className="agenda-content flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className={`font-bold flex items-center gap-2 ${item.status === 'RESOLVED' ? 'text-slate-400 line-through' : ''}`}>
                                <span className={`w-2 h-2 rounded-full`} style={{ background: item.color }}></span>
                                {item.status === 'RESOLVED' && <CheckCircle2 size={14} className="text-emerald-500" />}
                                {item.title}
                            </h3>
                            <span className="text-[10px] uppercase font-black bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md">{item.type}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                        {item.end && (
                            <div className="mt-2 text-xs text-slate-400">
                                {format(item.start, 'p')} - {format(item.end, 'p')}
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {items.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                    No items scheduled for this period.
                </div>
            )}
        </div>
    );

    return (
        <div className="premium-calendar">
            {renderHeader()}
            <div className={`calendar-grid view-mode-${view}`}>
                {/* Weekdays header is only needed for month view now, week view has it built in */}
                {view === 'month' && (
                    <div className="calendar-weekdays">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="weekday">{day}</div>
                        ))}
                    </div>
                )}
                {view === 'month' && renderMonthCells()}
                {view === 'week' && renderWeekCells()}
                {view === 'agenda' && renderAgendaView()}
            </div>
            {/* Create Event Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">New Event</h2>
                            <button className="close-btn" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Event title"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Details</label>
                                <textarea
                                    className="form-textarea"
                                    rows={3}
                                    placeholder="Add description..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={formData.start}
                                        onChange={e => setFormData({ ...formData, start: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date (Optional)</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={formData.end}
                                        onChange={e => setFormData({ ...formData, end: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSaveEvent} disabled={isSaving || !formData.title}>
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Create Event'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit/View Modal */}
            {showEditModal && selectedItem && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">{selectedItem.type === 'TASK' ? 'Technical Visit' : 'Edit Event'}</h2>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${selectedItem.type === 'TASK' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                    {selectedItem.type}
                                </span>
                            </div>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            {selectedItem.type === 'TASK' ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="font-bold text-lg mb-1">{selectedItem.title}</div>
                                        <div className="text-sm text-slate-500 flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} />
                                                {selectedItem.status === 'UNASSIGNED'
                                                    ? 'Not yet scheduled'
                                                    : `Scheduled for ${format(selectedItem.start, 'PPP p')}`
                                                }
                                            </div>
                                            {selectedItem.status === 'OVERDUE' && (
                                                <div className="flex items-center gap-2 text-rose-500 font-bold bg-rose-50 dark:bg-rose-900/20 p-2 rounded-lg mt-2 border border-rose-100 dark:border-rose-800">
                                                    <AlertCircle size={16} />
                                                    MISSING REPORT: Date passed without resolution.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{selectedItem.status === 'UNASSIGNED' ? 'Assign Date & Time' : 'Reprogram Date & Time'}</label>
                                        <input
                                            type="datetime-local"
                                            className="form-input"
                                            value={formData.start}
                                            onChange={e => setFormData({ ...formData, start: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 italic">
                                        {selectedItem.status === 'UNASSIGNED'
                                            ? 'Assigning a date will move this task to PENDING status.'
                                            : 'Changing the date will update the work schedule.'}
                                    </p>
                                    <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 group"
                                            onClick={() => navigate(`/services?search=${selectedItem.title}`)}
                                        >
                                            View Full Service Record
                                            <ExternalLink size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Title</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-textarea"
                                            rows={2}
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label className="form-label">Start</label>
                                            <input
                                                type="datetime-local"
                                                className="form-input"
                                                value={formData.start}
                                                onChange={e => setFormData({ ...formData, start: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">End</label>
                                            <input
                                                type="datetime-local"
                                                className="form-input"
                                                value={formData.end}
                                                onChange={e => setFormData({ ...formData, end: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="modal-footer flex justify-between">
                            <div className="flex gap-2">
                                <button className="btn btn-outline-danger flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 transition-colors rounded-lg border border-red-200 dark:border-red-900/50" onClick={handleDeleteItem} disabled={isSaving}>
                                    <Trash2 size={16} />
                                    <span className="text-sm font-semibold">Delete</span>
                                </button>
                                <button
                                    className={`btn flex items-center gap-2 transition-colors rounded-lg border ${(selectedItem.status === 'RESOLVED' || selectedItem.status === 'DONE') ? 'text-slate-500 border-slate-200 bg-slate-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}
                                    onClick={handleToggleTaskStatus}
                                    disabled={isSaving || selectedItem.status === 'UNASSIGNED'}
                                >
                                    <CheckCircle2 size={16} />
                                    <span className="text-sm font-semibold">{(selectedItem.status === 'RESOLVED' || selectedItem.status === 'DONE') ? 'Mark as Not Done' : 'Submit Visit Report'}</span>
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Close</button>
                                {selectedItem.type === 'TASK' ? (
                                    <button className="btn btn-primary bg-indigo-600 hover:bg-indigo-700" onClick={handleReprogramTask} disabled={isSaving || !formData.start}>
                                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : (selectedItem.status === 'UNASSIGNED' ? 'Assign Date' : 'Update Schedule')}
                                    </button>
                                ) : (
                                    <button className="btn btn-primary" onClick={handleUpdateEvent} disabled={isSaving || !formData.title}>
                                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
