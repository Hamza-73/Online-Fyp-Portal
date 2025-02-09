import React, { useContext, useEffect, useState } from "react";
import { StudentContext } from "../../context/StudentApis";
import toast, { Toaster } from "react-hot-toast";

export default function MyGroup() {
    const { fetchMyGroup, uploadDocument } = useContext(StudentContext);
    const [myGroup, setMyGroup] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [projectModalData, setProjectModalData] = useState(null);
    const [uploadModal, setUploadModal] = useState(false); // Upload Document Modal State
    const [file, setFile] = useState(null);
    const [comment, setComment] = useState("");
    const [webLink, setWebLink] = useState("");
    const [expandedComment, setExpandedComment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [webLinkError, setWebLinkError] = useState("");

    useEffect(() => {
        const fetchGroup = async () => {
            const result = await fetchMyGroup();
            if (result.success) setMyGroup(result.group);
            else setMyGroup(null);
            console.log("group is ", result.group);
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
        setUploadModal(false); // Close Upload Modal
        setWebLink(null);
        setWebLinkError(null);
        setFile(null);
    };

    const handleUploadDocument = async (e) => {
        e.preventDefault();
        const maxFileSize = 2 * 1024 * 1024;
        // Check if the file size is within the allowed limit
        if (file && file.size > maxFileSize) {
            toast.error("File Size Should be less than 2MB");
            return;
        }

        const formData = new FormData();
        if (file) formData.append("doc", file);
        if (comment) formData.append("comment", comment);
        if (webLink) formData.append("webLink", webLink);
        setLoading(true);
        const response = await uploadDocument(formData);
        // console.log("response is ", response)
        if (response.success) {
            setLoading(false);
            toast.success("Document uploaded successfully!");
            setMyGroup({
                ...myGroup,
                docs: [...myGroup.docs, response.doc],
            });
            closeModal();
        } else {
            setLoading(false);
            toast.error(response.message || "Failed to upload document.");
        }
    };

    const toggleComment = (index) => {
        setExpandedComment(expandedComment === index ? null : index);
    };

    // Function to render document preview
    const renderDocumentPreview = (docLink) => {
        const fileExtension = docLink.split('.').pop().toLowerCase();

        if (fileExtension === 'pdf') {
            return (
                <iframe
                    src={docLink}
                    width="100%"
                    height="200px"
                    title="Document Preview"
                    className="border border-gray-300"
                />
            );
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            return (
                <img
                    src={docLink}
                    alt="Document Preview"
                    className="max-w-[70%] h-[50%]"
                />
            );
        } else {
            return <span>Unsupported file type</span>;
        }
    };

    const handleWebLinkChange = (e) => {
        const value = e.target.value;
        setWebLink(value);

        // Validate URL and set error
        if (value && !isValidURL(value)) {
            setWebLinkError("Invalid URL. Please enter a valid link.");
        } else {
            setWebLinkError("");
        }
    };

    const isValidURL = (url) => {
        const pattern = /^(https?:\/\/)?([\w\d-]+\.)+[\w]{2,}(\/.*)?$/;
        return pattern.test(url);
    };

    return (
        <>
            <Toaster />
            {myGroup ? (
                <div className="min-h-screen p-6 bg-gray-100">
                    <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow space-y-8 relative">

                        {/* Deadline Badge */}
                        {(myGroup.deadlines.deadlines.proposal && new Date(myGroup.deadlines.deadlines.proposal).setUTCHours(0, 0, 0, 0) > new Date().setUTCHours(0, 0, 0, 0) && !myGroup.deadlines.status.proposal) ||
                            (myGroup.deadlines.deadlines.documentation && new Date(myGroup.deadlines.deadlines.documentation).setUTCHours(0, 0, 0, 0) > new Date().setUTCHours(0, 0, 0, 0) && !myGroup.deadlines.status.documentation) ||
                            (myGroup.deadlines.deadlines.finalReport && new Date(myGroup.deadlines.deadlines.finalReport).setUTCHours(0, 0, 0, 0) > new Date().setUTCHours(0, 0, 0, 0) && !myGroup.deadlines.status.finalReport) ? (
                            <span className="absolute top-4 right-4 bg-red-500 text-white text-md font-semibold px-4 py-2 rounded-full flex items-center space-x-2">
                                <span className="text-md">
                                    {myGroup.deadlines.deadlines.proposal && new Date(myGroup.deadlines.deadlines.proposal).setUTCHours(0, 0, 0, 0) > new Date().setUTCHours(0, 0, 0, 0) && !myGroup.deadlines.status.proposal ? (
                                        <>Proposal Deadline: {new Date(myGroup.deadlines.deadlines.proposal).toLocaleDateString()}</>
                                    ) : myGroup.deadlines.deadlines.documentation && new Date(myGroup.deadlines.deadlines.documentation).setUTCHours(0, 0, 0, 0) > new Date().setUTCHours(0, 0, 0, 0) && !myGroup.deadlines.status.documentation ? (
                                        <>Documentation Deadline: {new Date(myGroup.deadlines.deadlines.documentation).toLocaleDateString()}</>
                                    ) : myGroup.deadlines.deadlines.finalReport && new Date(myGroup.deadlines.deadlines.finalReport).setUTCHours(0, 0, 0, 0) > new Date().setUTCHours(0, 0, 0, 0) && !myGroup.deadlines.status.finalReport ? (
                                        <>Final Report Deadline: {new Date(myGroup.deadlines.deadlines.finalReport).toLocaleDateString()}</>
                                    ) : null}
                                </span>
                            </span>
                        ) : null}

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
                                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>{student.name} ({student.rollNo})
                                    </p>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col justify-center space-y-4">
                                <button className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-red-600">
                                    Request Meeting
                                </button>
                                <button className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-600">
                                    Extension Request
                                </button>
                                <button
                                    className="bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-600"
                                    onClick={() => setUploadModal(true)}
                                >
                                    Upload Document
                                </button>
                                <button
                                    className="bg-purple-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-purple-600"
                                    onClick={openProjectModal}
                                >
                                    View Project Details
                                </button>
                            </div>
                        </div>

                        {/* Uploaded Documents Table */}
                        <div className="overflow-x-auto mt-8 max-h-[250px]">
                            <h1 className="text-xl text-center font-semibold mb-4">Uploaded Documents</h1>
                            <table className="min-w-full table-auto border-collapse border border-gray-200">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="px-4 py-2 border border-gray-300">Sr #</th>
                                        <th className="px-4 py-2 border border-gray-300">Document</th>
                                        <th className="px-4 py-2 border border-gray-300">Comment</th>
                                        <th className="px-4 py-2 border border-gray-300">Web Link</th>
                                        <th className="px-4 py-2 border border-gray-300">Supervisor's Review</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myGroup.docs?.map((doc, index) => (
                                        <tr key={doc._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border border-gray-300 text-center">{index + 1}</td>
                                            <td className="px-4 py-2 border text-center">
                                                {doc.docLink ? (
                                                    <a href={doc.docLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                        View Document
                                                    </a>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border border-gray-300 text-center">
                                                {doc.comment?.split(" ").length > 10 ? (
                                                    <>
                                                        <span>
                                                            {expandedComment === index
                                                                ? doc.comment
                                                                : doc.comment?.split(" ").slice(0, 10).join(" ") + "..."}
                                                        </span>
                                                        <button
                                                            className="text-blue-600 ml-2"
                                                            onClick={() => toggleComment(index)}
                                                        >
                                                            {expandedComment === index ? "Show Less" : "Show More"}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <p className='text-center'>N/A</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border border-gray-300 text-center">
                                                {doc.webLink ? (
                                                    <a href={doc.webLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                        View Link
                                                    </a>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border border-gray-300 text-center">
                                                {doc.review ? (
                                                    doc.review.split(" ").length > 10 ? (
                                                        <>
                                                            <span>
                                                                {expandedComment === index
                                                                    ? doc.review
                                                                    : doc.review.split(" ").slice(0, 10).join(" ") + "..."}
                                                            </span>
                                                            <button
                                                                className="text-blue-600 ml-2"
                                                                onClick={() => toggleComment(index)}
                                                            >
                                                                {expandedComment === index ? "Show Less" : "Show More"}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <p>{doc.review}</p> // Display full review if it's less than 10 words
                                                    )
                                                ) : (
                                                    <p className="text-center">N/A</p>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Project Details Modal */}
                    {projectModalData && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                            <div className="bg-white p-8 rounded-lg shadow-xl w-[80%] md:w-[50%] relative">
                                <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">Project Details</h2>
                                <div className="space-y-3">
                                    <p><strong>Title:</strong> {projectModalData.title}</p>
                                    <p><strong>Scope:</strong> {projectModalData.scope}</p>
                                    <p><strong>Description:</strong> {projectModalData.description}</p>
                                </div>
                                <button
                                    className="mt-6 px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 w-full"
                                    onClick={closeModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Student Details Modal */}
                    {modalData && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                            <div className="bg-white p-8 rounded-lg shadow-xl w-[80%] md:w-[50%] space-y-6 relative">
                                <h2 className="text-3xl font-bold text-gray-800 text-center">Student Details</h2>
                                <div className="space-y-4">
                                    <p><strong>Name:</strong> {modalData.name}</p>
                                    <p><strong>Roll No:</strong> {modalData.rollNo || "N/A"}</p>
                                    <p><strong>Semester:</strong> {modalData.semester || "N/A"}</p>
                                    <p><strong>Email:</strong> {modalData.email || "N/A"}</p>
                                    <p><strong>Department:</strong> {modalData.department || "N/A"}</p>
                                    <p><strong>Batch:</strong> {modalData.batch || "N/A"}</p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="w-full mt-6 bg-red-500 text-white py-3 rounded-full hover:bg-red-600"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Upload Document Modal */}
                    {uploadModal && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                            onClick={closeModal}
                        >
                            <div
                                className="bg-white p-6 rounded-lg shadow-lg w-[500px] space-y-4 relative"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Upload Document
                                </h2>
                                <form onSubmit={handleUploadDocument} className="space-y-4">
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                                        onChange={(e) => {
                                            console.log("file is ", e.target.files[0])
                                            setFile(e.target.files[0])
                                        }}
                                        className="w-full p-2 border rounded"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Comment (optional)"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full p-2 border rounded"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Web Link (optional)"
                                        value={webLink}
                                        onChange={handleWebLinkChange}
                                        className="w-full p-2 border rounded"
                                    />
                                    {webLinkError && (
                                        <p className="text-red-500 text-sm">{webLinkError}</p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={(!file && !webLink) || loading}  // Disabled only if both are missing
                                        className={`w-full py-2 rounded-md ${!file && !webLink
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-blue-500 text-white hover:bg-blue-600"
                                            }`}
                                    >
                                        {loading ? "Submitting..." : "Submit"}
                                    </button>

                                </form>
                                <button
                                    className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 mt-2"
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
