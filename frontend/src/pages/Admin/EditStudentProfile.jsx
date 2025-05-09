import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { StudentContext } from "../../context/StudentApis.jsx";
import { toast, Toaster } from "react-hot-toast";

export default function EditStudentProfile() {
  const { id } = useParams(); // Get the student ID from the URL
  const [student, setStudent] = useState(null); // State to store student details
  const [loading, setLoading] = useState(true); // State to manage loading state
  const { editStudentProfile, getStudentProfile } = useContext(StudentContext); // Access edit function from context

  const [isEditing, setIsEditing] = useState(false); // State to manage edit mode
  const [originalData, setOriginalData] = useState({}); // State to store original student data
  const [editedStudent, setEditedStudent] = useState({}); // State to track edited student data

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const data = await getStudentProfile(id); // Call the API method to fetch the student profile
        if (data.success) {
          setStudent(data.student); // Set student data in state
          setOriginalData(data.student); // Store the original data for comparison
          setEditedStudent(data.student); // Initialize editedStudent with fetched data
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        console.error("Error fetching student data:", err);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchStudent();
  }, [id]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing); // Toggle edit mode
  };

  const handleChange = (e) => {
    let { name, value } = e.target; // Get input name and value

    // Only normalize the value if the field is being saved, allowing spaces while typing
    if (name === "name" || name === "father") {
      value = value.replace(/^\s+/, ""); // Remove leading spaces
      value = value.replace(/\s{2,}/g, " "); // Replace multiple spaces with a single space
    }

    // Remove spaces from email
    if (name === "email") {
      value = value.replace(/\s+/g, ""); // Remove all spaces
    }

    setEditedStudent((prev) => ({ ...prev, [name]: value })); // Update edited student data
  };

  const handleCancel = () => {
    setEditedStudent(originalData); // Reset to original data
    setIsEditing(false); // Exit edit mode
  };

  const handleSave = async () => {
    // Normalize before saving
    const normalizedEditedStudent = {
      ...editedStudent,
      name: editedStudent.name.replace(/\s+/g, " ").trim(), // Normalize name
      father: editedStudent.father.replace(/\s+/g, " ").trim(), // Normalize father's name
      email: editedStudent.email.replace(/\s+/g, ""), // Remove spaces from email
    };

    const data = await editStudentProfile(id, normalizedEditedStudent); // Call the API method to update the student profile
    if (data.success) {
      setStudent(normalizedEditedStudent); // Update the displayed student data immediately
      setOriginalData(normalizedEditedStudent); // Update the original data to match the edited data
      setIsEditing(false); // Exit edit mode
      toast.success(data.message);
    } else {
      toast.error(data.message);
    }
  };

  const isSaveDisabled = Object.keys(originalData).every(
    (key) =>
      originalData[key].toString().trim().toLowerCase() ===
      editedStudent[key].toString().trim().toLowerCase()
  ); // Check if the data has changed case-insensitively, ignoring leading/trailing spaces

  const currentYear = new Date().getFullYear();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Student Profile
        </h2>

        {student && (
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            {/* Grid for Name and Father's Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editedStudent.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="p-3 border border-gray-300 rounded-md w-full"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Father's Name
                </label>
                <input
                  type="text"
                  name="father"
                  value={editedStudent.father}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="p-3 border border-gray-300 rounded-md w-full"
                />
              </div>
            </div>

            {/* Grid for Roll No, Email, Semester, Batch */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Roll No
                </label>
                <input
                  type="text"
                  name="rollNo"
                  value={editedStudent.rollNo}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="p-3 border border-gray-300 rounded-md w-full"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editedStudent.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="p-3 border border-gray-300 rounded-md w-full"
                />
              </div>

              {/* Semester Dropdown */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Semester
                </label>
                <select
                  name="semester"
                  value={editedStudent.semester}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="p-3 border border-gray-300 rounded-md w-full"
                >
                  <option value="">Select Semester</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                </select>
              </div>

              {/* Batch Dropdown */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Batch
                </label>
                <select
                  name="batch"
                  value={editedStudent.batch}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="p-3 border border-gray-300 rounded-md w-full"
                >
                  <option value="">Select Batch</option>
                  {Array.from({ length: currentYear - 2017 + 1 }, (_, i) => {
                    const start = 2017 + i;
                    const end = start + 4;
                    return (
                      <option key={start} value={`${start}-${end}`}>
                        {`${start}-${end}`}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Grid for CNIC and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  CNIC
                </label>
                <input
                  type="text"
                  name="cnic"
                  value={editedStudent.cnic}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="p-3 border border-gray-300 rounded-md w-full"
                />
              </div>

              {/* Department Dropdown */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Department
                </label>
                <select
                  name="department"
                  value={editedStudent.department}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="p-3 border border-gray-300 rounded-md w-full"
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
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaveDisabled}
                    className={`p-2 rounded-md text-white ${
                      isSaveDisabled
                        ? "bg-gray-400"
                        : "bg-blue-500 hover:bg-blue-700"
                    } transition duration-200`}
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
