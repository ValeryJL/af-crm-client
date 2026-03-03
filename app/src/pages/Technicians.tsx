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
            <div className="flex justify-between items-center whitespace-nowrap">
                <h1 className="text-2xl font-bold text-gray-800">Technicians</h1>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <Plus size={20} />
                    <span>New Technician</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-4">
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
                            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">Email</th>
                                <th className="p-4 font-medium">Phone</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {techs.map((tech) => (
                                <tr key={tech.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-800">{tech.name}</div>
                                    </td>
                                    <td className="p-4 text-gray-600">{tech.email}</td>
                                    <td className="p-4 text-gray-600">{tech.phone}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${tech.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {tech.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit2 size={18} />
                                        </button>
                                        <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
