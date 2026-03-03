import { useState, useEffect } from 'react';
import apiClient from '../api/client';

export function Dashboard() {
    const [techCount, setTechCount] = useState<number | '-'>('-');
    const [serviceCount, setServiceCount] = useState<number | '-'>('-');
    const [taskCount, setTaskCount] = useState<number | '-'>('-');

    useEffect(() => {
        // Fetch technicians count
        apiClient.get('/technicians')
            .then(res => setTechCount(res.data.length))
            .catch(() => setTechCount('-'));

        // Fetch services count
        apiClient.get('/services')
            .then(res => setServiceCount(res.data.length))
            .catch(() => setServiceCount('-'));

        // Tasks API is not fully hooked up in UI yet, but we'll try to fetch if endpoint exists
        apiClient.get('/calendar')
            .then(res => setTaskCount(res.data.length))
            .catch(() => setTaskCount('-'));
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2 transition-all hover:shadow-md hover:border-blue-100">
                    <h3 className="text-gray-500 font-medium">Pending Tasks</h3>
                    <p className="text-3xl font-bold text-blue-600">{taskCount}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2 transition-all hover:shadow-md hover:border-green-100">
                    <h3 className="text-gray-500 font-medium">Active Services</h3>
                    <p className="text-3xl font-bold text-green-600">{serviceCount}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2 transition-all hover:shadow-md hover:border-purple-100">
                    <h3 className="text-gray-500 font-medium">Available Techs</h3>
                    <p className="text-3xl font-bold text-purple-600">{techCount}</p>
                </div>
            </div>
        </div>
    );
}
