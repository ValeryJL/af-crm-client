import { useState } from 'react';
import { Plus, Search, Calendar, MapPin, PowerOff } from 'lucide-react';

export function Services() {
    const [searchTerm, setSearchTerm] = useState('');

    // Dummy mock data for Services/Contracts
    const services = [
        { id: 1, client: 'Acme Corporation', engineInfo: 'Volvo Penta 500kVA', frequency: 'Monthly', location: 'Plant A', active: true },
        { id: 2, client: 'Global Industries', engineInfo: 'Cummins 250kVA', frequency: 'Quarterly', location: 'HQ Bldg', active: true },
        { id: 3, client: 'Tech Solutions', engineInfo: 'Caterpillar 1000kVA', frequency: 'Bi-Weekly', location: 'Datacenter', active: false },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Services & Contracts</h1>
                <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto">
                    <Plus size={20} />
                    <span>New Service Request</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                    </div>
                    {/* Filters */}
                    <div className="flex gap-2 w-full sm:w-auto">
                        <select className="flex-1 sm:w-auto border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">Frequency: All</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50">
                    {services.map((svc) => (
                        <div key={svc.id} className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 ${svc.active ? 'border-gray-200' : 'border-red-200 opacity-75'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{svc.client}</h3>
                                    <span className={`inline-block px-2 py-1 mt-1 text-xs font-semibold rounded ${svc.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {svc.active ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>
                                <button title={svc.active ? "Cancel Service" : "Service Disabled"} disabled={!svc.active} className={`p-2 rounded-lg transition-colors ${svc.active ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 cursor-not-allowed'}`}>
                                    <PowerOff size={20} />
                                </button>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 mt-2 flex-1">
                                <div className="flex items-center gap-2">
                                    <WrenchIcon size={16} className="text-gray-400" />
                                    <span>{svc.engineInfo}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-400" />
                                    <span>{svc.frequency}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-gray-400" />
                                    <span>{svc.location}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 mt-auto flex justify-end">
                                <button className="text-blue-600 font-medium text-sm hover:underline">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Temporary inline Wrench proxy
function WrenchIcon({ size, className }: { size: number, className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
    )
}
