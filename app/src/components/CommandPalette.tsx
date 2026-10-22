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
                else onClose();
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
        { label: 'Ir al Centro de Control SLA', icon: HardHat, path: '/' },
        { label: 'Gestionar Clientes (Visión 360°)', icon: Building2, path: '/clients' },
        { label: 'Sedes & Contratos de Servicios', icon: Wrench, path: '/services' },
        { label: 'Órdenes de Trabajo (Kanban)', icon: FileText, path: '/work-orders' },
        { label: 'Parque de Equipos & JSONB', icon: Wrench, path: '/equipments' },
        { label: 'Técnicos & Usuarios del Sistema', icon: HardHat, path: '/users' },
    ];

    const filtered = quickActions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

    const handleSelect = (path: string) => {
        navigate(path);
        onClose();
        setQuery('');
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-fade-in">
            <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none shadow-2xl w-full max-w-xl overflow-hidden">
                <div className="flex items-center px-4 border-b border-slate-200 dark:border-[#333639]">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        autoFocus
                        placeholder="Buscar comando, cliente, equipo... (ESC para salir)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full px-3 py-3.5 bg-transparent outline-none text-slate-800 dark:text-slate-100 text-xs placeholder:text-slate-400 font-sans"
                    />
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-2 max-h-80 overflow-y-auto space-y-1">
                    <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Acciones Rápidas</div>
                    {filtered.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSelect(item.path)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-none text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#282a2d] hover:text-amber-500 dark:hover:text-amber-400 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="w-4 h-4 text-slate-400 group-hover:text-amber-500" />
                                <span>{item.label}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                    {filtered.length === 0 && (
                        <div className="p-4 text-center text-xs text-slate-400">
                            No se encontraron resultados para "{query}"
                        </div>
                    )}
                </div>

                <div className="px-4 py-2 bg-slate-50 dark:bg-[#141517] border-t border-slate-200 dark:border-[#333639] text-[10px] text-slate-400 flex items-center justify-between font-mono">
                    <span>Navegación por teclado</span>
                    <span className="bg-slate-200 dark:bg-[#282a2d] px-1.5 py-0.5 rounded-none text-[9px] text-slate-400">Ctrl + K</span>
                </div>
            </div>
        </div>
    );
}
