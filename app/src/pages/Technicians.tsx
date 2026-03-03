import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';

interface Technician {
    id: number;
    nombre: string;
    apellido: string;
    mail: string;
    telefono: string;
    status?: string;
}

export function Technicians() {
    const [searchTerm, setSearchTerm] = useState('');
    const [techs, setTechs] = useState<Technician[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTechs = async () => {
            try {
                const response = await apiClient.get('/technicians');
                setTechs(response.data);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching technicians:', err);
                setError(err.response?.data?.message || 'Failed to connect to the server.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTechs();
    }, []);

    const filteredTechs = techs.filter(t =>
        t.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.mail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center whitespace-nowrap mb-8 pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Technicians</h1>
                    <p className="text-slate-500 mt-1">Manage field staff directory and statuses</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5">
                    <Plus size={20} />
                    <span>New Technician</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search technicians..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                            <p>Loading directory...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center p-12 text-rose-500">
                            <AlertCircle size={32} className="mb-2 opacity-50" />
                            <p className="font-medium text-center">{error}</p>
                        </div>
                    ) : techs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-16 text-slate-400">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                                <Plus size={24} className="text-slate-300" />
                            </div>
                            <p className="font-medium text-slate-600 text-lg">No technicians found.</p>
                            <p className="text-sm mt-1">Add a new technician to get started.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                    <th className="p-4 pl-6">Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Phone</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTechs.map((tech) => (
                                    <tr key={tech.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                                                    {(tech.nombre?.charAt(0) || '') + (tech.apellido?.charAt(0) || '')}
                                                </div>
                                                <div className="font-semibold text-slate-800">{tech.nombre} {tech.apellido}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-600 font-medium">{tech.mail || '-'}</td>
                                        <td className="p-4 text-slate-600 font-medium">{tech.telefono || '-'}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${(!tech.status || tech.status === 'Active') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {tech.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                <Edit2 size={18} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
