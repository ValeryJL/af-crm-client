import React, { useState, useEffect } from 'react';
import { Search, Building2, Wrench, HardHat, FileText, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) onClose();
                else onClose(); // parent handles toggle
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const quickActions = [
        { label: 'Ir al Dashboard de Alertas', icon: HardHat, path: '/' },
        { label: 'Gestionar Clientes (360°)', icon: Building2, path: '/clients' },
        { label: 'Ver Servicios & Rutas', icon: Wrench, path: '/services' },
        { label: 'Órdenes de Trabajo (Kanban)', icon: FileText, path: '/work-orders' },
        { label: 'Inventario de Equipos & JSONB', icon: Wrench, path: '/equipments' },
        { label: 'Gestión de Técnicos & Usuarios', icon: HardHat, path: '/users' },
    ];

    const filtered = quickActions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

    const handleSelect = (path: string) => {
        navigate(path);
        onClose();
        setQuery('');
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
                <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        autoFocus
                        placeholder="Escribe para buscar comandos, clientes, servicios... (ESC para salir)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full px-3 py-4 bg-transparent outline-none text-slate-800 dark:text-slate-100 text-sm placeholder:text-slate-400"
                    />
                    <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-2 max-h-80 overflow-y-auto space-y-1">
                    <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Acciones Rápidas</div>
                    {filtered.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSelect(item.path)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                                <span>{item.label}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                    {filtered.length === 0 && (
                        <div className="p-4 text-center text-sm text-slate-400">
                            No se encontraron resultados para "{query}"
                        </div>
                    )}
                </div>

                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Navega con flechas o ratón</span>
                    <span className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">Ctrl + K</span>
                </div>
            </div>
        </div>
    );
}
