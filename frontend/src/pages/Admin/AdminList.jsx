import React, { useEffect, useState } from 'react';
import { server } from '../../server';
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import the eye icons


export default function AdminList({ userData }) {

  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null); // State to hold the selected admin for editing
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [isAdding, setIsAdding] = useState(false); // State to track if the modal is for adding or editing
  const [password, setPassword] = useState(''); // State for password when adding a new admin

  console.log("userdata is ", userData)
  // Fetch admin data
  const getAdmin = async () => {
    try {
      const res = await fetch(`${server}/admin/admins`, {
        method: 'GET',
      });
      const json = await res.json();
      setAdmins(json.admin); // Assuming the response contains an 'admins' array
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this admin?");
    if (confirm) {
      try {
        const res = await fetch(`${server}/admin/delete/${id}`, {
          method: 'DELETE', // Ensure you specify the DELETE method
        });
        const json = await res.json();
        console.log("delete response: ", json);

        if (json.success) {
          // If deletion is successful, update the state to remove the admin from the list
          setAdmins((prevAdmins) => prevAdmins.filter(admin => admin._id !== id));
          toast.success('Admin deleted successfully');
        } else {
          toast.error(json.message || "Failed to delete the admin.");
        }
      } catch (error) {
        console.error('Error deleting admin:', error);
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Include password in selectedAdmin when adding a new admin
    const newAdminData = {
      ...selectedAdmin,
      password, // Add the password field here
    };

    try {
      const res = await fetch(`${server}/admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAdminData), // Send the new admin data including password
      });
      const json = await res.json();
      console.log("json is ", json)
      if (json.success) {
        setAdmins((prevAdmins) => [...prevAdmins, json.newAdmin]); // Update the state with the new admin
        toast.success('Admin added successfully');
        closeModal(); // Close the modal after successful addition
      } else {
        toast.error(json.message || "Failed to add admin.");
      }
    } catch (error) {
      console.error('Error adding admin:', error);
    }
  };

  useEffect(() => {
    getAdmin();
  }, []);


  // Open modal for adding admin
  const handleAddClick = () => {
    setSelectedAdmin({ fname: '', lname: '', email: '', username: '' }); // Reset fields for new admin
    setPassword(''); // Reset password field
    setShowModal(true); // Open modal
    setIsAdding(true); // Set modal state to add
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedAdmin(null);
    setPassword(''); // Reset password when closing the modal
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target; // Destructure name and value from the target

    let newValue = value;

    // For fname and lname, allow spaces
    if (name === 'fname' || name === 'lname') {
      // Remove leading spaces
      newValue = newValue.replace(/^\s+/, '');

      // Allow only one space after input
      if (newValue.includes('  ')) {
        newValue = newValue.replace(/\s{2,}/g, ' '); // Replace multiple spaces with a single space
      }
    } else if (name === 'email' || name === 'username') {
      // Remove spaces for email and username; prevent space input
      newValue = newValue.replace(/\s+/g, ''); // Remove all spaces
    }

    // Update the state based on the field being edited
    setSelectedAdmin((prevAdmin) => ({
      ...prevAdmin,
      [name]: newValue, // Use the name directly for state update
    }));
  };


  // Update password state when the password input changes
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const handlePasswordChange = (e) => {
    let newValue = e.target.value.trim(); // Trim spaces directly here
    newValue = newValue.replace(/\s{2,}/g, ' '); // Allow only one space after a word
    setPassword(newValue);
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-center mb-6">Admin List</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Username</th>
              {(userData?.superAdmin || userData?.write_permission) && <th className="py-3 px-6 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin._id} className="border-b hover:bg-slate-100">
                <td className="py-3 px-6">{`${admin.fname} ${admin.lname}`}</td>
                <td className="py-3 px-6">{admin.email}</td>
                <td className="py-3 px-6">{admin.username}</td>
                {(userData?.superAdmin || userData?.write_permission) &&
                  <td className="py-3 px-6 text-center flex justify-center space-x-4">
                    <Link to={`/admin/edit-admin-profile/${admin._id}`}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(admin._id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                      Delete
                    </button>
                  </td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 fixed bottom-8 right-8"
        onClick={handleAddClick} // Call the function to open the add modal
      >
        Add
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-semibold mb-4 text-center">Add Admin</h2>

            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label htmlFor="fname" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  id="fname"
                  name="fname"
                  value={selectedAdmin.fname}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100"
                  required // Make this field required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="lname" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lname"
                  name="lname"
                  value={selectedAdmin.lname}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100"
                  required // Make this field required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={selectedAdmin.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100"
                  required // Make this field required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={selectedAdmin.username}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100"
                  required // Make this field required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} // Toggle between text and password
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 pr-10" // Add padding to the right for the icon
                    required // Make this field required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword((prev) => !prev)} // Toggle the password visibility
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-gray-500" />
                    ) : (
                      <FaEye className="text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Register Admin
                </button>
                <button
                  type="button"
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}
