import { useState, useEffect } from 'react';
import { Loader2, Users, UserCheck, ShieldCheck, ArrowRight, UserPlus, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

export function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<{
        totalUsersCount: number | '-';
        activeUsersCount: number | '-';
        availableTechniciansCount: number | '-';
    }>({
        totalUsersCount: '-',
        activeUsersCount: '-',
        availableTechniciansCount: '-'
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

    const { totalUsersCount, activeUsersCount, availableTechniciansCount } = stats;

    return (
        <div className="space-y-8">
            {/* Header / Welcome Banner */}
            <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-600/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide uppercase mb-3">
                        <Shield size={14} /> Unified Core Active
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        Welcome back, {user?.name || 'Administrator'}!
                    </h1>
                    <p className="text-indigo-100 text-sm mt-1 max-w-xl">
                        Clean foundation initialized. User management, authentication, and customizable architecture ready for new service modules.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/users"
                        className="px-5 py-3 rounded-2xl bg-white text-indigo-700 font-bold text-sm shadow-md hover:bg-indigo-50 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <UserPlus size={16} />
                        <span>Manage Users</span>
                    </Link>
                </div>
            </div>

            {/* Metrics cards */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors duration-200">
                    System Overview
                </h2>

                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between transition-all hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900 duration-200">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Total Users</span>
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <Users size={20} />
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{totalUsersCount}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Registered members in system</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between transition-all hover:shadow-md hover:border-emerald-100 dark:hover:border-emerald-900 duration-200">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Active Members</span>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <UserCheck size={20} />
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{activeUsersCount}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Currently enabled & active</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between transition-all hover:shadow-md hover:border-amber-100 dark:hover:border-amber-900 duration-200">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Active Technicians</span>
                                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                    <ShieldCheck size={20} />
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{availableTechniciansCount}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Available for field operations</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions / Getting Started */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                    Quick Actions
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                    Manage team members, roles and invitations directly from the management console.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                        to="/users"
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-indigo-50/50 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between group transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                <Users size={22} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    Team Directory
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Inspect, filter and manage roles
                                </p>
                            </div>
                        </div>
                        <ArrowRight size={18} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </Link>

                    <Link
                        to="/settings"
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-sky-50/50 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between group transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                                <ShieldCheck size={22} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                    Account & Theme
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Google OAuth & Dark/Light mode
                                </p>
                            </div>
                        </div>
                        <ArrowRight size={18} className="text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
