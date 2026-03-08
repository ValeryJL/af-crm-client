import { PremiumCalendar } from '../components/PremiumCalendar';

export function CalendarView() {
    return (
        <div className="flex flex-col h-[calc(100vh-7rem)] -mt-4 -mx-4 sm:-mx-8 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-hidden bg-white dark:bg-slate-900/50 sm:rounded-tl-2xl border-t border-l border-slate-100 dark:border-slate-800 shadow-sm">
                <PremiumCalendar />
            </div>
        </div>
    );
}
