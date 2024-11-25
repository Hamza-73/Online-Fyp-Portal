import React, { useContext, useEffect, useState } from 'react';
import { server } from '../../server';
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthApis.jsx';
import { SupervisorContext } from '../../context/SupervisorApis.jsx';
import { FaUser, FaEnvelope, FaLock, FaBuilding, FaIdCard, FaUserTie, FaFingerprint } from 'react-icons/fa';

export default function SupervisorList({ userData }) {
    const navigate = useNavigate();
    const { registerSupervisor } = useContext(AuthContext);
    const { deleteSupervisor } = useContext(SupervisorContext);
    const [supervisors, setSupervisors] = useState([]);
    const [selectedSupervisor, setSelectedSupervisor] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [errors, setErrors] = useState({});

    const getSupervisors = async () => {
        try {
            const res = await fetch(`${server}/supervisor/supervisors`, { method: 'GET' });
            const json = await res.json();
            setSupervisors(json.supervisors);
        } catch (error) {
            console.error('Error fetching supervisors:', error);
        }
    };

    useEffect(() => {
        getSupervisors();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedSupervisor((prevSupervisor) => ({
            ...prevSupervisor,
            [name]: value,
        }));
    };

    const handleAddClick = () => {
        setSelectedSupervisor({});
        setIsAdding(true);
        setShowModal(true);
        setErrors({}); // Reset errors when opening modal
    };

    const validateForm = () => {
        const newErrors = {};
        // Required fields
        ['name', 'username', 'email', 'cnic', 'designation'].forEach(field => {
            if (!selectedSupervisor[field]) {
                newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
            }
        });
        // CNIC format
        const cnicRegex = /^\d{13}$/;
        if (selectedSupervisor.cnic && !cnicRegex.test(selectedSupervisor.cnic)) {
            newErrors.cnic = 'CNIC must be exactly 13 digits.';
        }
        // Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (selectedSupervisor.email && !emailRegex.test(selectedSupervisor.email)) {
            newErrors.email = 'Invalid email format.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix the errors in the form.');
            return;
        }
        const supervisorData = {
            ...selectedSupervisor,
        };

        try {
            const response = await registerSupervisor(supervisorData);
            if (response.success) {
                toast.success('Supervisor registered successfully!');
                getSupervisors();
                setShowModal(false);
                setSelectedSupervisor({}); // Reset selected supervisor
            } else {
                toast.error(response.message || 'Failed to register supervisor.');
            }
        } catch (error) {
            console.error('Error registering supervisor:', error);
            toast.error('An error occurred while registering the supervisor.');
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this supervisor?");
        if (confirmDelete) {
            const res = await deleteSupervisor(id);
            if (res.success) {
                toast.success('Supervisor deleted successfully!');
                setSupervisors((prevSupervisors) => prevSupervisors.filter(supervisor => supervisor._id !== id));
            } else {
                toast.error(res.message || 'Failed to delete supervisor.');
            }
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold text-center mb-6">Supervisor List</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="py-3 px-6 text-left">Name</th>
                            <th className="py-3 px-6 text-left">Username</th>
                            <th className="py-3 px-6 text-left">Email</th>
                            <th className="py-3 px-6 text-left">Designation</th>
                            <th className="py-3 px-6 text-left">CNIC</th>
                            <th className="py-3 px-6 text-left">Slots</th>
                            {(userData?.superAdmin || userData?.write_permission) && <th className="py-3 px-6 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {supervisors.map((supervisor) => (
                            <tr key={supervisor._id} className="border-b hover:bg-slate-100">
                                <td className="py-3 px-6">{supervisor.name}</td>
                                <td className="py-3 px-6">{supervisor.username}</td>
                                <td className="py-3 px-6">{supervisor.email}</td>
                                <td className="py-3 px-6">{supervisor.designation}</td>
                                <td className="py-3 px-6">{supervisor.cnic}</td> 
                                <td className="py-3 px-6">{supervisor.slots}</td> 
                                {(userData?.superAdmin || userData?.write_permission) &&
                                    <td className="py-3 px-6 text-center flex justify-center space-x-4">
                                        <Link to={`/admin/edit-supervisor-profile/${supervisor._id}`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                            Edit
                                        </Link>
                                        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                            onClick={() => handleDelete(supervisor._id)}
                                        >
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
                onClick={handleAddClick}
            >
                Add Supervisor
            </button>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative">
                        <h2 className="text-xl font-semibold mb-4 text-center">Add Supervisor</h2>
                        <form onSubmit={handleRegister}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="mb-4 relative">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Name
                                    </label>
                                    <FaUser className="absolute left-3 top-8 text-gray-500" />
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={selectedSupervisor.name || ''}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-10 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100`}
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                                </div>

                                <div className="mb-4 relative">
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                        Username
                                    </label>
                                    <FaUserTie className="absolute left-3 top-8 text-gray-500" />
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={selectedSupervisor.username || ''}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-10 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100`}
                                        required
                                    />
                                    {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                                </div>

                                <div className="mb-4 relative">
                                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                        Department
                                    </label>
                                    <FaBuilding className="absolute left-3 top-8 text-gray-500" />
                                    <input
                                        type="text"
                                        id="department"
                                        name="department"
                                        value={selectedSupervisor.department || ''}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-10 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100`}
                                        required
                                    />
                                </div>

                                <div className="mb-4 relative">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <FaEnvelope className="absolute left-3 top-8 text-gray-500" />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={selectedSupervisor.email || ''}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-10 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100`}
                                        required
                                    />
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                                </div>

                                <div className="mb-4 relative">
                                    <label htmlFor="cnic" className="block text-sm font-medium text-gray-700">
                                        CNIC
                                    </label>
                                    <FaIdCard className="absolute left-3 top-8 text-gray-500" />
                                    <input
                                        type="text"
                                        id="cnic"
                                        name="cnic"
                                        value={selectedSupervisor.cnic || ''}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-10 py-2 border ${errors.cnic ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100`}
                                        required
                                    />
                                    {errors.cnic && <p className="text-red-500 text-sm">{errors.cnic}</p>}
                                </div>

                                <div className="mb-4 relative">
                                    <label htmlFor="designation" className="block text-sm font-medium text-gray-700">
                                        Designation
                                    </label>
                                    <FaFingerprint className="absolute left-3 top-8 text-gray-500" />
                                    <input
                                        type="text"
                                        id="designation"
                                        name="designation"
                                        value={selectedSupervisor.designation || ''}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-10 py-2 border ${errors.designation ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100`}
                                        required
                                    />
                                    {errors.designation && <p className="text-red-500 text-sm">{errors.designation}</p>}
                                </div>

                                <div className="mb-4 relative">
                                    <label htmlFor="designation" className="block text-sm font-medium text-gray-700">
                                        Slots
                                    </label>
                                    <FaFingerprint className="absolute left-3 top-8 text-gray-500" />
                                    <input
                                        type="text"
                                        id="slots"
                                        name="slots"
                                        value={selectedSupervisor.slots || ''}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-10 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100`}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Register
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
