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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Services & Contracts</h1>
                    <p className="text-slate-500 mt-1">Manage generator maintenance schedules</p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto">
                    <Plus size={20} />
                    <span>New Service Request</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {services.map((svc) => (
                        <div key={svc.id} className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col gap-4 ${svc.active ? 'border-slate-200' : 'border-rose-200 bg-rose-50/30'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-xl text-slate-800 tracking-tight">{svc.client}</h3>
                                    <span className={`inline-block px-3 py-1 mt-2 text-xs font-bold uppercase tracking-wider rounded-md ${svc.active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                        {svc.active ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>
                                <button title={svc.active ? "Cancel Service" : "Service Disabled"} disabled={!svc.active} className={`p-2 rounded-xl transition-colors ${svc.active ? 'text-slate-400 hover:text-rose-500 hover:bg-rose-50' : 'text-slate-300 cursor-not-allowed'}`}>
                                    <PowerOff size={20} />
                                </button>
                            </div>

                            <div className="space-y-3 text-sm text-slate-600 mt-2 flex-1 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <WrenchIcon size={18} className="text-indigo-400" />
                                    <span>{svc.engineInfo}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar size={18} className="text-sky-400" />
                                    <span>{svc.frequency}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin size={18} className="text-amber-400" />
                                    <span>{svc.location}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 mt-2 flex justify-between items-center">
                                <span className="text-xs text-slate-400 font-medium">ID: #{svc.id.toString().padStart(4, '0')}</span>
                                <button className="text-indigo-600 font-bold text-sm hover:text-indigo-700 flex items-center gap-1 group">
                                    View Details
                                    <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
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
