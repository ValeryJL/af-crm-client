import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, eachDayOfInterval, addDays, startOfDay, addHours, isWithinInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, X, Clock, Trash2, CheckCircle2, ExternalLink, AlertCircle, Sparkles } from 'lucide-react';
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
    status?: 'UNASSIGNED' | 'PENDING' | 'RESOLVED' | 'OVERDUE' | 'DONE';
    scheduledDate?: Date;
    color?: string;
    serviceId?: number;
    periodDate?: string;
}

interface PremiumCalendarProps {
    refreshTrigger?: number;
}

type CalendarView = 'month' | 'week' | 'agenda';

export const PremiumCalendar: React.FC<PremiumCalendarProps> = ({ refreshTrigger = 0 }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [items, setItems] = useState<CalendarItem[]>([]);
    const [unassignedTasks, setUnassignedTasks] = useState<CalendarItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<CalendarView>('week');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    // Drag and Drop state
    const [draggedTask, setDraggedTask] = useState<CalendarItem | null>(null);
    const [dragOverCell, setDragOverCell] = useState<string | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start: '',
        end: '',
        allDay: false,
        type: 'EVENT' as 'EVENT' | 'TASK',
        taskType: 'MAINTENANCE' as 'MAINTENANCE' | 'SERVICE' | 'EVENTUAL',
        serviceId: '' as string | number
    });
    const [availableServices, setAvailableServices] = useState<any[]>([]);

    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            setView('agenda');
        }
    }, []);

    useEffect(() => {
        fetchData();
        fetchServices();
    }, [currentDate, refreshTrigger, view]);

    const fetchServices = async () => {
        try {
            const res = await apiClient.get('/services');
            setAvailableServices(res.data);
        } catch (err) {
            console.error('Failed to fetch services', err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            let start, end;
            if (view === 'month') {
                start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
                end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
            } else if (view === 'week') {
                start = startOfWeek(currentDate, { weekStartsOn: 1 });
                end = endOfWeek(currentDate, { weekStartsOn: 1 });
            } else {
                start = startOfDay(currentDate);
                end = addDays(start, 7);
            }

            const rangeParams = {
                start: format(start, 'yyyy-MM-dd'),
                end: format(end, 'yyyy-MM-dd'),
            };

            // Fetch unassigned for the WHOLE MONTH to ensure Monthly/15-day tasks
            // are visible in any week of the month.
            const unassignedRange = {
                start: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
                end: format(endOfMonth(currentDate), 'yyyy-MM-dd'),
            };

            const [allRes, unassignedRes] = await Promise.allSettled([
                apiClient.get('/calendar', { params: rangeParams }),
                apiClient.get('/calendar/tasks/unassigned', { params: unassignedRange })
            ]);

            let mappedEvents: CalendarItem[] = [];
            let mappedAssignedTasks: CalendarItem[] = [];
            let mappedUnassignedTasks: CalendarItem[] = [];

            // 1. Process Assigned Events & Tasks
            if (allRes.status === 'fulfilled') {
                const data = allRes.value.data;
                console.log('Calendar Data Received:', data);

                // Handle both structured {events, tasks} and flat array responses
                const isStructured = data && (data.events || data.tasks);

                // If structured, use explicitly named lists. If flat, split by property/type.
                const rawEvents = isStructured ? (data.events || []) : (Array.isArray(data) ? data.filter((item: any) => item.type === 'EVENT' || (!item.serviceId && !item.idServicio && !item.fechaProgramada)) : []);
                const rawTasks = isStructured ? (data.tasks || []) : (Array.isArray(data) ? data.filter((item: any) => item.type === 'TASK' || item.serviceId || item.idServicio || item.fechaProgramada || item.scheduledDate) : []);

                mappedEvents = rawEvents.map((e: any) => {
                    const dateVal = e.start || e.fecha || e.fechaProgramada || e.scheduledDate || e.date;
                    const startDate = dateVal ? new Date(dateVal) : new Date();

                    return {
                        id: e.id,
                        title: e.title || e.nombre || 'Event',
                        description: e.description || e.observaciones || '',
                        start: startDate,
                        end: e.end ? new Date(e.end) : undefined,
                        allDay: e.allDay ?? false,
                        type: 'EVENT',
                        status: e.status,
                        color: e.color || '#6366f1'
                    };
                }).filter((e: any) => !isNaN(e.start.getTime()));

                mappedAssignedTasks = rawTasks.map((t: any) => {
                    const dateVal = t.fechaProgramada || t.scheduledDate || t.fecha || t.date;
                    const scheduledDate = dateVal ? new Date(dateVal) : null;
                    const status = (t.status || 'PENDING').toString().toUpperCase() as CalendarItem['status'];
                    const isOverdue = status === 'PENDING' && scheduledDate && scheduledDate < new Date();

                    return {
                        id: t.id,
                        title: t.serviceName || t.nombre || t.title || t.cliente || 'Technical Visit',
                        description: t.description || `Client: ${t.cliente || t.clientName || 'N/A'} | Equipment: ${t.equipo || t.equipment || 'N/A'}`,
                        start: scheduledDate || new Date(0),
                        allDay: !dateVal,
                        type: 'TASK',
                        status: isOverdue ? 'OVERDUE' : status,
                        color: status === 'RESOLVED' || status === 'DONE' ? '#10b981' : (isOverdue || status === 'OVERDUE' ? '#ef4444' : '#3b82f6'),
                        serviceId: t.serviceId || t.idServicio,
                        scheduledDate: scheduledDate || undefined,
                        periodDate: t.periodDate
                    };
                }).filter((t: any) => t.start.getTime() > 0);
            }

            // 2. Process Unassigned Tasks
            if (unassignedRes.status === 'fulfilled') {
                const data = unassignedRes.value.data;
                const unassignedList = Array.isArray(data) ? data : (Array.isArray(data.tasks) ? data.tasks : []);

                mappedUnassignedTasks = unassignedList.map((t: any) => ({
                    id: t.id,
                    title: t.serviceName || t.nombre || t.title || 'Floating Task',
                    description: t.description || `Client: ${t.cliente || t.clientName || 'N/A'} | Equipment: ${t.equipo || t.equipment || 'N/A'}`,
                    start: t.periodDate ? new Date(t.periodDate) : new Date(),
                    allDay: true,
                    type: 'TASK',
                    status: 'UNASSIGNED',
                    color: '#f59e0b',
                    serviceId: t.serviceId || t.idServicio,
                    periodDate: t.periodDate
                })).filter((t: any) => {
                    // Smart filtering: Decide if this unassigned task should be visible in CURRENT VIEW
                    if (!t.periodDate) return true;
                    const pDate = new Date(t.periodDate);

                    // 1. If it's a Weekly task (periodDate is within visible week)
                    if (isWithinInterval(pDate, { start, end })) return true;

                    // 2. If it's a Monthly or 15-day task (Long periods)
                    const dayNum = pDate.getDate();
                    if (dayNum === 1 || dayNum === 16) {
                        // Monthly (Day 1): Show in all weeks of the same month
                        if (dayNum === 1 && isSameMonth(pDate, currentDate)) return true;

                        // Quincenal (Day 16): Show only in the second half of the month
                        // (We check if our current view's start date is on or after the 16th,
                        // or if any day in our visible week range is >= 16)
                        if (dayNum === 16 && isSameMonth(pDate, currentDate)) {
                            const endDay = end.getDate();
                            return endDay >= 16;
                        }
                    }

                    return false;
                });
            }

            setItems([...mappedEvents, ...mappedAssignedTasks]);
            setUnassignedTasks(mappedUnassignedTasks);

            console.log(`Loaded ${mappedEvents.length} events, ${mappedAssignedTasks.length} assigned tasks, and ${mappedUnassignedTasks.length} unassigned tasks.`);

        } catch (error) {
            console.error('Error fetching calendar data:', error);
            setItems([]);
            setUnassignedTasks([]);
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

    // Drag and Drop Handlers
    const handleDragStart = (task: CalendarItem) => {
        setDraggedTask(task);
    };

    const handleDragOver = (e: React.DragEvent, cellId: string) => {
        e.preventDefault();
        setDragOverCell(cellId);
    };

    const handleDrop = async (date: Date) => {
        setDragOverCell(null);
        if (!draggedTask) return;

        setIsSaving(true);
        try {
            const localIsoDate = format(date, "yyyy-MM-dd'T'HH:mm:ss");

            if (draggedTask.type === 'TASK') {
                const isUnassigned = draggedTask.status === 'UNASSIGNED';
                const endpoint = isUnassigned
                    ? `/calendar/services/${draggedTask.serviceId}/assign-smart`
                    : `/calendar/tasks/${draggedTask.id}/reprogram`;

                await apiClient.patch(endpoint, {
                    fechaProgramada: localIsoDate,
                    newDate: localIsoDate
                });
            } else if (draggedTask.type === 'EVENT') {
                // For regular events, we use the standard PUT update
                // We preserve original metadata while updating the start/end
                const duration = draggedTask.end ? draggedTask.end.getTime() - draggedTask.start.getTime() : 3600000; // default 1h
                const newEnd = new Date(date.getTime() + duration);

                await apiClient.put(`/calendar/events/${draggedTask.id}`, {
                    title: draggedTask.title,
                    description: draggedTask.description,
                    start: localIsoDate,
                    end: format(newEnd, "yyyy-MM-dd'T'HH:mm:ss"),
                    allDay: draggedTask.allDay,
                    color: draggedTask.color
                });
            }

            setDraggedTask(null);
            fetchData();
        } catch (error) {
            console.error('Drop failed:', error);
            alert('Failed to update schedule. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDayClick = (date: Date) => {
        const start = new Date(date);
        const now = new Date();
        start.setHours(now.getHours() + 1, 0, 0, 0);
        const end = addHours(start, 1);

        setFormData({
            title: '',
            description: '',
            start: format(start, "yyyy-MM-dd'T'HH:mm"),
            end: format(end, "yyyy-MM-dd'T'HH:mm"),
            allDay: false,
            type: 'EVENT',
            taskType: 'MAINTENANCE',
            serviceId: ''
        });
        setShowCreateModal(true);
    };

    const handleItemClick = (e: React.MouseEvent, item: CalendarItem) => {
        e.stopPropagation();
        setSelectedItem(item);
        setFormData({
            title: item.title,
            description: item.description || '',
            start: item.start.getTime() > 0 ? format(item.start, "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            end: item.end ? format(item.end, "yyyy-MM-dd'T'HH:mm") : '',
            allDay: item.allDay,
            type: item.type,
            taskType: 'MAINTENANCE',
            serviceId: item.serviceId || ''
        });
        setShowEditModal(true);
    };

    const handleSaveEvent = async () => {
        setIsSaving(true);
        try {
            if (formData.type === 'TASK') {
                if (!formData.serviceId) {
                    alert('Please select a service for this manual task.');
                    return;
                }
                await apiClient.post(`/services/${formData.serviceId}/tasks/manual`, {
                    type: formData.taskType,
                    fechaProgramada: formData.start // Use local string directly
                });
            } else {
                await apiClient.post('/calendar/events', {
                    title: formData.title,
                    description: formData.description,
                    start: formData.start,
                    end: formData.end || null,
                    allDay: formData.allDay
                });
            }
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
            // Use the direct local value from input to avoid timezone shift (+3h problem)
            const targetDate = formData.start;

            const isUnassigned = selectedItem.status === 'UNASSIGNED';
            const endpoint = isUnassigned
                ? `/calendar/services/${selectedItem.serviceId}/assign-smart`
                : `/calendar/tasks/${selectedItem.id}/reprogram`;

            await apiClient.patch(endpoint, {
                fechaProgramada: targetDate,
                newDate: targetDate
            });
            setShowEditModal(false);
            fetchData();
        } catch (error) {
            console.error('Error reprogramming task:', error);
            alert('Failed to reprogram task. Please ensure the date/time is valid.');
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
                start: formData.start,
                end: formData.end || null,
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
        const newStatus = (selectedItem.status === 'RESOLVED' || selectedItem.status === 'DONE') ? 'PENDING' : 'RESOLVED';

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
                <div className="flex flex-col flex-1">
                    <span className="text-lg md:text-xl font-bold leading-tight">
                        {window.innerWidth < 768
                            ? format(currentDate, view === 'month' ? 'MMM yy' : 'MMM d')
                            : format(currentDate, view === 'month' ? 'MMMM yyyy' : 'MMMM d, yyyy')}
                    </span>
                    <span className="text-[10px] md:text-xs text-indigo-500 font-black uppercase tracking-widest">{view} view</span>
                </div>
                {loading && <Loader2 size={18} className="animate-spin text-indigo-500" />}
            </div>

            <div className="calendar-header-actions">
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

    const renderPlanningBar = () => {
        if (view === 'agenda') return null;

        return (
            <div className="planning-bar">
                <div className="planning-bar-header">
                    <div className="planning-bar-title">
                        <Sparkles size={14} className="text-amber-500" />
                        Smart Planning: Floating Tasks
                        <span className="ml-2 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 rounded-full text-[10px]">
                            {unassignedTasks.length}
                        </span>
                    </div>
                </div>
                <div className="unassigned-tasks-list">
                    {unassignedTasks.length > 0 ? (
                        unassignedTasks.map(task => (
                            <div
                                key={`unassigned-${task.id}`}
                                draggable
                                onDragStart={() => handleDragStart(task)}
                                onClick={(e) => handleItemClick(e, task)}
                                className="unassigned-task-card"
                            >
                                <div className="unassigned-task-name">{task.title}</div>
                                <div className="unassigned-task-client">{task.description?.split('|')[0]}</div>
                                <div className="text-[9px] font-bold text-indigo-500 uppercase mt-1">
                                    {task.periodDate ? `Cycle: ${format(new Date(task.periodDate), 'MMM yyyy')}` : 'Ready to assign'}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center justify-center w-full py-2 text-slate-400 text-xs italic font-medium">
                            No unassigned tasks found for this period.
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderMonthCells = () => {
        const monthStart = startOfMonth(currentDate);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });
        const allDays = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div className="calendar-scroll-wrapper month-view-wrapper">
                <div className="calendar-days month-view">
                    {allDays.map((d) => {
                        const isCurrentMonth = isSameMonth(d, monthStart);
                        const dayItems = items.filter(item => isSameDay(item.start, d));
                        const cellId = `month-${d.getTime()}`;

                        return (
                            <div
                                key={d.toString()}
                                className={`calendar-day ${!isCurrentMonth ? "other-month" : ""} ${isSameDay(d, new Date()) ? "is-today" : ""} ${dragOverCell === cellId ? 'drag-over' : ''}`}
                                onClick={() => handleDayClick(d)}
                                onDragOver={(e) => handleDragOver(e, cellId)}
                                onDragLeave={() => setDragOverCell(null)}
                                onDrop={() => handleDrop(d)}
                            >
                                <span className="day-number">{format(d, 'd')}</span>
                                <div className="events-container">
                                    {dayItems.map((item: CalendarItem) => (
                                        <div
                                            key={`${item.type}-${item.id}`}
                                            draggable
                                            onDragStart={() => handleDragStart(item)}
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
        const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: startDate, end: endOfWeek(currentDate, { weekStartsOn: 1 }) });
        const hours = Array.from({ length: 24 }).map((_, i) => i);

        return (
            <div className="calendar-scroll-wrapper week-scroll-wrapper">
                <div className="calendar-days week-view">
                    <div className="time-col-header"></div>
                    {days.map(d => (
                        <div key={`header-${d.toString()}`} className={`day-header-cell ${isSameDay(d, new Date()) ? "is-today" : ""}`}>
                            <span className="day-name">{format(d, 'EEE')}</span>
                            <span className="day-number">{format(d, 'd')}</span>
                        </div>
                    ))}

                    {hours.map(hour => (
                        <React.Fragment key={`hour-row-${hour}`}>
                            <div className="time-label">
                                {`${hour.toString().padStart(2, '0')}:00`}
                            </div>
                            {days.map(d => {
                                const cellDate = new Date(d);
                                cellDate.setHours(hour, 0, 0, 0);
                                const cellId = `week-${d.getTime()}-${hour}`;

                                const cellItems = items.filter(item =>
                                    isSameDay(item.start, d) && item.start.getHours() === hour
                                );

                                return (
                                    <div
                                        key={cellId}
                                        className={`week-grid-cell ${dragOverCell === cellId ? 'drag-over' : ''}`}
                                        onClick={() => handleDayClick(cellDate)}
                                        onDragOver={(e) => handleDragOver(e, cellId)}
                                        onDragLeave={() => setDragOverCell(null)}
                                        onDrop={() => handleDrop(cellDate)}
                                    >
                                        <div className="events-container">
                                            {cellItems.map((item: CalendarItem) => (
                                                <div
                                                    key={`${item.type}-${item.id}`}
                                                    draggable
                                                    onDragStart={() => handleDragStart(item)}
                                                    className={`event-item ${item.type.toLowerCase()} ${item.status === 'RESOLVED' ? 'opacity-50 line-through' : ''}`}
                                                    style={{ borderLeftColor: item.color }}
                                                    onClick={(e) => handleItemClick(e, item)}
                                                >
                                                    <div className="event-time">{format(item.start, 'HH:mm')}</div>
                                                    <div className="font-bold flex items-center gap-1">
                                                        {item.status === 'RESOLVED' && <CheckCircle2 size={10} className="text-emerald-500" />}
                                                        {item.title}
                                                    </div>
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
            {items.sort((a, b) => a.start.getTime() - b.start.getTime()).map(item => (
                <div key={`${item.type}-${item.id}`} className="agenda-item flex gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80" onClick={(e) => handleItemClick(e, item)}>
                    <div className="agenda-date flex flex-col items-center justify-center min-w-[60px] border-r border-slate-100 dark:border-slate-700 pr-4">
                        <span className="text-xs font-bold text-indigo-500 uppercase">{format(item.start, 'EEE')}</span>
                        <span className="text-xl font-bold">{format(item.start, 'd')}</span>
                    </div>
                    <div className="agenda-item-content flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className={`font-bold flex items-center gap-2 ${item.status === 'RESOLVED' ? 'text-slate-400 line-through' : ''}`}>
                                <span className={`w-2 h-2 rounded-full`} style={{ background: item.color }}></span>
                                {item.status === 'RESOLVED' && <CheckCircle2 size={14} className="text-emerald-500" />}
                                {item.title}
                            </h3>
                            <span className="text-[10px] uppercase font-black bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md">{item.type}</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>
                        {item.end && (
                            <div className="mt-2 text-xs text-slate-400 dark:text-slate-500">
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
                {renderPlanningBar()}
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
                            <h2 className="modal-title">New Schedule Item</h2>
                            <button className="close-btn" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Item Type</label>
                                    <select
                                        className="form-select"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                    >
                                        <option value="EVENT">General Event</option>
                                        <option value="TASK">Technical Visit (Manual)</option>
                                    </select>
                                </div>
                                {formData.type === 'TASK' && (
                                    <div>
                                        <label className="form-label">Visit Type</label>
                                        <select
                                            className="form-select"
                                            value={formData.taskType}
                                            onChange={e => setFormData({ ...formData, taskType: e.target.value as any })}
                                        >
                                            <option value="MAINTENANCE">Maintenance</option>
                                            <option value="SERVICE">Annual Service</option>
                                            <option value="EVENTUAL">Eventual</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {formData.type === 'TASK' ? (
                                <div>
                                    <label className="form-label">Link to Service <span className="text-rose-500">*</span></label>
                                    <select
                                        className="form-select"
                                        value={formData.serviceId}
                                        onChange={e => setFormData({ ...formData, serviceId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select a service...</option>
                                        {availableServices.map(s => (
                                            <option key={s.id} value={s.id}>{s.cliente} - {s.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="form-label">Title <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Event title"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="form-label">Description / Details</label>
                                <textarea
                                    className="form-textarea"
                                    rows={2}
                                    placeholder="Add notes..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={formData.start}
                                        onChange={e => setFormData({ ...formData, start: e.target.value })}
                                    />
                                </div>
                                {formData.type === 'EVENT' && (
                                    <div>
                                        <label className="form-label">End Time (Optional)</label>
                                        <input
                                            type="datetime-local"
                                            className="form-input"
                                            value={formData.end}
                                            onChange={e => setFormData({ ...formData, end: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                            <button
                                className="btn btn-primary font-bold"
                                onClick={handleSaveEvent}
                                disabled={isSaving || (formData.type === 'EVENT' ? !formData.title : !formData.serviceId)}
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Confirm & Schedule'}
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
                                        <div className="font-bold text-lg mb-1 text-slate-800 dark:text-slate-100">{selectedItem.title}</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400 flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-indigo-400" />
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
                                    <div>
                                        <label className="form-label">{selectedItem.status === 'UNASSIGNED' ? 'Assign Date & Time' : 'Reprogram Date & Time'}</label>
                                        <input
                                            type="datetime-local"
                                            className="form-input"
                                            value={formData.start}
                                            onChange={e => setFormData({ ...formData, start: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                                        {selectedItem.status === 'UNASSIGNED'
                                            ? 'Assigning a date will move this task to PENDING status.'
                                            : 'Changing the date will update the work schedule.'}
                                    </p>
                                    <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 group"
                                            onClick={() => navigate(`/services/${selectedItem.serviceId}`)}
                                        >
                                            View Full Service Record
                                            <ExternalLink size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="form-group mb-4">
                                        <label className="form-label">Title</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group mb-4">
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
                                    <button className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 font-bold" onClick={handleReprogramTask} disabled={isSaving || !formData.start}>
                                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : (selectedItem.status === 'UNASSIGNED' ? 'Assign Date' : 'Update Schedule')}
                                    </button>
                                ) : (
                                    <button className="btn btn-primary font-bold" onClick={handleUpdateEvent} disabled={isSaving || !formData.title}>
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
