import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    Menu, User, LayoutDashboard, Moon, Sun, LogOut, Settings as SettingsIcon,
    Building2, Wrench, HardHat, FileText, Search, Bell, X
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
        <div className="min-h-screen bg-[#f1f3f5] dark:bg-[#141517] flex flex-col font-sans transition-colors duration-150">
            <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />

            {/* Barra de Título Superior en Color de Acento AF / Charcoal */}
            <header className="bg-[#2d3033] dark:bg-[#1c1d1f] text-white border-b border-[#3f4246] dark:border-[#2a2c2e] sticky top-0 z-30 h-14 flex items-center justify-between px-3 sm:px-5 shadow-xs">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)} 
                        className="p-1.5 hover:bg-white/10 text-slate-300 hover:text-white rounded-none transition-colors"
                        title="Alternar Menú Lateral"
                    >
                        <Menu size={19} />
                    </button>

                    <Link to="/" className="flex items-center gap-2.5">
                        <img 
                            src={afLogo} 
                            alt="AF Construcciones" 
                            className="h-7 w-auto object-contain filter brightness-110" 
                        />
                        <div className="flex items-center gap-2">
                            <span className="font-heading font-black text-base tracking-tight text-white leading-none">
                                AF<span className="text-amber-500 font-extrabold ml-1">CRM</span>
                            </span>
                            <span className="hidden sm:inline-block px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold uppercase rounded-none border border-amber-500/30">
                                Electromecánica
                            </span>
                        </div>
                    </Link>

                    {/* Buscador Rápido Ctrl+K */}
                    <button
                        onClick={() => setPaletteOpen(true)}
                        className="hidden md:flex items-center gap-2.5 ml-6 px-3 py-1 rounded-none bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-all text-xs"
                    >
                        <Search size={13} className="text-slate-400" />
                        <span className="text-[11px]">Buscar comandos, clientes, equipos...</span>
                        <kbd className="font-mono bg-black/30 px-1 py-0.2 rounded-none border border-white/10 text-[9px] text-slate-300">Ctrl K</kbd>
                    </button>
                </div>

                {/* Zona de Perfil y Alertas */}
                <div className="flex items-center gap-2" ref={dropdownRef}>
                    <button
                        onClick={() => navigate('/')}
                        title="Alertas SLA Activas"
                        className="relative p-1.5 rounded-none text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <Bell size={18} />
                        {alertsCount > 0 && (
                            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                                {alertsCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                        className="p-1.5 rounded-none text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
                    </button>

                    <div className="h-5 w-px bg-white/20 mx-1"></div>

                    <div className="hidden sm:flex flex-col text-right">
                        <span className="font-bold text-xs text-white leading-tight">{user?.name || 'Usuario'}</span>
                        <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">{getRoleDisplayName(user?.role)}</span>
                    </div>

                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="w-8 h-8 rounded-none flex items-center justify-center bg-amber-600 hover:bg-amber-500 text-white font-heading font-black text-xs transition-colors"
                    >
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                    </button>

                    {/* Menú Dropdown */}
                    {dropdownOpen && (
                        <div className="absolute right-3 top-12 mt-1 w-52 rounded-none bg-[#242628] text-white shadow-2xl border border-[#3f4246] py-1 z-50 animate-fade-in">
                            <div className="px-3 py-2 border-b border-[#3f4246] bg-black/20">
                                <p className="text-xs font-bold truncate text-white">{user?.name || 'Usuario'}</p>
                                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'usuario@af.com.ar'}</p>
                            </div>
                            <div className="p-1 space-y-0.5">
                                <Link
                                    to="/settings"
                                    onClick={() => setDropdownOpen(false)}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-white/10 rounded-none transition-colors"
                                >
                                    <SettingsIcon size={14} className="text-slate-400" />
                                    <span>Configuración</span>
                                </Link>
                                <div className="h-px bg-[#3f4246] my-1"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-none transition-colors"
                                >
                                    <LogOut size={14} />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Layout Principal: Menú Lateral Fijo sin Scroll General del Body */}
            <div className="flex flex-1 overflow-hidden relative">
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Menú Lateral Industrial Gris Carbón & Acento AF (Ámbar) */}
                <aside className={`
                    fixed inset-y-0 left-0 z-40 bg-[#3a3b3b] dark:bg-[#1e2022] text-slate-200 border-r border-[#4d5053] dark:border-[#2a2c2e] flex flex-col shadow-lg transition-all duration-150
                    ${sidebarOpen ? 'w-60 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-16'}
                    lg:relative
                `}>
                    <nav className="p-2 space-y-4 flex-1 overflow-y-auto">
                        {navSections.map((section, idx) => (
                            <div key={idx} className="space-y-1">
                                {sidebarOpen && (
                                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-2.5 py-1">
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
                                            className={`flex items-center ${sidebarOpen ? 'justify-between px-3 py-2' : 'justify-center p-2'} rounded-none font-medium text-xs transition-all ${
                                                isActive
                                                    ? 'bg-[#d97706] text-white font-bold shadow-xs'
                                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <item.icon size={16} className={isActive ? 'text-white' : 'text-slate-300'} />
                                                {sidebarOpen && <span className="truncate">{item.label}</span>}
                                            </div>
                                            {sidebarOpen && item.badge && (
                                                <span className={`px-1.5 py-0.2 rounded-none text-[10px] font-mono font-bold ${
                                                    isActive ? 'bg-black/30 text-white' : 'bg-rose-600 text-white'
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

                    {/* Footer Lateral */}
                    <div className="p-2.5 border-t border-[#4d5053] dark:border-[#2a2c2e] text-[10px] text-slate-400 bg-black/20 flex items-center justify-between">
                        {sidebarOpen ? (
                            <>
                                <span className="font-bold text-slate-300">AF Construcciones</span>
                                <span className="font-mono text-[9px] text-amber-400">v2.3-industrial</span>
                            </>
                        ) : (
                            <span className="font-bold text-center w-full text-amber-400">AF</span>
                        )}
                    </div>
                </aside>

                {/* Área de Trabajo Principal */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f1f3f5] dark:bg-[#141517] relative">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
