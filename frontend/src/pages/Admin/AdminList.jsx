import React, { useContext, useEffect, useState } from 'react';
import { server } from '../../server';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AdminContext } from '../../context/AdminApis';

export default function AdminList({ userData }) {
  const { getAdmins, registerAdmin, deleteAdmin, registerAdminFromFile } =
    useContext(AdminContext);

  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const adminsData = await getAdmins();
        setAdmins(adminsData.admin);
      } catch (error) {
        console.error('Error fetching admins:', error);
      }
    };
    fetchAdmins();
  }, [getAdmins]);

  const handleDelete = async (id) => {
    const response = await deleteAdmin(id);
    if (response.success) {
      setAdmins((prev) => prev.filter((admin) => admin._id !== id));
      toast.success('Admin deleted successfully');
    } else {
      toast.error(response.message || 'Failed to delete the admin.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const newAdminData = {
      ...selectedAdmin,
      password,
    };
    const response = await registerAdmin(newAdminData);
    if (response.success) {
      setAdmins((prev) => [...prev, response.newAdmin]);
      toast.success('Admin added successfully');
      closeModal();
    } else {
      toast.error(response.message || 'Failed to add admin.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await registerAdminFromFile(file);
      console.log("response is ", response)
      if (response.success) {
        setAdmins((prev) => [...prev, ...response.newAdmins]);
        toast.success('Admins registered successfully from file.');
      } else {
        toast.error(response.message || 'Failed to register admins from file.');
      }
    } catch (error) {
      toast.error(error.message || 'Error processing file.');
    }
  };

  const handleAddClick = () => {
    setSelectedAdmin({ fname: '', lname: '', email: '', username: '' });
    setPassword('');
    setShowModal(true);
    setIsAdding(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAdmin(null);
    setPassword('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedAdmin((prev) => ({
      ...prev,
      [name]:
        name === 'fname' || name === 'lname'
          ? value.trimStart().replace(/\s{2,}/g, ' ')
          : value.trim(),
    }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value.trimStart().replace(/\s{2,}/g, ' '));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-center mb-6">Admin List</h1>
      <Toaster />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Username</th>
              {(userData?.superAdmin || userData?.write_permission) && (
                <th className="py-3 px-6 text-center">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin._id} className="border-b hover:bg-slate-100">
                <td className="py-3 px-6">{`${admin.fname} ${admin.lname}`}</td>
                <td className="py-3 px-6">{admin.email}</td>
                <td className="py-3 px-6">{admin.username}</td>
                {(userData?.superAdmin || userData?.write_permission) && (
                  <td className="py-3 px-6 text-center flex justify-center space-x-4">
                    <Link
                      to={`/admin/edit-admin-profile/${admin._id}`}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(admin._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={handleAddClick}
        >
          Add Admin
        </button>
        <label
          htmlFor="fileUpload"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
        >
          Upload Excel
          <input
            type="file"
            id="fileUpload"
            className="hidden"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-semibold mb-4 text-center">{isAdding ? 'Add Admin' : 'Edit Admin'}</h2>
            <form onSubmit={handleRegister}>
              {['fname', 'lname', 'email', 'username'].map((field) => (
                <div className="mb-4" key={field}>
                  <label htmlFor={field} className="block text-sm font-medium text-gray-700">
                    {field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                  </label>
                  <input
                    type="text"
                    id={field}
                    name={field}
                    value={selectedAdmin?.[field] || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              ))}
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  {isAdding ? 'Add' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
