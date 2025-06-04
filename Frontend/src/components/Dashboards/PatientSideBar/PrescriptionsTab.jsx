import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { FaUserMd, FaNotesMedical, FaDownload, FaSyncAlt } from 'react-icons/fa'
import MessageBox from '../../common/MessageBox.jsx'
import { useContext } from 'react'
import { AuthContext } from '../../../contexts/authContext.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const PrescriptionsTab = React.memo(() => {

    const { user, logout } = useContext(AuthContext);

    const [prescriptions, setPrescriptions] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const handleDownload = useCallback((fileType, fileName) => {
        console.log(`Placeholder download for ${fileType}: ${fileName}`);
        MessageBox.info(`Download requested for ${fileName}`);

    }, []);

    const fetchPrescriptions = useCallback(async () => {
        if (!user?._id) {
            console.log("Patient details not available for prescriptions fetch");
            setIsLoading(false); // Ensure loading is false if fetch skipped
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/api/prescriptions/patient/${user._id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });


            if (response.status === 401) {
                MessageBox.error('Your session has expired. Please log in again.');
                setTimeout(() => {
                    logout();
                }, 3000);
                return;
            }

            if (!response.ok) {
                MessageBox.error(`Server error: ${response.status} ${response.statusText}`);
                setIsLoading(false);
                return;
            }

            const data = await response.json();

            if (data.success) {
                setPrescriptions(data.prescriptions || []);
            } else {
                MessageBox.error(`Failed to fetch prescriptions: ${data.message}`);
            }
        } catch (error) {
            MessageBox.error(`Error fetching prescriptions: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [user?._id, logout]);

    useEffect(() => {
        fetchPrescriptions();
    }, [fetchPrescriptions]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Prescriptions</h2>
                <button
                    onClick={fetchPrescriptions}
                    className="flex items-center gap-2 text-sm bg-[#007E85] text-white px-4 py-2 rounded-lg hover:bg-[#006b6f] transition-colors"
                >
                    <FaSyncAlt className={isLoading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#007E85]"></div>
                </div>
            ) : prescriptions.length === 0 ? (
                <div className="text-center py-10 flex flex-col items-center">
                    <FaNotesMedical className="text-4xl text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No prescriptions found</p>
                    <p className="text-gray-400 text-sm">Your prescriptions will appear here after a doctor's visit</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {prescriptions.map(prescription => (
                        <div key={prescription._id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-semibold text-lg">{prescription.diagnosis}</h3>
                                    <p className="text-sm text-gray-600">
                                        Issued: {new Date(prescription.issueDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm flex items-center mt-1">
                                        <FaUserMd className="mr-1 text-gray-400" />
                                        {prescription.doctorId?.name || 'Unknown Doctor'}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm ${prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                                    prescription.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                    {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                                </span>
                            </div>

                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="font-medium mb-2">Medications:</p>
                                <ul className="space-y-2">
                                    {prescription.medications.map((med, idx) => (
                                        <li key={idx} className="border-b border-gray-100 pb-2 last:border-b-0">
                                            <div className="flex justify-between">
                                                <span className="font-medium">{med.name}</span>
                                                <span className="text-sm">{med.dosage}</span>
                                            </div>
                                            <p className="text-sm text-gray-600">{med.frequency} for {med.duration}</p>
                                            {med.instructions && (
                                                <p className="text-xs text-gray-500 mt-1">{med.instructions}</p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {prescription.notes && (
                                <div className="mt-3 text-sm">
                                    <p><span className="font-medium">Notes:</span> {prescription.notes}</p>
                                </div>
                            )}

                            <div className="mt-3 flex justify-end">
                                <button
                                    onClick={() => handleDownload('pdf', `prescription_${prescription._id}.pdf`)}
                                    className="flex items-center gap-1 text-sm bg-[#007E85] text-white px-3 py-1 rounded-md hover:bg-[#006b6f] transition-colors"
                                    disabled={!prescription.fileUrl}
                                >
                                    <FaDownload className="h-3 w-3" />
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
})

export default PrescriptionsTab