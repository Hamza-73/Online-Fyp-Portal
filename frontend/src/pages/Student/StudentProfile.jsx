import React, { useEffect, useContext, useState } from "react";
import { StudentContext } from "../../context/StudentApis"; // Adjust the import path if necessary
import {
  FaUser,
  FaEnvelope,
  FaIdBadge,
  FaSchool,
  FaBook,
  FaIdCard,
} from "react-icons/fa"; // Import relevant icons
import { toast, Toaster } from "react-hot-toast";

export default function StudentProfile({ currentUser, setCurrentUser }) {
  const { editStudent } = useContext(StudentContext);
  const [profile, setProfile] = useState({
    name: "",
    rollNo: "",
    email: "",
    father: "",
    batch: "",
    semester: "",
    cnic: "",
    department: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({ ...profile });
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  // Fetching student profile data
  // useEffect(() => {
  //   const fetchProfile = async () => {
  //     const data = await getProfile();

  //     if (data.success) {
  //       setProfile(data.student);
  //       setFormValues(data.student);
  //     } else {
  //       console.error(data.message);
  //     }
  //   };

  //   fetchProfile();
  // }, [getProfile]);

  useEffect(() => {
    if (currentUser) setFormValues(currentUser);
  }, [currentUser]);

  // Handle input changes
  const handleInputChange = (e) => {
    let { name, value } = e.target;

    // Handle special rules for fields
    if (name === "name" || name === "father") {
      value = value.replace(/^\s+/, "").replace(/\s{2,}/g, " ");
    }

    if (name === "rollNo" || name === "email" || name === "cnic") {
      value = value.replace(/\s/g, "");
    }

    // Update form values
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));

    const isValid = value.length > 0; // Basic validation: ensure the value is not empty
    setIsSaveDisabled(
      !isValid ||
        JSON.stringify(profile) ===
          JSON.stringify({ ...formValues, [name]: value })
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { name, rollNo, email, father, batch, semester, cnic, department } =
      formValues;

    if (
      !name ||
      !rollNo ||
      !email ||
      !father ||
      !batch ||
      !semester ||
      !cnic ||
      !department
    ) {
      toast.error("All fields are required.");
      return;
    }

    const response = await editStudent(profile._id, formValues);
    if (response.success) {
      setProfile(formValues);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setIsSaveDisabled(true);
    } else {
      toast.error(
        response.message || "An error occurred while updating the profile."
      );
    }
  };

  const handleCancel = () => {
    setFormValues(profile);
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
          {/* Full Name and Roll Number in one line */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
                <FaUser className="ml-2 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  className="mt-1 p-2 block w-full border-none focus:outline-none"
                  disabled
                />
              </div>
            </div>

            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">
                Father's Name
              </label>
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
                <FaUser className="ml-2 text-gray-500" />
                <input
                  type="text"
                  name="father"
                  value={formValues.father}
                  onChange={handleInputChange}
                  className="mt-1 p-2 block w-full border-none focus:outline-none"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Email and Father's Name in one line */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">
                Roll Number
              </label>
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
                <FaIdBadge className="ml-2 text-gray-500" />
                <input
                  type="text"
                  name="rollNo"
                  value={formValues.rollNo}
                  onChange={handleInputChange}
                  className="mt-1 p-2 block w-full border-none focus:outline-none"
                  disabled
                />
              </div>
            </div>

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
          </div>

          {/* Batch and Semester in one line */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">
                Batch
              </label>
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
                <FaSchool className="ml-2 text-gray-500" />
                <input
                  type="text"
                  name="batch"
                  value={formValues.batch}
                  onChange={handleInputChange}
                  className="mt-1 p-2 block w-full border-none focus:outline-none"
                  disabled
                />
              </div>
            </div>

            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">
                Semester
              </label>
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
                <FaBook className="ml-2 text-gray-500" />
                <input
                  type="number"
                  name="semester"
                  value={formValues.semester}
                  onChange={handleInputChange}
                  className="mt-1 p-2 block w-full border-none focus:outline-none"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* CNIC and Department in one line */}
          <div className="flex space-x-4">
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
                  disabled
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
                  disabled
                />
              </div>
            </div>
          </div>

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
