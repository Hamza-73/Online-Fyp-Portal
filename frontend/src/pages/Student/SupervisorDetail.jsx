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
      console.log("response is", response);
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
    <div className="p-6 max-w-xl mx-auto">
      {/* Supervisor Details */}
      {supervisor ? (
        <div className="bg-white shadow-lg p-6 rounded-lg ">
          <h2 className="flex items-center text-xl font-semibold  mb-4">
            <FaUser className="mr-2" /> {supervisor.name}
          </h2>
          <div className="text-gray-700 space-y-2">
            <div className="flex flex-wrap justify-between">
              <p>
                <span className="font-medium">Designation:</span> {supervisor.designation}
              </p>
              <p>
                <span className="font-medium">Department:</span> {supervisor.department}
              </p>
            </div>
            <p>
              <span className="font-medium">Slots Available:</span> {supervisor.slots}
            </p>
          </div>
          {/* Show/Hide Form Button */}
          {!userData.isGroupMember &&
            !userData.requests?.rejectedRequests?.includes(supervisorId) && (
              <div className="text-center mt-4">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
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
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-center mb-4">Send Project Request</h3>
          {message && <p className="text-center text-green-600">{message}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="text-center">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
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
