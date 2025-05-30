import React from 'react'

const HealthTab = React.memo(() => {

    // fake dummy health metrics
    const healthMetrics = {
        bloodPressure: '120/80 mmHg',
        heartRate: '72 bpm',
        bloodSugar: '95 mg/dL',
        weight: '165 lbs',
        bmi: '24.5',
        lastCheckup: '2023-10-26',
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Health Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(healthMetrics).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-6 rounded-xl">
                            <p className="text-gray-600 capitalize mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="text-2xl font-semibold text-[#007E85]">{value}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Health History</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-xl">
                        <h3 className="font-semibold text-lg text-[#007E85] mb-2">Weight Tracking</h3>
                        <p className="text-gray-600 mb-4">Track your weight over time to monitor progress</p>
                        <button className="bg-[#007E85] text-white px-4 py-2 rounded-lg hover:bg-[#006b6f] transition-colors">
                            View History
                        </button>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl">
                        <h3 className="font-semibold text-lg text-[#007E85] mb-2">Blood Pressure Log</h3>
                        <p className="text-gray-600 mb-4">Monitor your blood pressure readings</p>
                        <button className="bg-[#007E85] text-white px-4 py-2 rounded-lg hover:bg-[#006b6f] transition-colors">
                            View History
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
})

export default HealthTab