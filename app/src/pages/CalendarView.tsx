import { PremiumCalendar } from '../components/PremiumCalendar';

export function CalendarView() {
    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 shrink-0 mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Schedule</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your events and technical visits.</p>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <PremiumCalendar />
            </div>
        </div>
    );
}
