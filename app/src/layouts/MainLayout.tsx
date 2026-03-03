import { Outlet, Link } from 'react-router-dom';
import { Menu, User, LayoutDashboard, Wrench, Calendar as CalendarIcon, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';

export function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar segment */}
            <header className="bg-blue-600 text-white shadow-md z-10 sticky top-0 h-16 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-blue-700 rounded-lg">
                        <Menu size={24} />
                    </button>
                    <h1 className="text-xl font-bold tracking-tight">AF-CRM</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-sm">
                        <p className="font-semibold">John Doe</p>
                        <p className="text-blue-200 text-xs">ADMIN</p>
                    </div>
                    <div className="bg-blue-500 p-2 rounded-full">
                        <User size={20} />
                    </div>
                </div>
            </header>

            {/* Body segment */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex flex-col`}>
                    <nav className="p-4 space-y-2 flex-1">
                        <Link to="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors">
                            <LayoutDashboard size={20} className="text-blue-600" />
                            <span>Dashboard</span>
                        </Link>
                        <Link to="/technicians" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors">
                            <User size={20} className="text-blue-600" />
                            <span>Technicians</span>
                        </Link>
                        <Link to="/services" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors">
                            <Wrench size={20} className="text-blue-600" />
                            <span>Services</span>
                        </Link>
                        <Link to="/calendar" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors">
                            <CalendarIcon size={20} className="text-blue-600" />
                            <span>Calendar</span>
                        </Link>
                        <Link to="/reports" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors">
                            <FileSpreadsheet size={20} className="text-blue-600" />
                            <span>Reports</span>
                        </Link>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
