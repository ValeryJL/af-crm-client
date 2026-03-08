import { useState } from 'react';
import { Plus, Loader2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { PremiumCalendar } from '../components/PremiumCalendar';

export function CalendarView() {
    const { user } = useAuth();
    const [isEventualModalOpen, setIsEventualModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Form state (Simplified for example)
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [desc, setDesc] = useState('');

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiClient.post('/calendar/events', {
                title,
                description: desc,
                start: new Date(date).toISOString(),
                end: new Date(date).toISOString(),
                allDay: true
            });
            setIsEventualModalOpen(false);
            setTitle('');
            setDate('');
            setDesc('');
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Failed to create event', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 shrink-0 mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Schedule</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Custom premium calendar powered by Vanilla CSS</p>
                </div>
                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                    <button
                        onClick={() => setIsEventualModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto">
                        <Plus size={20} />
                        <span>New Event</span>
                    </button>
                )}
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
                <PremiumCalendar refreshTrigger={refreshTrigger} />
            </div>

            {/* Simple Create Modal */}
            {isEventualModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Add Event</h2>
                            <button onClick={() => setIsEventualModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Title</label>
                                <input required className="w-full px-4 py-2 border dark:border-slate-700 dark:bg-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={title} onChange={e => setTitle(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Date</label>
                                <input type="date" required className="w-full px-4 py-2 border dark:border-slate-700 dark:bg-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={date} onChange={e => setDate(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Description</label>
                                <textarea className="w-full px-4 py-2 border dark:border-slate-700 dark:bg-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" rows={3} value={desc} onChange={e => setDesc(e.target.value)} />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setIsEventualModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                                    {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
