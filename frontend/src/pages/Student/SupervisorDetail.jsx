import React, { useContext, useEffect, useState } from 'react';
import { StudentContext } from '../../context/StudentApis.jsx';
import { FaUser } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

export default function SupervisorDetail({ userData }) {
  const { supervisorId } = useParams();
  const [supervisor, setSupervisor] = useState(null);
  const [showForm, setShowForm] = useState(false); // Toggle for showing the form
  const [formData, setFormData] = useState({
    projectTitle: '',
    description: '',
    scope: '',
    supervisorId,
  });
  const [message, setMessage] = useState('');
  const { getSupervisorDetail, sendProjectRequest } = useContext(StudentContext);

  // Fetch supervisor details
  useEffect(() => {
    const fetchSupervisor = async () => {
      const response = await getSupervisorDetail(supervisorId);
      if (response.success) {
        setSupervisor(response.supervisor);
      }
    };
    fetchSupervisor();
  }, [supervisorId]);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
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
    <div className="p-6 max-w-4xl mx-auto">
      {/* Supervisor Details */}
      {supervisor ? (
        <div className="bg-white shadow-lg p-6 rounded-lg mb-8">
          <h2 className="flex items-center text-3xl font-semibold mb-4">
            <FaUser className="mr-3 text-4xl" /> {supervisor.name}
          </h2>
          <div className="text-lg space-y-4">
            <div className="flex flex-wrap justify-between">
              <p>
                <span className="font-semibold">Designation:</span> {supervisor.designation}
              </p>
              <p>
                <span className="font-semibold">Department:</span> {supervisor.department}
              </p>
            </div>
            <p>
              <span className="font-semibold">Slots Available:</span> {supervisor.slots}
            </p>
          </div>
          {/* Show/Hide Form Button */}
          {!userData.isGroupMember &&
            !userData.requests?.rejectedRequests?.includes(supervisorId) && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all ease-in-out duration-300"
                >
                  {showForm ? 'Cancel Request' : 'Send Request for Proposal'}
                </button>
              </div>
            )}
        </div>
      ) : (
        <p className="text-gray-500 text-center">Loading supervisor details...</p>
      )}

      {/* Request Form */}
      {showForm && (
        <div className="mt-8 bg-white p-8 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold text-center mb-6">Send Project Request</h3>
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
                  className="mt-2 block w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
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
                  className="mt-2 block w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
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
                className="mt-2 block w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
                required
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all ease-in-out duration-300"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}