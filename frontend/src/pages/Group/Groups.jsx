import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthApis";
import toast, { Toaster } from "react-hot-toast";
import { SupervisorContext } from "../../context/SupervisorApis";

export default function Groups({ userData }) {
    const { getGroups } = useContext(AuthContext);
    const { setDeadline } = useContext(SupervisorContext);
    const [groups, setGroups] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDeadline, setSelectedDeadline] = useState("");
    const [deadlineDate, setDeadlineDate] = useState("");
    
    console.log("user is ", userData)
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
        }else{
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
        <div className="p-8 min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
                Groups
            </h1>
            <Toaster />
            {groups ? (
                groups.map((supervisor) => (
                    <div
                        key={supervisor.supervisorId}
                        className="mb-12 mx-auto bg-white rounded-lg shadow-lg p-6 max-w-5xl"
                    >
                        {/* Supervisor Section */}
                        <h2 className="text-3xl font-semibold mb-4 text-center">
                            {supervisor.supervisorName}
                        </h2>
                        {/* Groups Section */}
                        <div className="flex flex-wrap justify-center gap-6">
                            {supervisor.groups.map((group) => (
                                <div
                                    key={group.groupId}
                                    className="rounded-xl cursor-pointer shadow-lg p-6 w-80 hover:scale-105 transition-transform duration-300 from bg-gray-100 to bg-gray-200 "
                                >
                                    {/* Group Title */}
                                    <h2 className="text-xl font-bold text-blue-800 text-center mb-4">
                                        {group.title || "Untitled Group"}
                                    </h2>

                                    {/* Divider */}
                                    <hr className="mb-4 border-blue-300" />

                                    {/* Students */}
                                    <ul className="space-y-3">
                                        {group.students.length > 0 ? (
                                            group.students.map((student, index) => (
                                                <li key={index} className="flex items-center gap-3">
                                                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                                    <span className="text-gray-700 font-medium">
                                                        {student.name} ({student.rollNo})
                                                    </span>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-gray-500 italic">No students</li>
                                        )}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-gray-600 text-center">Loading groups...</p>
            )}

            {/* Deadline Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-xl font-semibold mb-4 text-center">Set Deadline</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Select Deadline Type</label>
                            <select
                                value={selectedDeadline}
                                onChange={(e) => setSelectedDeadline(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            >
                                <option value="">Select...</option>
                                <option value="proposal">Proposal</option>
                                <option value="documentation">Documentation</option>
                                <option value="project">Project</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Set Date and Time</label>
                            <input
                                type="datetime-local"
                                value={deadlineDate}
                                onChange={handleDeadlineChange}
                                min={getCurrentDateTime()} // Disable current date and time
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div className="flex justify-between">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitDeadline}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Button to open the modal */}
            {(userData && userData.isCommittee) && <div className="fixed bottom-8 right-8">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-300"
                >
                    Set Deadline
                </button>
            </div>}
        </div>
    );
}
