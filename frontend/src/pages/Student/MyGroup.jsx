import React, { useContext, useEffect, useState } from "react";
import { StudentContext } from "../../context/StudentApis";
import toast, { Toaster } from "react-hot-toast";

export default function MyGroup() {
    const { fetchMyGroup } = useContext(StudentContext);
    const [myGroup, setMyGroup] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [projectModalData, setProjectModalData] = useState(null);

    useEffect(() => {
        const fetchGroup = async () => {
            const result = await fetchMyGroup();
            if (result.success) setMyGroup(result.group);
            else setMyGroup(null);
        };

        fetchGroup();
    }, []);

    const openModal = (data) => {
        setModalData(data);
    };

    const openProjectModal = () => {
        setProjectModalData({
            title: myGroup.title,
            scope: myGroup.scope,
            description: myGroup.description,
        });
    };

    const closeModal = () => {
        setModalData(null);
        setProjectModalData(null);
    };

    return (
        <>
            <Toaster />
            {myGroup ? (
                <div className="min-h-screen p-6 bg-gray-100">
                    <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow space-y-8">
                        <header className="text-center space-y-2">
                            <h1 className="text-3xl font-semibold text-gray-800">
                                {myGroup.title}
                            </h1>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Supervisor Section */}
                            <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-lg shadow">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    Supervisor
                                </h2>
                                <p className="text-lg font-medium text-gray-800">
                                    <strong>Name:</strong> {myGroup.supervisor.name}
                                </p>
                                {myGroup.supervisor.designation && (
                                    <p className="text-lg">
                                        <strong>Designation:</strong>{" "}
                                        {myGroup.supervisor.designation}
                                    </p>
                                )}
                                {myGroup.supervisor.department && (
                                    <p className="text-lg">
                                        <strong>Department:</strong>{" "}
                                        {myGroup.supervisor.department}
                                    </p>
                                )}
                                {myGroup.supervisor.email && (
                                    <p className="text-lg">
                                        <strong>Email:</strong> {myGroup.supervisor.email}
                                    </p>
                                )}
                            </div>

                            {/* Student Section */}
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    Group Members
                                </h2>
                                {myGroup.students.map((student) => (
                                    <p
                                        key={student._id}
                                        className="cursor-pointer text-lg flex items-center gap-2 font-medium text-blue-600 hover:underline"
                                        onClick={() => openModal(student)}
                                    >

                                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>{student.name}
                                    </p>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col justify-center space-y-4">
                                <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 shadow">
                                    Request Meeting
                                </button>
                                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 shadow">
                                    Extension Request
                                </button>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 shadow">
                                    Upload Document
                                </button>
                                <button
                                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 shadow"
                                    onClick={openProjectModal}
                                >
                                    View Project Details
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Student Modal */}
                    {modalData && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                            onClick={closeModal}
                        >
                            <div
                                className="bg-white p-6 rounded-lg shadow-lg w-[500px] space-y-6 relative"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-3xl font-bold text-gray-800">
                                    Student Details
                                </h2>
                                <div className="space-y-3">
                                    <p className="text-lg">
                                        <strong>Name:</strong> {modalData.name}
                                    </p>
                                    {modalData.rollNo && (
                                        <p className="text-lg">
                                            <strong>Roll No:</strong> {modalData.rollNo}
                                        </p>
                                    )}
                                    {modalData.semester && (
                                        <p className="text-lg">
                                            <strong>Semester:</strong> {modalData.semester}
                                        </p>
                                    )}
                                    {modalData.email && (
                                        <p className="text-lg">
                                            <strong>Email:</strong> {modalData.email}
                                        </p>
                                    )}
                                    {modalData.batch && (
                                        <p className="text-lg">
                                            <strong>Batch:</strong> {modalData.batch}
                                        </p>
                                    )}
                                    {modalData.department && (
                                        <p className="text-lg">
                                            <strong>Department:</strong> {modalData.department}
                                        </p>
                                    )}
                                </div>
                                <button
                                    className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
                                    onClick={closeModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Project Modal */}
                    {projectModalData && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                            onClick={closeModal}
                        >
                            <div
                                className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg shadow-lg w-[700px] max-h-[80vh] overflow-y-auto space-y-6 relative"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-3xl font-bold text-gray-800">
                                    Project Details
                                </h2>
                                <div className="space-y-3">
                                    <p className="text-lg">
                                        <strong>Title:</strong> {projectModalData.title}
                                    </p>
                                    <p className="text-lg">
                                        <strong>Scope:</strong> {projectModalData.scope}
                                    </p>
                                    <p className="text-lg">
                                        <strong>Description:</strong> {projectModalData.description}
                                    </p>
                                </div>
                                <button
                                    className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600"
                                    onClick={closeModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-full flex justify-center">
                    <div className="w-4/6 text-center space-y-4 p-8 bg-gradient-to-r from-red-50 to-red-100 rounded-lg shadow-lg mt-8">
                        <h1 className="text-4xl font-bold text-red-600">
                            You are not enrolled in any group
                        </h1>
                        <p className="text-lg text-gray-700">
                            If you're part of a group, please reach out to your administrator. Otherwise, kindly submit your proposal to your supervisor for approval.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
