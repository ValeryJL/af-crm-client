import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    Menu, User, LayoutDashboard, Moon, Sun, LogOut, Settings as SettingsIcon,
    Building2, Wrench, HardHat, FileText, Search, Bell, Shield, 
    ChevronRight, ChevronLeft, Gauge, CheckSquare
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CommandPalette } from '../components/CommandPalette';
import { crmApi } from '../api/crm';
import afLogo from '../assets/logo-af.png';

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
        if (!role) return 'Invitado';
        if (role === 'SUPER_ADMIN') return 'Super Admin';
        if (role === 'ADMIN') return 'Administrador';
        if (role === 'TECH') return 'Técnico de Campo';
        return role;
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

    const navSections = [
        {
            title: "Operaciones & SLA",
            items: [
                { to: "/", icon: LayoutDashboard, label: "Centro de Control SLA", badge: alertsCount > 0 ? alertsCount : null },
                { to: "/work-orders", icon: FileText, label: "Órdenes de Trabajo" },
            ]
        },
        {
            title: "Catálogo & Activos",
            items: [
                { to: "/clients", icon: Building2, label: "Clientes (Visión 360°)" },
                { to: "/services", icon: Wrench, label: "Sedes & Contratos" },
                { to: "/equipments", icon: HardHat, label: "Parque de Equipos" },
            ]
        },
        {
            title: "Sistema & Equipo",
            items: [
                { to: "/users", icon: User, label: "Técnicos & Usuarios" },
                { to: "/settings", icon: SettingsIcon, label: "Ajustes del Sistema" },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
            <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />

            {/* Top Navbar */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)} 
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                        title="Alternar Menú Lateral"
                    >
                        <Menu size={20} />
                    </button>

                    <Link to="/" className="flex items-center gap-3 group">
                        <img 
                            src={afLogo} 
                            alt="AF Construcciones" 
                            className="h-9 w-auto object-contain filter dark:brightness-110 drop-shadow-sm" 
                        />
                        <div className="hidden sm:block">
                            <span className="font-heading font-extrabold text-lg tracking-tight text-slate-800 dark:text-slate-100 block leading-tight">
                                AF <span className="text-sky-600 dark:text-sky-400 font-bold">CRM</span>
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-400 block -mt-0.5">
                                Servicios Electromecánicos
                            </span>
                        </div>
                    </Link>

                    {/* Quick Search trigger (Ctrl+K) */}
                    <button
                        onClick={() => setPaletteOpen(true)}
                        className="hidden md:flex items-center gap-2.5 ml-6 px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all text-xs"
                    >
                        <Search size={14} className="text-slate-400" />
                        <span>Buscar clientes, servicios, comandos...</span>
                        <kbd className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 font-semibold shadow-2xs">Ctrl K</kbd>
                    </button>
                </div>

                {/* Right Profile & Alert Section */}
                <div className="flex items-center gap-3" ref={dropdownRef}>
                    <button
                        onClick={() => navigate('/')}
                        title="Alertas SLA Activas"
                        className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors"
                    >
                        <Bell size={20} />
                        {alertsCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                                {alertsCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
                        className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors"
                    >
                        {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
                    </button>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

                    <div className="hidden sm:flex flex-col text-right">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100 leading-tight">{user?.name || 'Usuario'}</span>
                        <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">{getRoleDisplayName(user?.role)}</span>
                    </div>

                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-800 dark:bg-slate-700 text-white font-heading font-bold text-sm shadow-sm hover:ring-2 hover:ring-sky-500 transition-all"
                    >
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute right-4 top-14 mt-1 w-56 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-fade-in">
                            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/40">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user?.name || 'Usuario'}</p>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">{user?.email || 'usuario@af.com.ar'}</p>
                            </div>
                            <div className="p-1.5 space-y-0.5">
                                <Link
                                    to="/settings"
                                    onClick={() => setDropdownOpen(false)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg transition-colors"
                                >
                                    <SettingsIcon size={15} className="text-slate-400" />
                                    <span>Configuración</span>
                                </Link>
                                <div className="h-px bg-slate-100 dark:bg-slate-700/60 my-1"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                                >
                                    <LogOut size={15} />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Application Body */}
            <div className="flex flex-1 overflow-hidden relative">
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* NuSA / AF Clean Structured Sidebar */}
                <aside className={`
                    fixed inset-y-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col text-slate-700 dark:text-slate-300 shadow-md transition-all duration-200
                    ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-18'}
                    lg:relative
                `}>
                    <nav className="p-3 space-y-5 flex-1 overflow-y-auto">
                        {navSections.map((section, idx) => (
                            <div key={idx} className="space-y-1">
                                {sidebarOpen && (
                                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 px-3 py-1">
                                        {section.title}
                                    </div>
                                )}
                                {section.items.map((item) => {
                                    const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
                                    return (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            title={item.label}
                                            onClick={() => {
                                                if (window.innerWidth < 1024) setSidebarOpen(false);
                                            }}
                                            className={`flex items-center ${sidebarOpen ? 'justify-between px-3 py-2.5' : 'justify-center p-2.5'} rounded-lg font-medium text-xs transition-all ${
                                                isActive
                                                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'} />
                                                {sidebarOpen && <span className="truncate">{item.label}</span>}
                                            </div>
                                            {sidebarOpen && item.badge && (
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                                    isActive ? 'bg-white text-sky-700' : 'bg-rose-500 text-white'
                                                }`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 text-center flex items-center justify-between">
                        {sidebarOpen && (
                            <>
                                <span className="font-bold text-slate-600 dark:text-slate-400">AF Construcciones</span>
                                <span className="font-mono text-[10px]">v2.2-soberana</span>
                            </>
                        )}
                    </div>
                </aside>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-950/40 relative">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
