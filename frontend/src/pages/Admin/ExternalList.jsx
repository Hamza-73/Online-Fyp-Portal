import React, { useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthApis.jsx";
import { FaUser, FaEnvelope, FaIdCard, FaUserTie } from "react-icons/fa";

export default function ExternalList({ currentUser }) {
  const navigate = useNavigate();
  const { registerExternal, deleteExternal, editExternal, getExternals } =
    useContext(AuthContext);
  const [externals, setExternals] = useState([]);
  const [selectedExternal, setSelectedExternal] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const fetchExternals = async () => {
    try {
      const response = await getExternals();
      if (response.success) {
        setExternals(response.externals);
      } else {
        toast.error(response.message || "Failed to fetch externals.");
      }
    } catch (error) {
      console.error("Error fetching externals:", error);
    }
  };
  useEffect(() => {
    fetchExternals();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedExternal((prevExternal) => ({
      ...prevExternal,
      [name]: value,
    }));
  };

  const handleAddClick = () => {
    setSelectedExternal({});
    setShowModal(true);
    setErrors({}); // Reset errors when opening modal
  };

  const handleEditClick = (data) => {
    setSelectedExternal(data);
    setIsEditing(true);
    setShowModal(true);
    setErrors({}); // Reset errors when opening modal
  };

  const validateForm = () => {
    const newErrors = {};
    // Required fields
    ["name", "username", "email", "phone"].forEach((field) => {
      if (!selectedExternal[field]) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required.`;
      }
    });
    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (selectedExternal.email && !emailRegex.test(selectedExternal.email)) {
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
    const externalData = {
      ...selectedExternal,
    };

    try {
      const response = await registerExternal(externalData);
      if (response.success) {
        toast.success("external registered successfully!");
        setExternals((prev) => [...prev, externalData]);
        setShowModal(false);
        setSelectedExternal({}); // Reset selected external
      } else {
        toast.error(response.message || "Failed to register external.");
      }
    } catch (error) {
      console.error("Error registering external:", error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }
    const externalData = {
      ...selectedExternal,
    };

    try {
      const response = await editExternal(externalData, selectedExternal._id);
      if (response.success) {
        toast.success("external edited successfully!");
        setExternals((prev) =>
          prev.map((external) =>
            external._id === selectedExternal._id ? externalData : external
          )
        );
        setShowModal(false);
        setSelectedExternal({}); // Reset selected external
      } else {
        toast.error(response.message || "Failed to edit external.");
      }
    } catch (error) {
      console.error("Error editing external:", error);
    }
  };

  //   const handleFileUpload = async (e) => {
  //     // console.log("reninng")
  //     const file = e.target.files[0];
  //     if (!file) return;

  //     try {
  //       const response = await registerSupervisorFromFile(file);
  //       // console.log("response is ", response)
  //       if (response.success) {
  //         setExternals((prev) => [...prev, ...response.newSupervisors]);
  //         toast.success("Students registered successfully from file.");
  //       } else {
  //         toast.error(response.message || "Failed to register admins from file.");
  //       }
  //     } catch (error) {
  //       toast.error(error.message || "Error processing file.");
  //     }
  //   };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this external?"
    );
    if (confirmDelete) {
      const res = await deleteExternal(id);
      if (res.success) {
        toast.success("external deleted successfully!");
        setExternals((prevSupervisors) =>
          prevSupervisors.filter((external) => external._id !== id)
        );
      } else {
        toast.error(res.message || "Failed to delete external.");
      }
    }
  };

  const filteredExternals = externals.filter((external) => {
    const lowerQuery = searchQuery.toLowerCase();
    return (
      external.name?.toString().toLowerCase().includes(lowerQuery) ||
      external.username?.toString().toLowerCase().includes(lowerQuery) ||
      external.email?.toString().toLowerCase().includes(lowerQuery) ||
      external.phone?.toString().toLowerCase().includes(lowerQuery)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-center mb-6">External List</h1>
      <div className="container mx-auto px-4 py-6">
        {/* Search bar */}
        <div className="relative w-full mb-6">
          <input
            type="text"
            placeholder="Search by name, username, email, phone..."
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
                <th className="py-3 px-6 text-left">Phone</th>
                {(currentUser?.superAdmin || currentUser?.write_permission) && (
                  <th className="py-3 px-6 text-center">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredExternals.map((external) => (
                <tr key={external._id} className="border-b hover:bg-slate-100">
                  <td className="py-3 px-6">{external.name}</td>
                  <td className="py-3 px-6">{external.username}</td>
                  <td className="py-3 px-6">{external.email}</td>
                  <td className="py-3 px-6">{external.phone}</td>
                  {(currentUser?.superAdmin ||
                    currentUser?.write_permission) && (
                    <td className="py-3 px-6 text-center flex justify-center space-x-4">
                      <button
                        onClick={() => handleEditClick(external)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(external._id)}
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
          Add external
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
            accept=".xlsx, .xls, .csv"
          />
        </label>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative">
            <h2 className="text-xl font-semibold mb-4 text-center">
              {isEditing ? "Edit" : "Add"} External
            </h2>
            <form onSubmit={isEditing ? handleEdit : handleRegister}>
              <div className="grid grid-cols-handleedit gap-4">
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
                    value={selectedExternal.name || ""}
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
                    value={selectedExternal.username || ""}
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
                    value={selectedExternal.email || ""}
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

                {/* Phone */}
                <div className="mb-4 relative">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone
                  </label>
                  <FaIdCard className="absolute left-3 top-8 text-gray-500" />
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={selectedExternal.phone || ""}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-10 py-2 border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm bg-gray-100`}
                    required
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm">{errors.phone}</p>
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
                  {isEditing ? "Edit" : "register"}
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
