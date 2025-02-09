import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { SupervisorContext } from '../../context/SupervisorApis.jsx'; // Import the Supervisor context
import { toast, Toaster } from 'react-hot-toast';

export default function EditSupervisorProfile() {
    const { id } = useParams(); // Get the supervisor ID from the URL
    const [supervisor, setSupervisor] = useState(null); // State to store supervisor details
    const [loading, setLoading] = useState(true); // State to manage loading state
    const { editSupervisorProfile, getSupervisorProfile } = useContext(SupervisorContext); // Access edit function from context

    const [isEditing, setIsEditing] = useState(false); // State to manage edit mode
    const [originalData, setOriginalData] = useState({}); // State to store original supervisor data
    const [editedSupervisor, setEditedSupervisor] = useState({}); // State to track edited supervisor data

    useEffect(() => {
        const fetchSupervisor = async () => {
            try {
                const data = await getSupervisorProfile(id); // Call the API method to fetch the supervisor profile
                if (data.success) {
                    setSupervisor(data.supervisor); // Set supervisor data in state
                    setOriginalData(data.supervisor); // Store the original data for comparison
                    setEditedSupervisor(data.supervisor); // Initialize editedSupervisor with fetched data
                } else {
                    toast.error(data.message);
                }
            } catch (err) {
                console.error('Error fetching supervisor data:', err);
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchSupervisor();
    }, [id]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing); // Toggle edit mode
    };

    const handleChange = (e) => {
        let { name, value } = e.target; // Get input name and value

        // Normalize the value
        if (name === "name" || name === "designation") {
            value = value.replace(/^\s+/, '').replace(/\s{2,}/g, ' '); // Remove leading spaces and multiple spaces
        }

        // Remove spaces from email
        if (name === "email") {
            value = value.replace(/\s+/g, ''); // Remove all spaces
        }

        setEditedSupervisor((prev) => ({ ...prev, [name]: value })); // Update edited supervisor data
    };

    const handleCancel = () => {
        setEditedSupervisor(originalData); // Reset to original data
        setIsEditing(false); // Exit edit mode
    };

    const handleSave = async () => {
        // Normalize before saving
        const normalizedEditedSupervisor = {
            ...editedSupervisor,
            name: editedSupervisor.name.replace(/\s+/g, ' ').trim(), // Normalize name
            designation: editedSupervisor.designation.replace(/\s+/g, ' ').trim(), // Normalize designation
            email: editedSupervisor.email.replace(/\s+/g, ''), // Remove spaces from email
        };

        const data = await editSupervisorProfile(id, normalizedEditedSupervisor); // Call the API method to update the supervisor profile
        if (data.success) {
            setSupervisor(normalizedEditedSupervisor); // Update the displayed supervisor data immediately
            setOriginalData(normalizedEditedSupervisor); // Update the original data to match the edited data
            setIsEditing(false); // Exit edit mode
            toast.success(data.message);
        } else {
            toast.error(data.message);
        }
    };

    const isSaveDisabled = Object.keys(originalData).every(key =>
        originalData[key].toString().trim().toLowerCase() === editedSupervisor[key].toString().trim().toLowerCase()
    ); // Check if the data has changed case-insensitively, ignoring leading/trailing spaces

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen flex justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
                <h2 className="text-2xl font-semibold mb-6 text-center">Supervisor Profile</h2>

                {supervisor && (
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                        {/* Grid for details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Name */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editedSupervisor.name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="p-3 border border-gray-300 rounded-md w-full"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editedSupervisor.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="p-3 border border-gray-300 rounded-md w-full"
                                />
                            </div>
                        </div>

                        {/* CNIC and Designation in 2 columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Username */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={editedSupervisor.username}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="p-3 border border-gray-300 rounded-md w-full"
                                />
                            </div>

                            {/* CNIC */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">CNIC</label>
                                <input
                                    type="text"
                                    name="cnic"
                                    value={editedSupervisor.cnic}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="p-3 border border-gray-300 rounded-md w-full"
                                />
                            </div>

                        </div>

                        {/* Department */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={editedSupervisor.department}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="p-3 border border-gray-300 rounded-md w-full"
                                />
                            </div>

                            {/* Designation */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Designation</label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={editedSupervisor.designation}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="p-3 border border-gray-300 rounded-md w-full"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Slots</label>
                                <input
                                    type="text"
                                    name="slots"
                                    value={editedSupervisor.slots}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="p-3 border border-gray-300 rounded-md w-full"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Committee Member</label>
                                <input
                                    type="checkbox"
                                    name="isCommittee"
                                    checked={editedSupervisor.isCommittee === 'true' || editedSupervisor.isCommittee === true}
                                    onChange={(e) =>
                                        setEditedSupervisor((prev) => ({ ...prev, isCommittee: e.target.checked }))
                                    }
                                    disabled={!isEditing}
                                    className="w-5 h-5"
                                />
                            </div>
                        </div>


                        {/* Buttons for editing, saving, and canceling */}
                        <div className="flex justify-end">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaveDisabled}
                                        className={`p-2 rounded-md text-white ${isSaveDisabled ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'} transition duration-200`}
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="ml-2 p-2 bg-red-500 hover:bg-red-700 text-white rounded-md"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleEditToggle}
                                    className="p-2 bg-green-500 hover:bg-green-700 text-white rounded-md"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </form>
                )}
            </div>
            <Toaster />
        </div>
    );
}
