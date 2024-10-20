import React, { useEffect, useContext, useState } from 'react';
import { AdminContext } from '../../context/AdminApis'; // Adjust the import path if necessary
import { FaUser, FaEnvelope, FaIdBadge } from 'react-icons/fa'; // Import relevant icons
import { toast, Toaster } from 'react-hot-toast';

export default function AdminProfile() {
    const { getProfile, editAdmin } = useContext(AdminContext);
    const [profile, setProfile] = useState({
        fname: '',
        lname: '',
        username: '',
        email: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [formValues, setFormValues] = useState({ ...profile });
    const [isSaveDisabled, setIsSaveDisabled] = useState(true);

    // Fetching user profile data
    useEffect(() => {
        const fetchProfile = async () => {
            const data = await getProfile();

            if (data.success) {
                setProfile(data.admin);
                setFormValues(data.admin);
            } else {
                console.error(data.message);
            }
        };

        fetchProfile();
    }, [getProfile]);

    // Handle input changes
    const handleInputChange = (e) => {
        let { name, value } = e.target;

        // For fname and lname: trim spaces, allow only 1 space between words, and ensure no spaces at the beginning
        if (name === 'fname' || name === 'lname') {
            value = value.replace(/^\s+/, ''); // Remove leading spaces
            value = value.replace(/\s{2,}/g, ' '); // Replace multiple spaces with a single space
        }

        // Prevent spaces in username and email
        if (name === 'username' || name === 'email') {
            value = value.replace(/\s/g, ''); // Remove all spaces
        }

        // Update form values
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));

        // Check for validation
        const isValid =
            (name === 'fname' || name === 'lname') 
                ? /^[A-Za-z]+( [A-Za-z]+)*$/.test(value) // Validate fname and lname for allowed spaces
                : /^[^\s]+$/.test(value); // No spaces in username and email

        setIsSaveDisabled(!isValid || JSON.stringify(profile) === JSON.stringify({ ...formValues, [name]: value }) || !value);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const { fname, lname, username, email } = formValues;
    
        // Add validations for the fields
        if (!fname || !lname || !username || !email) {
            toast.error('All fields are required.'); // Show error notification
            return;
        }
    
        // Call the updateProfile function from AdminContext, passing the ID
        const response = await editAdmin(profile._id, formValues); // Pass the ID here
        if (response.success) {
            setProfile(formValues); // Update the profile with the saved values
            toast.success('Profile updated successfully!'); // Show success notification
            setIsEditing(false); // Disable editing mode
            setIsSaveDisabled(true); // Disable the save button
        } else {
            toast.error(response.message || 'An error occurred while updating the profile.'); // Show error notification
        }
    };
    

    const handleCancel = () => {
        setFormValues(profile); // Reset to original profile data
        setIsEditing(false); // Disable editing mode
        setIsSaveDisabled(true); // Reset save button state
    };

    return (
        <div className="min-h-screen flex justify-center ">
            <div className="bg-white shadow-lg rounded-lg p-6 md:w-1/2 w-full flex flex-col h-[80vh]">
                {/* User Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-gray-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                </div>

                {/* Profile Form */}
                <form className="space-y-4" onSubmit={handleSave}>
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
                                <FaIdBadge className="ml-2 text-gray-500" />
                                <input
                                    type="text"
                                    name="fname"
                                    value={formValues.fname}
                                    onChange={handleInputChange}
                                    className="mt-1 p-2 block w-full border-none focus:outline-none "
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
                                <FaIdBadge className="ml-2 text-gray-500" />
                                <input
                                    type="text"
                                    name="lname"
                                    value={formValues.lname}
                                    onChange={handleInputChange}
                                    className="mt-1 p-2 block w-full border-none focus:outline-none "
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
                            <FaUser className="ml-2 text-gray-500" />
                            <input
                                type="text"
                                name="username"
                                value={formValues.username}
                                onChange={handleInputChange}
                                className="mt-1 p-2 block w-full border-none focus:outline-none "
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
                            <FaEnvelope className="ml-2 text-gray-500" />
                            <input
                                type="email"
                                name="email"
                                value={formValues.email}
                                onChange={handleInputChange}
                                className="mt-1 p-2 block w-full border-none focus:outline-none "
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="flex justify-between mt-4">
                            <button
                                type="button"
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                                onClick={handleCancel} // Cancel editing and reset to original
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`bg-indigo-600 text-white px-4 py-2 rounded-md ${isSaveDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isSaveDisabled}
                            >
                                Save
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md"
                            onClick={() => setIsEditing(true)} // Enable editing
                        >
                            Edit
                        </button>
                    )}
                </form>
            </div>
            <Toaster/>
        </div>
    );
}
