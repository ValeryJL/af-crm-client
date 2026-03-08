import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Menu, User, LayoutDashboard, Wrench, Calendar as CalendarIcon, FileSpreadsheet, Moon, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user, logout, theme, toggleTheme } = useAuth();
    const navigate = useNavigate();

    const getRoleDisplayName = (role: string | undefined) => {
        if (!role) return 'Guest';
        if (role === 'SUPER_ADMIN') return 'Super Admin';
        return role.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans transition-colors duration-200">
            {/* Navbar segment */}
            <header className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.15)] dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)] z-20 sticky top-0 h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-lg transition-colors active:scale-95">
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-200">
                            AF
                        </div>
                        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-800 to-blue-600 bg-clip-text text-transparent hidden sm:block">AF-CRM</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative" ref={dropdownRef}>
                    {/* PC View: Icons in nav when sidebar is closed */}
                    {!sidebarOpen && (
                        <div className="hidden lg:flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-100 dark:border-slate-700/50 mr-2">
                            {[
                                { to: "/", icon: LayoutDashboard, label: "Dashboard", color: "text-indigo-500" },
                                { to: "/users", icon: User, label: "Users", color: "text-amber-500" },
                                { to: "/services", icon: Wrench, label: "Services", color: "text-emerald-500" },
                                { to: "/calendar", icon: CalendarIcon, label: "Calendar", color: "text-sky-500" },
                                { to: "/reports", icon: FileSpreadsheet, label: "Reports", color: "text-purple-500" }
                            ].map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    title={item.label}
                                    className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all hover:scale-110 active:scale-95 group"
                                >
                                    <item.icon size={18} className={`${item.color} opacity-80 group-hover:opacity-100`} />
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="hidden md:flex flex-col text-right">
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight leading-none">{user?.name || 'User'}</p>
                        <p className="text-indigo-600 dark:text-indigo-400 text-[9px] font-black tracking-widest mt-0.5">{getRoleDisplayName(user?.role)}</p>
                    </div>

                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all outline-none border-2 ${dropdownOpen ? 'border-indigo-500 shadow-md shadow-indigo-200 dark:shadow-indigo-900/50 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'} active:scale-95`}
                    >
                        {user?.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute top-12 right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in-down origin-top-right z-50">
                            <div className="p-4 border-b border-slate-50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">{user?.email || 'user@example.com'}</p>
                            </div>
                            <div className="p-2 space-y-1">
                                <Link
                                    to="/settings"
                                    onClick={() => setDropdownOpen(false)}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
                                >
                                    <SettingsIcon size={16} />
                                    <span>Account Settings</span>
                                </Link>
                                <button
                                    onClick={toggleTheme}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
                                >
                                    <Moon size={16} />
                                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                                </button>
                                <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1 mx-2"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                                >
                                    <LogOut size={16} />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Body segment */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Backdrop for mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`
                    fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 dark:bg-slate-950 border-r border-slate-800 dark:border-slate-900 flex flex-col text-slate-300 shadow-xl transition-transform duration-300 transform
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:relative lg:translate-x-0 ${sidebarOpen ? 'lg:w-64' : 'lg:w-0'}
                `}>
                    <nav className="p-4 space-y-1.5 flex-1 mt-2">
                        {[
                            { to: "/", icon: LayoutDashboard, label: "Dashboard", color: "indigo" },
                            { to: "/users", icon: User, label: "Users", color: "amber" },
                            { to: "/services", icon: Wrench, label: "Services", color: "emerald" },
                            { to: "/calendar", icon: CalendarIcon, label: "Calendar", color: "sky" },
                            { to: "/reports", icon: FileSpreadsheet, label: "Reports", color: "purple" }
                        ].map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={() => {
                                    if (window.innerWidth < 1024) setSidebarOpen(false);
                                }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white font-medium transition-all group"
                            >
                                <item.icon size={20} className={`text-slate-400 group-hover:text-${item.color}-400 transition-colors`} />
                                <span className={`${!sidebarOpen && 'lg:hidden'}`}>{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-slate-800 dark:border-slate-900/50 text-xs text-slate-500 text-center">
                        AF-CRM v1.0.0
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 dark:bg-slate-900 relative transition-colors duration-200">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
