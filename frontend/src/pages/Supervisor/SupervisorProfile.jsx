import React, { useEffect, useContext, useState } from "react";
import { SupervisorContext } from "../../context/SupervisorApis"; // Adjust the import path if necessary
import {
  FaBook,
  FaUser,
  FaEnvelope,
  FaIdBadge,
  FaSchool,
  FaBuilding,
  FaIdCard,
} from "react-icons/fa"; // Use relevant icons
import { toast, Toaster } from "react-hot-toast";

export default function SupervisorProfile({ currentUser, setCurrentUser }) {
  const { getProfile, editSupervisorProfile } = useContext(SupervisorContext); // Fetch supervisor-related APIs from context
  const [supervisor, setSupervisor] = useState({
    name: "",
    username: "",
    cnic: "",
    email: "",
    designation: "",
    department: "",
    slots: 0,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({ ...supervisor });
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  useEffect(() => {
    if (currentUser) setFormValues(currentUser);
  }, [currentUser]);

  // Fetching supervisor supervisor data
  // useEffect(() => {
  //   const fetchProfile = async () => {
  //     const data = await getProfile();
  //     console.log("supervisor is ", data)

  //     if (data.success) {
  //       setSupervisor(data.supervisor);
  //       setFormValues(data.supervisor);
  //     } else {
  //       console.error(data.message);
  //     }
  //   };

  //   fetchProfile();
  // }, [getProfile]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));

    const isValid = value.length > 0;
    setIsSaveDisabled(
      !isValid ||
        JSON.stringify(supervisor) ===
          JSON.stringify({ ...formValues, [name]: value })
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { name, username, cnic, email, designation, department, slots } =
      formValues;

    if (
      !name ||
      !username ||
      !cnic ||
      !email ||
      !designation ||
      !department ||
      slots < 0
    ) {
      toast.error("All fields are required and slots must be 0 or greater.");
      return;
    }

    const response = await editSupervisorProfile(supervisor._id, formValues);
    if (response.success) {
      setSupervisor(formValues);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setIsSaveDisabled(true);
    } else {
      toast.error(
        response.message || "An error occurred while updating the supervisor."
      );
    }
  };

  const handleCancel = () => {
    setFormValues(supervisor);
    setIsEditing(false);
    setIsSaveDisabled(true);
  };

  return (
    <div className="min-h-screen flex justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 md:w-1/2 w-full flex flex-col h-[90vh]">
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
          {/* Name and Username */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
                <FaUser className="ml-2 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  className="mt-1 p-2 block w-full border-none focus:outline-none"
                  disabled={true}
                />
              </div>
            </div>

            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
                <FaIdBadge className="ml-2 text-gray-500" />
                <input
                  type="text"
                  name="username"
                  value={formValues.username}
                  onChange={handleInputChange}
                  className="mt-1 p-2 block w-full border-none focus:outline-none"
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Email and CNIC */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
                <FaEnvelope className="ml-2 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleInputChange}
                  className="mt-1 p-2 block w-full border-none focus:outline-none"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">
                CNIC
              </label>
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
                <FaIdCard className="ml-2 text-gray-500" />
                <input
                  type="text"
                  name="cnic"
                  value={formValues.cnic}
                  onChange={handleInputChange}
                  className="mt-1 p-2 block w-full border-none focus:outline-none"
                  disabled={true}
                />
              </div>
            </div>
          </div>

          {/* Designation and Department */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">
                Designation
              </label>
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
                <FaBuilding className="ml-2 text-gray-500" />
                <input
                  type="text"
                  name="designation"
                  value={formValues.designation}
                  onChange={handleInputChange}
                  className="mt-1 p-2 block w-full border-none focus:outline-none"
                  disabled={true}
                />
              </div>
            </div>

            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
                <FaSchool className="ml-2 text-gray-500" />
                <input
                  type="text"
                  name="department"
                  value={formValues.department}
                  onChange={handleInputChange}
                  className="mt-1 p-2 block w-full border-none focus:outline-none"
                  disabled={true}
                />
              </div>
            </div>
          </div>

          {/* Slots */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Available Slots
            </label>
            <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
              <FaBook className="ml-2 text-gray-500" />
              <input
                type="number"
                name="slots"
                value={formValues.slots}
                onChange={handleInputChange}
                className="mt-1 p-2 block w-full border-none focus:outline-none"
                disabled={true}
              />
            </div>
          </div>

          {/* Buttons */}
          {isEditing ? (
            <div className="flex justify-between mt-4">
              <button
                type="button"
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${
                  isSaveDisabled
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white px-4 py-2 rounded-md`}
                disabled={isSaveDisabled}
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex justify-end mt-4">
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </div>
          )}
        </form>
        <Toaster />
      </div>
    </div>
  );
}
