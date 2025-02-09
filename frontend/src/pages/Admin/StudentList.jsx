import React, { useContext, useEffect, useState } from 'react';
import { server } from '../../server';
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthApis.jsx';
import { StudentContext } from '../../context/StudentApis.jsx';
import { FaUser, FaEnvelope, FaLock, FaIdCard, FaBook, FaUserFriends, FaBuilding, FaFingerprint } from 'react-icons/fa';

export default function StudentList({ userData }) {
    const navigate = useNavigate();
    const { registerStudent } = useContext(AuthContext);
    const { deleteStudent , registerStudentFromFile} = useContext(StudentContext);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [errors, setErrors] = useState({});

    const getStudents = async () => {
        try {
            const res = await fetch(`${server}/student/students`, { method: 'GET' });
            const json = await res.json();
            setStudents(json.students);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    useEffect(() => {
        getStudents();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedStudent((prevStudent) => ({
            ...prevStudent,
            [name]: value,
        }));
    };


    const handleAddClick = () => {
        setSelectedStudent({});
        setIsAdding(true);
        setShowModal(true);
        setErrors({}); // Reset errors when opening modal
    };

    const validateForm = () => {
        const newErrors = {};
        // Required fields
        ['name', 'father', 'email', 'rollNo', 'batch', 'cnic', 'department', 'semester'].forEach(field => {
            if (!selectedStudent[field]) {
                newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
            }
        });
        // Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (selectedStudent.email && !emailRegex.test(selectedStudent.email)) {
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
        const studentData = {
            ...selectedStudent,
        };

        try {
            const response = await registerStudent(studentData);
            if (response.success) {
                toast.success('Student registered successfully!');
                getStudents();
                setShowModal(false);
                setSelectedStudent({}); // Reset selected student
            } else {
                toast.error(response.message || 'Failed to register student.');
            }
        } catch (error) {
            console.error('Error registering student:', error);
            toast.error('An error occurred while registering the student.');
        }
    };

    const handleFileUpload = async (e) => {
        // console.log("reninng")
        const file = e.target.files[0];
        if (!file) return;

        try {
            const response = await registerStudentFromFile(file);
            console.log("response is ", response)
            if (response.success) {
                setStudents((prev) => [...prev, ...response.newStudents]);
                toast.success('Students registered successfully from file.');
            } else {
                toast.error(response.message || 'Failed to register admins from file.');
            }
        } catch (error) {
            toast.error(error.message || 'Error processing file.');
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this student?");
        if (confirmDelete) {
            const res = await deleteStudent(id);
            if (res.success) {
                toast.success('Student deleted successfully!');
                setStudents((prevStudent) => prevStudent.filter(students => students._id !== id));
            } else {
                toast.error(res.message || 'Failed to delete student.');
            }
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold text-center mb-6">Student List</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="py-3 px-6 text-left">Name</th>
                            <th className="py-3 px-6 text-left">Email</th>
                            <th className="py-3 px-6 text-left">Roll No</th>
                            <th className="py-3 px-6 text-left">Batch</th>
                            <th className="py-3 px-6 text-left">Semester</th>
                            <th className="py-3 px-6 text-left">Department</th>
                            <th className="py-3 px-6 text-left">Cnic</th> {/* Added CNIC Column */}
                            {(userData?.superAdmin || userData?.write_permission) && <th className="py-3 px-6 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student._id} className="border-b hover:bg-slate-100">
                                <td className="py-3 px-6">{student.name}</td>
                                <td className="py-3 px-6">{student.email}</td>
                                <td className="py-3 px-6">{student.rollNo}</td>
                                <td className="py-3 px-6">{student.batch}</td>
                                <td className="py-3 px-6">{student.semester}</td>
                                <td className="py-3 px-6">{student.department}</td>
                                <td className="py-3 px-6">{student.cnic}</td> {/* Display CNIC */}
                                {(userData?.superAdmin || userData?.write_permission) &&
                                    <td className="py-3 px-6 text-center flex justify-center space-x-4">
                                        <Link to={`/admin/edit-student-profile/${student._id}`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                            Edit
                                        </Link>
                                        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                            onClick={() => handleDelete(student._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>}
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
                    Add Student
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
                        <h2 className="text-xl font-semibold mb-4 text-center">Add Student</h2>
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
                                        value={selectedStudent.name || ''}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-10 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100`}
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                                </div>

                                <div className="mb-4 relative">
                                    <label htmlFor="father" className="block text-sm font-medium text-gray-700">
                                        Father's Name
                                    </label>
                                    <FaUserFriends className="absolute left-3 top-8 text-gray-500" />
                                    <input
                                        type="text"
                                        id="father"
                                        name="father"
                                        value={selectedStudent.father || ''}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-10 py-2 border ${errors.father ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100`}
                                        required
                                    />
                                    {errors.father && <p className="text-red-500 text-sm">{errors.father}</p>}
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
                                        value={selectedStudent.email || ''}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-10 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100`}
                                        required
                                    />
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                                </div>

                                <div className="mb-4 relative">
                                    <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700">
                                        Roll No
                                    </label>
                                    <FaIdCard className="absolute left-3 top-8 text-gray-500" />
                                    <input
                                        type="text"
                                        id="rollNo"
                                        name="rollNo"
                                        value={selectedStudent.rollNo || ''}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-10 py-2 border ${errors.rollNo ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100`}
                                        required
                                    />
                                    {errors.rollNo && <p className="text-red-500 text-sm">{errors.rollNo}</p>}
                                </div>

                                <div className="mb-4 relative">
                                    <label htmlFor="batch" className="block text-sm font-medium text-gray-700">
                                        Batch
                                    </label>
                                    <FaBook className="absolute left-3 top-8 text-gray-500" />
                                    <input
                                        type="text"
                                        id="batch"
                                        name="batch"
                                        value={selectedStudent.batch || ''}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-10 py-2 border ${errors.batch ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100`}
                                        required
                                    />
                                    {errors.batch && <p className="text-red-500 text-sm">{errors.batch}</p>}
                                </div>

                                <div className="mb-4 relative">
                                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                                        Semester
                                    </label>
                                    <FaBuilding className="absolute left-3 top-8 text-gray-500" />
                                    <input
                                        type="text"
                                        id="semester"
                                        name="semester"
                                        value={selectedStudent.semester || ''}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-10 py-2 border ${errors.semester ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100`}
                                        required
                                    />
                                    {errors.semester && <p className="text-red-500 text-sm">{errors.semester}</p>}
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
                                        value={selectedStudent.department || ''}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-10 py-2 border ${errors.department ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100`}
                                        required
                                    />
                                    {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}
                                </div>

                                <div className="mb-4 relative">
                                    <label htmlFor="cnic" className="block text-sm font-medium text-gray-700">
                                        CNIC
                                    </label>
                                    <FaFingerprint className="absolute left-3 top-8 text-gray-500" />
                                    <input
                                        type="text"
                                        id="cnic"
                                        name="cnic"
                                        value={selectedStudent.cnic || ''}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-10 py-2 border ${errors.cnic ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100`}
                                        required
                                    />
                                    {errors.cnic && <p className="text-red-500 text-sm">{errors.cnic}</p>}
                                </div>

                            </div>
                            <div className="flex justify-end">
                                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-300 text-black px-4 py-2 rounded mr-2">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                    {isAdding ? 'Add Student' : 'Update Student'}
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
