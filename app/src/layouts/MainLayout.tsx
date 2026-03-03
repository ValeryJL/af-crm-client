import { Outlet, Link } from 'react-router-dom';
import { Menu, User, LayoutDashboard, Wrench, Calendar as CalendarIcon, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';

export function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar segment */}
            <header className="bg-white text-slate-800 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] z-10 sticky top-0 h-16 flex items-center justify-between px-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors">
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex flex-col justify-center items-center text-white font-bold text-sm shadow-md">
                            AF
                        </div>
                        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">AF-CRM</h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col text-right">
                        <p className="font-semibold text-sm text-slate-800">John Doe</p>
                        <p className="text-indigo-600 text-[10px] font-bold tracking-wider uppercase">Administrator</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-sm cursor-pointer hover:shadow transition-shadow">
                        <User size={20} />
                    </div>
                </div>
            </header>

            {/* Body segment */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden bg-slate-900 border-r border-slate-800 flex flex-col text-slate-300 shadow-xl z-0`}>
                    <nav className="p-4 space-y-1.5 flex-1 mt-2">
                        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white font-medium transition-all group">
                            <LayoutDashboard size={20} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                            <span>Dashboard</span>
                        </Link>
                        <Link to="/technicians" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white font-medium transition-all group">
                            <User size={20} className="text-slate-400 group-hover:text-amber-400 transition-colors" />
                            <span>Technicians</span>
                        </Link>
                        <Link to="/services" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white font-medium transition-all group">
                            <Wrench size={20} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                            <span>Services</span>
                        </Link>
                        <Link to="/calendar" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white font-medium transition-all group">
                            <CalendarIcon size={20} className="text-slate-400 group-hover:text-sky-400 transition-colors" />
                            <span>Calendar</span>
                        </Link>
                        <Link to="/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white font-medium transition-all group">
                            <FileSpreadsheet size={20} className="text-slate-400 group-hover:text-purple-400 transition-colors" />
                            <span>Reports</span>
                        </Link>
                    </nav>

                    <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
                        AF-CRM v1.0.0
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 relative">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
