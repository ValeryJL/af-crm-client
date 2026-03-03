import { useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

export function Technicians() {
    const [searchTerm, setSearchTerm] = useState('');

    // Dummy mock data
    const techs = [
        { id: 1, name: 'Alice Smith', email: 'alice@af-crm.test', phone: '555-0100', status: 'Active' },
        { id: 2, name: 'Bob Johnson', email: 'bob@af-crm.test', phone: '555-0101', status: 'On Leave' },
        { id: 3, name: 'Charlie Davis', email: 'charlie@af-crm.test', phone: '555-0102', status: 'Active' },
    ];

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

                <div className="overflow-x-auto">
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
                            {techs.map((tech) => (
                                <tr key={tech.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                                                {tech.name.charAt(0)}
                                            </div>
                                            <div className="font-semibold text-slate-800">{tech.name}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600 font-medium">{tech.email}</td>
                                    <td className="p-4 text-slate-600 font-medium">{tech.phone}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${tech.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {tech.status}
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
                </div>
            </div>
        </div>
    );
}
