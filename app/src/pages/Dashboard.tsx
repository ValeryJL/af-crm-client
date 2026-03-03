export function Dashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
                    <h3 className="text-gray-500 font-medium">Pending Tasks</h3>
                    <p className="text-3xl font-bold text-blue-600">12</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
                    <h3 className="text-gray-500 font-medium">Active Services</h3>
                    <p className="text-3xl font-bold text-green-600">45</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
                    <h3 className="text-gray-500 font-medium">Available Techs</h3>
                    <p className="text-3xl font-bold text-purple-600">8</p>
                </div>
            </div>
        </div>
    );
}
