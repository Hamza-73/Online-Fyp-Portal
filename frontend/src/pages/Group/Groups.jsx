import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthApis";
import toast, { Toaster } from "react-hot-toast";
import { SupervisorContext } from "../../context/SupervisorApis";
import Loading from "../Loading";

export default function Groups({ currentUser }) {
    const { getGroups } = useContext(AuthContext);
    const { setDeadline } = useContext(SupervisorContext);
    const [groups, setGroups] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDeadline, setSelectedDeadline] = useState("");
    const [deadlineDate, setDeadlineDate] = useState("");

    console.log("user is ", currentUser)
    useEffect(() => {
        const fetchGroup = async () => {
            const result = await getGroups();
            if (result.success) {
                setGroups(result.data);
            } else {
                toast.error(result.message);
            }
        };
        fetchGroup();
    }, []);

    const handleDeadlineChange = (e) => {
        setDeadlineDate(e.target.value);
    };

    const handleSubmitDeadline = async () => {
        const currentDate = new Date();
        const selectedDate = new Date(deadlineDate);

        // Ensure the selected date is not in the past
        if (!selectedDeadline || !deadlineDate) {
            toast.error("Please select a deadline type and date/time.");
            return;
        }

        if (selectedDate <= currentDate) {
            toast.error("The deadline date and time cannot be in the past.");
            return;
        }

        const result = await setDeadline(selectedDeadline, selectedDate);
        // console.log("deadline response ", result);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
        setDeadlineDate("");
        setSelectedDeadline("");
        setIsModalOpen(false);
    };

    // Get the current date and set the min value for the input
    const getCurrentDateTime = () => {
        const current = new Date();
        const year = current.getFullYear();
        const month = (current.getMonth() + 1).toString().padStart(2, "0");
        const day = current.getDate().toString().padStart(2, "0");
        const hours = current.getHours().toString().padStart(2, "0");
        const minutes = current.getMinutes().toString().padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="max-w-9xl mx-auto px-6">
                <h1 className="text-4xl font-bold text-center text-gray-700 mb-8">Groups</h1>
                <Toaster />

                {groups ? (
                    groups.map((supervisor) => (
                        <div
                            key={supervisor.supervisorId}
                            className="mb-12 bg-white shadow-md rounded-lg p-8 max-w-5xl mx-auto"
                        >
                            {/* Supervisor Section */}
                            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                                {supervisor.supervisorName}
                            </h2>

                            {/* Groups Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {supervisor.groups.map((group) => (
                                    <div
                                        key={group.groupId}
                                        className="bg-gray-50 shadow-md rounded-lg p-6 hover:shadow-lg transition-all duration-300"
                                    >
                                        {/* Group Title */}
                                        <h3 className="text-xl font-semibold text-blue-800 text-center mb-4">
                                            {group.title || "Untitled Group"}
                                        </h3>

                                        {/* Divider */}
                                        <hr className="mb-4 border-gray-300" />

                                        {/* Students List */}
                                        <ul className="space-y-3 text-gray-700">
                                            {group.students.length > 0 ? (
                                                group.students.map((student, index) => (
                                                    <li key={index} className="flex items-center gap-3">
                                                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                                        <span className="font-medium">{student.name} ({student.rollNo})</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-gray-500 italic text-center">No students</li>
                                            )}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <Loading />
                )}

                {
                isModalOpen && (
                    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-8 rounded-xl shadow-xl w-[400px]">
                            {/* Modal Header */}
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Set Deadline</h2>

                            {/* Deadline Type Dropdown */}
                            <div className="mb-5">
                                <label className="block text-gray-700 font-medium mb-2">Select Deadline Type</label>
                                <select
                                    value={selectedDeadline}
                                    onChange={(e) => setSelectedDeadline(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select...</option>
                                    <option value="proposal">Proposal</option>
                                    <option value="documentation">Documentation</option>
                                    <option value="project">Project</option>
                                </select>
                            </div>

                            {/* Date & Time Picker */}
                            <div className="mb-5">
                                <label className="block text-gray-700 font-medium mb-2">Set Date and Time</label>
                                <input
                                    type="datetime-local"
                                    value={deadlineDate}
                                    onChange={handleDeadlineChange}
                                    min={getCurrentDateTime()} // Disable past dates
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Modal Buttons */}
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitDeadline}
                                    className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Button to open the modal */}
                {currentUser?.isCommittee && (
                    <div className="fixed bottom-8 right-8">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition duration-300"
                        >
                            Set Deadline
                        </button>
                    </div>
                )}
            </div>
        </div>

    );
}