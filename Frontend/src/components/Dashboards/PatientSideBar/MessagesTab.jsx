import React from 'react'

const MessagesTab = React.memo(() => {
    
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Chat with Doctors</h2>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[70vh]">
                {/* Appointment List Sidebar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-1">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold">Your Appointments</h3>
                        <p className="text-sm text-gray-500">Select to chat</p>
                    </div>

                    <div className="overflow-y-auto h-[calc(70vh-4rem)]">
                        {/* ... existing code ... */}
                    </div>
                </div>

                {/* Chat Interface */}
                <div className="lg:col-span-3 h-full">
                    {/* Chat Interface content will be handled here */}
                </div>
            </div>
        </div>
    );
})

export default MessagesTab