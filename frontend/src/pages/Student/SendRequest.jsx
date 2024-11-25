import React, { useContext, useState, useEffect } from 'react';
import { SupervisorContext } from '../../context/SupervisorApis.jsx';
import { StudentContext } from '../../context/StudentApis.jsx';

export default function SendRequest() {

    const { getSupervisors } = useContext(SupervisorContext);
    const { sendProjectRequest } = useContext(StudentContext);

    const [supervisors, setSupervisors] = useState([]);
    const [formData, setFormData] = useState({
        projectTitle: '',
        description: '',
        scope: '',
        supervisorId: '',
    });
    const [message, setMessage] = useState('');

    // Fetch supervisors on component mount
    useEffect(() => {
        const fetchSupervisors = async () => {
            try {
                const supervisorData = await getSupervisors();
                setSupervisors(supervisorData.supervisors);
            } catch (error) {
                console.error('Error fetching supervisors:', error);
            }
        };
        fetchSupervisors();
    }, [getSupervisors]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await sendProjectRequest(formData.supervisorId, formData);
            setMessage(response.message || 'Request sent successfully.');
        } catch (error) {
            console.error('Error sending project request:', error);
            setMessage('Failed to send request. Please try again.');
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
            <h2 className="text-2xl font-semibold text-center mb-4">Send Project Request</h2>
            {message && <p className="text-center text-green-600">{message}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Project Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Project Title</label>
                    <input
                        type="text"
                        name="projectTitle"
                        value={formData.projectTitle}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                        required
                    />
                </div>

                {/* Scope */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Scope</label>
                    <input
                        type="text"
                        name="scope"
                        value={formData.scope}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                        required
                    />
                </div>

                {/* Supervisor Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Select Supervisor</label>
                    <select
                        name="supervisorId"
                        value={formData.supervisorId}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                        required
                    >
                        <option value="">-- Select Supervisor --</option>
                        {supervisors.map((supervisor) => (
                            <option key={supervisor._id} value={supervisor._id}>
                                {supervisor.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Submit Button */}
                <div className="text-center">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                    >
                        Send Request
                    </button>
                </div>
            </form>
        </div>
    );
}
