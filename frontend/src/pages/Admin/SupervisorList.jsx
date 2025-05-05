import React, { useContext, useEffect, useState } from "react";
import { server } from "../../server";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AuthContext } from "../../context/AuthApis.jsx";
import { SupervisorContext } from "../../context/SupervisorApis.jsx";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaBuilding,
  FaIdCard,
  FaUserTie,
  FaFingerprint,
} from "react-icons/fa";

export default function SupervisorList({ currentUser }) {
  const navigate = useNavigate();
  const { registerSupervisor } = useContext(AuthContext);
  const { deleteSupervisor, registerSupervisorFromFile } =
    useContext(SupervisorContext);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const getSupervisors = async () => {
    try {
      const res = await fetch(`${server}/supervisor/supervisors`, {
        method: "GET",
      });
      const json = await res.json();
      setSupervisors(json.supervisors);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
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
    ["name", "username", "email", "cnic", "designation"].forEach((field) => {
      if (!selectedSupervisor[field]) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required.`;
      }
    });
    // CNIC format
    const cnicRegex = /^\d{13}$/;
    if (selectedSupervisor.cnic && !cnicRegex.test(selectedSupervisor.cnic)) {
      newErrors.cnic = "CNIC must be exactly 13 digits.";
    }
    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      selectedSupervisor.email &&
      !emailRegex.test(selectedSupervisor.email)
    ) {
      newErrors.email = "Invalid email format.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }
    const supervisorData = {
      ...selectedSupervisor,
    };

    try {
      const response = await registerSupervisor(supervisorData);
      if (response.success) {
        toast.success("Supervisor registered successfully!");
        getSupervisors();
        setShowModal(false);
        setSelectedSupervisor({}); // Reset selected supervisor
      } else {
        toast.error(response.message || "Failed to register supervisor.");
      }
    } catch (error) {
      console.error("Error registering supervisor:", error);
      toast.error("An error occurred while registering the supervisor.");
    }
  };

  const handleFileUpload = async (e) => {
    // console.log("reninng")
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await registerSupervisorFromFile(file);
      // console.log("response is ", response)
      if (response.success) {
        setSupervisors((prev) => [...prev, ...response.newSupervisors]);
        toast.success("Students registered successfully from file.");
      } else {
        toast.error(response.message || "Failed to register admins from file.");
      }
    } catch (error) {
      toast.error(error.message || "Error processing file.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this supervisor?"
    );
    if (confirmDelete) {
      const res = await deleteSupervisor(id);
      if (res.success) {
        toast.success("Supervisor deleted successfully!");
        setSupervisors((prevSupervisors) =>
          prevSupervisors.filter((supervisor) => supervisor._id !== id)
        );
      } else {
        toast.error(res.message || "Failed to delete supervisor.");
      }
    }
  };

  const filteredSupervisors = supervisors.filter((supervisor) => {
    const lowerQuery = searchQuery.toLowerCase();
    return (
      supervisor.name?.toString().toLowerCase().includes(lowerQuery) ||
      supervisor.username?.toString().toLowerCase().includes(lowerQuery) ||
      supervisor.email?.toString().toLowerCase().includes(lowerQuery) ||
      supervisor.designation?.toString().toLowerCase().includes(lowerQuery) ||
      supervisor.cnic?.toString().includes(lowerQuery) ||
      supervisor.slots?.toString().includes(lowerQuery)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-center mb-6">
        Supervisor List
      </h1>
      <div className="container mx-auto px-4 py-6">
        {/* Search bar */}
        <div className="relative w-full mb-6">
          <input
            type="text"
            placeholder="Search by name, username, email, designation, CNIC or slots"
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Table */}
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
                {(currentUser?.superAdmin || currentUser?.write_permission) && (
                  <th className="py-3 px-6 text-center">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredSupervisors.map((supervisor) => (
                <tr
                  key={supervisor._id}
                  className="border-b hover:bg-slate-100"
                >
                  <td className="py-3 px-6">{supervisor.name}</td>
                  <td className="py-3 px-6">{supervisor.username}</td>
                  <td className="py-3 px-6">{supervisor.email}</td>
                  <td className="py-3 px-6">{supervisor.designation}</td>
                  <td className="py-3 px-6">{supervisor.cnic}</td>
                  <td className="py-3 px-6">{supervisor.slots}</td>
                  {(currentUser?.superAdmin ||
                    currentUser?.write_permission) && (
                    <td className="py-3 px-6 text-center flex justify-center space-x-4">
                      <Link
                        to={`/admin/edit-supervisor-profile/${supervisor._id}`}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(supervisor._id)}
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
      </div>
      <div className="mt-4 flex justify-between items-center">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={handleAddClick}
        >
          Add Supervisor
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Add Supervisor
            </h2>
            <form onSubmit={handleRegister}>
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="mb-4 relative">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <FaUser className="absolute left-3 top-8 text-gray-500" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={selectedSupervisor.name || ""}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-10 py-2 border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm bg-gray-100`}
                    required
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>

                {/* Username */}
                <div className="mb-4 relative">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Username
                  </label>
                  <FaUserTie className="absolute left-3 top-8 text-gray-500" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={selectedSupervisor.username || ""}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-10 py-2 border ${
                      errors.username ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm bg-gray-100`}
                    required
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm">{errors.username}</p>
                  )}
                </div>

                {/* Department Dropdown */}
                <div className="mb-4 relative">
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Department
                  </label>
                  <FaBuilding className="absolute left-3 top-8 text-gray-500" />
                  <select
                    id="department"
                    name="department"
                    value={selectedSupervisor.department || ""}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-10 py-2 border ${
                      errors.department ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm bg-gray-100`}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Software Engineering">
                      Software Engineering
                    </option>
                    <option value="Artificial Intelligence">
                      Artificial Intelligence
                    </option>
                  </select>
                  {errors.department && (
                    <p className="text-red-500 text-sm">{errors.department}</p>
                  )}
                </div>

                {/* Email */}
                <div className="mb-4 relative">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <FaEnvelope className="absolute left-3 top-8 text-gray-500" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={selectedSupervisor.email || ""}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-10 py-2 border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm bg-gray-100`}
                    required
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                {/* CNIC */}
                <div className="mb-4 relative">
                  <label
                    htmlFor="cnic"
                    className="block text-sm font-medium text-gray-700"
                  >
                    CNIC
                  </label>
                  <FaIdCard className="absolute left-3 top-8 text-gray-500" />
                  <input
                    type="text"
                    id="cnic"
                    name="cnic"
                    value={selectedSupervisor.cnic || ""}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-10 py-2 border ${
                      errors.cnic ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm bg-gray-100`}
                    required
                  />
                  {errors.cnic && (
                    <p className="text-red-500 text-sm">{errors.cnic}</p>
                  )}
                </div>

                {/* Designation Dropdown */}
                <div className="mb-4 relative">
                  <label
                    htmlFor="designation"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Designation
                  </label>
                  <FaFingerprint className="absolute left-3 top-8 text-gray-500" />
                  <select
                    id="designation"
                    name="designation"
                    value={selectedSupervisor.designation || ""}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-10 py-2 border ${
                      errors.designation ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm bg-gray-100`}
                    required
                  >
                    <option value="">Select Designation</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Assistant Professor">
                      Assistant Professor
                    </option>
                    <option value="Professor">Professor</option>
                  </select>
                  {errors.designation && (
                    <p className="text-red-500 text-sm">{errors.designation}</p>
                  )}
                </div>

                {/* Slots */}
                <div className="mb-4 relative">
                  <label
                    htmlFor="slots"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Slots
                  </label>
                  <FaFingerprint className="absolute left-3 top-8 text-gray-500" />
                  <input
                    type="text"
                    id="slots"
                    name="slots"
                    value={selectedSupervisor.slots || ""}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-10 py-2 border ${
                      errors.slots ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm bg-gray-100`}
                    required
                  />
                  {errors.slots && (
                    <p className="text-red-500 text-sm">{errors.slots}</p>
                  )}
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
