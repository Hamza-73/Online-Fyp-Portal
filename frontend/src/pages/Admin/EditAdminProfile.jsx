import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { AdminContext } from '../../context/AdminApis'; // Adjust the import path if necessary

export default function EditAdminProfile({ currentUser }) {
  const { id } = useParams(); // Get the admin ID from the URL
  const [admin, setAdmin] = useState({
    fname: '',
    lname: '',
    username: '',
    email: '',
    write_permission: false,
    superAdmin: false,
  });
  const [originalAdmin, setOriginalAdmin] = useState(null); // Store original data for comparison
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // New state to track if the form is in edit mode

  const { getAdminProfile, editAdmin } = useContext(AdminContext); // Get editAdmin from context

  useEffect(() => {
    // Fetch admin data by ID
    const fetchAdmin = async () => {
      try {
        const data = await getAdminProfile(id);
        if (!data.success) {
          setLoading(false);
          return;
        }
        setAdmin(data.admin);
        setOriginalAdmin(data.admin); // Store the original data for comparison
      } catch (err) {
        console.error('Error fetching admin:', err);
      }
      setLoading(false);
    };

    fetchAdmin();
  }, [id]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    // For fname and lname: trim spaces, allow only 1 space between words, and ensure no spaces at the beginning
    if (name === 'fname' || name === 'lname') {
      value = value.replace(/^\s+/, ''); // Remove leading spaces
      value = value.replace(/\s{2,}/g, ' '); // Replace multiple spaces with a single space
    }

    // Prevent spaces in username and email
    if (name === 'username' || name === 'email') {
      value = value.replace(/\s/g, '');
    }

    setAdmin({ ...admin, [name]: value });
  };

  const handleCheckboxChange = () => {
    setAdmin({ ...admin, write_permission: !admin.write_permission });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await editAdmin(id, admin); // Use editAdmin from context
      if (response.success) {
        toast.success(response.message);
        setOriginalAdmin(admin); // Update originalAdmin to current admin state
        setIsEditing(false); // Disable edit mode after saving
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('An error occurred while updating the profile.');
    }
  };

  const handleCancel = () => {
    setAdmin(originalAdmin); // Reset form values to original
    setIsEditing(false); // Disable edit mode
  };

  // Function to check if the current form values are different from the original ones
  const isFormChanged = () => {
    if (!originalAdmin) return true; // If the original data isn't loaded yet, allow the button to be disabled

    const normalize = (value) => value.trim().toLowerCase(); // Trim and convert to lowercase for comparison

    return !(
      normalize(admin.fname) === normalize(originalAdmin.fname) &&
      normalize(admin.lname) === normalize(originalAdmin.lname) &&
      normalize(admin.username) === normalize(originalAdmin.username) &&
      normalize(admin.email) === normalize(originalAdmin.email) &&
      admin.write_permission === originalAdmin.write_permission
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-6 text-center">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name and Last Name on the same line */}
          <div className="flex space-x-4">
            {/* First Name */}
            <div className="flex-1">
              <label className="block text-gray-700 font-semibold mb-2">First Name</label>
              <input
                type="text"
                name="fname"
                value={admin.fname}
                onChange={handleChange}
                disabled={!isEditing} // Disable the field when not editing
                className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:ring-maroon focus:outline-none"
                placeholder="Enter first name"
              />
            </div>

            {/* Last Name */}
            <div className="flex-1">
              <label className="block text-gray-700 font-semibold mb-2">Last Name</label>
              <input
                type="text"
                name="lname"
                value={admin.lname}
                onChange={handleChange}
                disabled={!isEditing} // Disable the field when not editing
                className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:outline-none"
                placeholder="Enter last name"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={admin.username}
              onChange={handleChange}
              disabled={!isEditing} // Disable the field when not editing
              className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:outline-none"
              placeholder="Enter username"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={admin.email}
              onChange={handleChange}
              disabled={!isEditing} // Disable the field when not editing
              className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:outline-none"
              placeholder="Enter email address"
            />
          </div>

          {/* Write Permission (Checkbox) */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Write Permission</label>
            <input
              type="checkbox"
              name="write_permission"
              checked={admin.write_permission}
              onChange={handleCheckboxChange}
              disabled={!isEditing || !currentUser.superAdmin} // Disable the checkbox when not editing or not a superAdmin
              className="mr-2 h-5 w-5"
            />
            <span className="text-gray-700">
              {currentUser.superAdmin 
                ? 'Can Edit Write Permission'
                : 'Cannot Edit Write Permission'}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center">
            {isEditing ? (
              <>
                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-400 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2"
                >
                  Cancel
                </button>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={!isFormChanged()} // Disable if form hasn't changed
                  className={`bg-[maroon] text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2  
                    ${!isFormChanged() ? 'bg-gray-400' : 'hover:bg-[maroon]'}`}
                >
                  Save
                </button>
              </>
            ) : (
              // Edit Button
              <button
                type="button"
                onClick={() => setIsEditing(true)} // Enable edit mode when clicked
                className="bg-[maroon] text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 hover:bg-[maroon]"
              >
                Edit
              </button>
            )}
          </div>
        </form>
      </div>
      <Toaster />
    </div>
  );
}
