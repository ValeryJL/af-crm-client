import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import apiClient from '../api/client';

export function Dashboard() {
    const [stats, setStats] = useState<{
        activeServicesCount: number | '-';
        availableTechniciansCount: number | '-';
        pendingTasksCount: number | '-';
    }>({
        activeServicesCount: '-',
        availableTechniciansCount: '-',
        pendingTasksCount: '-'
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        apiClient.get('/stats/dashboard')
            .then(res => {
                setStats(res.data);
            })
            .catch(err => {
                console.error('Failed to fetch dashboard stats', err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const { activeServicesCount, availableTechniciansCount, pendingTasksCount } = stats;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 transition-colors duration-200">Dashboard</h1>

            {isLoading ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col gap-2 transition-all hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900 duration-200">
                        <h3 className="text-gray-500 dark:text-slate-400 font-medium transition-colors duration-200">Pending Tasks</h3>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{pendingTasksCount}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col gap-2 transition-all hover:shadow-md hover:border-green-100 dark:hover:border-green-900 duration-200">
                        <h3 className="text-gray-500 dark:text-slate-400 font-medium transition-colors duration-200">Active Services</h3>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{activeServicesCount}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col gap-2 transition-all hover:shadow-md hover:border-purple-100 dark:hover:border-purple-900 duration-200">
                        <h3 className="text-gray-500 dark:text-slate-400 font-medium transition-colors duration-200">Available Techs</h3>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{availableTechniciansCount}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
