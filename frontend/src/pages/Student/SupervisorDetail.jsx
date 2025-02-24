import React, { useContext, useEffect, useState } from 'react';
import { StudentContext } from '../../context/StudentApis.jsx';
import { FaUser } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

export default function SupervisorDetail({ userData }) {
  const { supervisorId } = useParams();
  const [supervisor, setSupervisor] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    projectTitle: '',
    description: '',
    scope: '',
    supervisorId,
  });
  const [message, setMessage] = useState('');
  const { getSupervisorDetail, sendProjectRequest } = useContext(StudentContext);

  useEffect(() => {
    const fetchSupervisor = async () => {
      const response = await getSupervisorDetail(supervisorId);
      if (response.success) {
        setSupervisor(response.supervisor);
      }
    };
    fetchSupervisor();
  }, [supervisorId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await sendProjectRequest(supervisorId, formData);
      setMessage(response.message || 'Request sent successfully.');
    } catch (error) {
      console.error('Error sending project request:', error);
      setMessage('Failed to send request. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {supervisor ? (
          <div className="bg-white shadow-md rounded-lg p-8">
            <h2 className="flex items-center text-3xl font-semibold text-gray-900 mb-6">
              <FaUser className="mr-3 text-4xl text-gray-700" /> {supervisor.name}
            </h2>

            <div className="text-lg space-y-4 text-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><span className="font-medium">Designation:</span> {supervisor.designation}</p>
                <p><span className="font-medium">Department:</span> {supervisor.department}</p>
              </div>
              <p><span className="font-medium">Slots Available:</span> {supervisor.slots}</p>
            </div>

            {!userData.isGroupMember &&
              !userData.requests?.rejectedRequests?.includes(supervisorId) && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 text-white font-medium bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300"
                  >
                    {showForm ? 'Cancel Request' : 'Send Project Request'}
                  </button>
                </div>
              )}
          </div>
        ) : (
          <p className="text-center text-gray-500">Loading supervisor details...</p>
        )}

        {showForm && (
          <div className="mt-8 bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-gray-900 text-center mb-6">Submit Project Request</h3>
            {message && <p className="text-center text-green-600">{message}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700">Project Title</label>
                  <input
                    type="text"
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleChange}
                    className="mt-2 block w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700">Scope</label>
                  <input
                    type="text"
                    name="scope"
                    value={formData.scope}
                    onChange={handleChange}
                    className="mt-2 block w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="mt-2 block w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-300"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}