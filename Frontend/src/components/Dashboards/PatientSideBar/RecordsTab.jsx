import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { FaUserMd, FaFileMedical, FaDownload, FaSyncAlt, } from 'react-icons/fa'
import MessageBox from '../../../components/common/MessageBox.jsx'
import { useContext } from 'react'
import { AuthContext } from '../../../contexts/authContext.jsx'


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const RecordsTab = React.memo(() => {

    const { user } = useContext(AuthContext)
    const [medicalRecords, setMedicalRecords] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    console.log(user)

    const handleDownload = useCallback((fileType, fileName) => {
        console.log(`Placeholder download for ${fileType}: ${fileName}`);
        MessageBox.info(`Download requested for ${fileName}`);

    }, []);

    // Fetch patient's medical records (Moved from Patient_Dashboard)
    const fetchMedicalRecords = useCallback(async () => {
        // Use user prop to get _id for the fetch
        if (!user?._id) {
            // console.log("Patient details not available for medical records fetch");
            // setIsLoading(false); // Ensure loading is false if fetch skipped
            return;
        }

        try {
            setIsLoading(true)
            const response = await fetch(`${API_URL}/api/medical-records/patient/${user._id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
            })

            if (response.status === 401) {
                MessageBox.error('Your session has expired. Please log in again.');
                // In a real app, you might trigger a logout here
                // setTimeout(() => { logout(); }, 3000);
                return;
            }

            if (!response.ok) {
                MessageBox.error(`Server error: ${response.status} ${response.statusText}`);
                setIsLoading(false);
                return;
            }

            const data = await response.json()

            if (data.success) {
                setMedicalRecords(data.medicalRecords || [])
            } else {
                MessageBox.error(`Failed to fetch medical records: ${data.message}`);
            }
        } catch (error) {
            MessageBox.error(`Error fetching medical records: ${error.message}`);
        } finally {
            setIsLoading(false)
        }
    }, [user?._id]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Medical Records</h2>
                <button
                    onClick={fetchMedicalRecords} 
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
            ) : medicalRecords.length === 0 ? (
                <div className="text-center py-10 flex flex-col items-center">
                    <FaFileMedical className="text-4xl text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No medical records found</p>
                    <p className="text-gray-400 text-sm">Your medical records will appear here once your doctor uploads them</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {medicalRecords.map(record => (
                        <div key={record._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${record.recordType === 'lab_result' ? 'bg-blue-100 text-blue-600' :
                                    record.recordType === 'imaging' ? 'bg-purple-100 text-purple-600' :
                                        'bg-green-100 text-green-600'
                                    }`}>
                                    <FaFileMedical className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-semibold">{record.title}</p>
                                    <p className="text-sm text-gray-600">
                                        {record.description || 'No description provided'}
                                    </p>
                                    <div className="flex items-center gap-4 mt-1">
                                        <p className="text-xs text-gray-500">
                                            Date: {new Date(record.date).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs flex items-center">
                                            <FaUserMd className="mr-1 text-gray-400" />
                                            {record.doctorId?.name || 'Unknown Doctor'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDownload(record.recordType, record.title)}
                                className="w-10 h-10 flex items-center justify-center bg-[#007E85] text-white rounded-full hover:bg-[#006b6f] transition-colors"
                                disabled={!record.fileUrl}
                                title={record.fileUrl ? "Download" : "No file available"}
                            >
                                <FaDownload className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
})

export default RecordsTab