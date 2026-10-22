import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    Menu, User, LayoutDashboard, Moon, LogOut, Settings as SettingsIcon,
    Building2, Wrench, HardHat, FileText, Search, Bell
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CommandPalette } from '../components/CommandPalette';
import { crmApi } from '../api/crm';
import type { SlaAlertDto } from '../api/crm';

export function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [alertsCount, setAlertsCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user, logout, theme, toggleTheme } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const getRoleDisplayName = (role: string | undefined) => {
        if (!role) return 'Guest';
        if (role === 'SUPER_ADMIN') return 'Super Admin';
        return role.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await crmApi.getAlerts();
                setAlertsCount(res.data.length);
            } catch (e) {
                // Ignore silent
            }
        };
        fetchAlerts();
    }, [location.pathname]);

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

    const navItems = [
        { to: "/", icon: LayoutDashboard, label: "Dashboard SLA", badge: alertsCount > 0 ? alertsCount : null },
        { to: "/clients", icon: Building2, label: "Clientes" },
        { to: "/services", icon: Wrench, label: "Servicios" },
        { to: "/equipments", icon: HardHat, label: "Equipos" },
        { to: "/work-orders", icon: FileText, label: "Órdenes de Trabajo" },
        { to: "/users", icon: User, label: "Técnicos & Usuarios" },
        { to: "/settings", icon: SettingsIcon, label: "Configuración" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans transition-colors duration-200">
            <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />

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

                    {/* Quick Search trigger (Ctrl+K) */}
                    <button
                        onClick={() => setPaletteOpen(true)}
                        className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700/60 transition-all text-xs"
                    >
                        <Search size={14} />
                        <span>Buscar o comandos...</span>
                        <kbd className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded shadow-sm text-[10px] text-slate-500">Ctrl K</kbd>
                    </button>
                </div>

                <div className="flex items-center gap-3 relative" ref={dropdownRef}>
                    <button
                        onClick={() => navigate('/')}
                        title="Alertas SLA"
                        className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
                    >
                        <Bell size={20} />
                        {alertsCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                                {alertsCount}
                            </span>
                        )}
                    </button>

                    <div className="hidden md:flex flex-col text-right">
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight leading-none">{user?.name || 'User'}</p>
                        <p className="text-indigo-600 dark:text-indigo-400 text-[9px] font-black tracking-widest mt-0.5">{getRoleDisplayName(user?.role)}</p>
                    </div>

                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-sm"
                    >
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 top-12 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-100 dark:border-slate-700/50 py-1 z-50 animate-fade-in overflow-hidden">
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
                                    <span>Ajustes de Cuenta</span>
                                </Link>
                                <button
                                    onClick={toggleTheme}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
                                >
                                    <Moon size={16} />
                                    <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
                                </button>
                                <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1 mx-2"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                                >
                                    <LogOut size={16} />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Body segment */}
            <div className="flex flex-1 overflow-hidden relative">
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
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.to;
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => {
                                        if (window.innerWidth < 1024) setSidebarOpen(false);
                                    }}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all group ${
                                        isActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                            : 'hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white text-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400 transition-colors'} />
                                        <span className={`${!sidebarOpen && 'lg:hidden'}`}>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                            isActive ? 'bg-white text-indigo-600' : 'bg-rose-500 text-white'
                                        }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-800 dark:border-slate-900/50 text-xs text-slate-500 text-center">
                        AF-CRM v2.0-MVP
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
