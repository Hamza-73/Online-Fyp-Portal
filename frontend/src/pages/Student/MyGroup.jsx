import React, { useContext, useEffect, useState } from "react";
import { StudentContext } from "../../context/StudentApis";
import toast, { Toaster } from "react-hot-toast";

export default function MyGroup({ currentUser, setCurrentUser }) {
  const {
    fetchMyGroup,
    uploadDocument,
    uploadProjectSubmission,
    requestMeeting,
  } = useContext(StudentContext);

  const [myGroup, setMyGroup] = useState(null);
  const [studentModal, setStudentModal] = useState(null);
  const [projectModalData, setProjectModalData] = useState(null);
  const [uploadModal, setUploadModal] = useState(false); // Upload Document Modal State
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState("");
  const [webLink, setWebLink] = useState("");
  const [expandedComment, setExpandedComment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [webLinkError, setWebLinkError] = useState("");
  const [submissionModal, setSubmissionModal] = useState(false);
  const [viewSubmissionsModal, setViewSubmissionsModal] = useState(false);
  const [showVivaModal, setShowVivaModal] = useState(false);

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
    setStudentModal(data);
  };

  const openProjectModal = () => {
    setProjectModalData({
      title: myGroup.title,
      scope: myGroup.scope,
      description: myGroup.description,
    });
  };

  const closeModal = () => {
    setStudentModal(null);
    setProjectModalData(null);
    setUploadModal(false); // Close Upload Modal
    setWebLink(null);
    setWebLinkError(null);
    setFile(null);
    setSubmissionModal(false);
    setShowVivaModal(false);
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
    console.log("response of uploadig document ", response);
    if (response.success) {
      setLoading(false);
      toast.success("Document uploaded successfully!");
      setMyGroup({
        ...myGroup,
        docs: [...myGroup.docs, response.doc],
      });
      setCurrentUser((prevUser) => ({
        ...prevUser,
        notifications: response.notifications,
      }));
      closeModal();
    } else {
      setLoading(false);
      toast.error(response.message || "Failed to upload document.");
    }
  };

  const handleTaskSubmission = async (e) => {
    e.preventDefault();
    const maxFileSize = 2 * 1024 * 1024;

    if (file && file.size > maxFileSize) {
      toast.error("File Size Should be less than 2MB");
      return;
    }

    const formData = new FormData();
    if (file) formData.append("doc", file);
    if (webLink) formData.append("webLink", webLink);
    if (activeTask)
      formData.append("submissionType", activeTask.type.toLowerCase());

    setLoading(true);
    const response = await uploadProjectSubmission(formData);
    console.log("response on uploadProjectSubmission ", response);
    if (response.success) {
      setLoading(false);
      toast.success(response.message);

      // Update notifications
      setCurrentUser((prevUser) => ({
        ...prevUser,
        notifications: response.notifications,
      }));

      // Update myGroup.submissions
      setMyGroup((prevGroup) => ({
        ...prevGroup,
        submissions: {
          ...prevGroup.submissions,
          [activeTask.type.toLowerCase()]: {
            submitted: true,
            submittedBy: currentUser, // Ensure submittedBy updates
            submittedAt: new Date().toISOString(),
            documentLink: response.doc?.docLink || "",
            webLink: response.doc?.webLink || webLink || "",
          },
        },
      }));

      // Hide the upload button
      setActiveTask(null);
      closeModal();
    } else {
      setLoading(false);
      toast.error(response.message || "Failed to upload document.");
    }
  };

  const toggleComment = (index) => {
    setExpandedComment(expandedComment === index ? null : index);
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

  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    if (!myGroup?.deadlines?.deadlines) return;

    const { proposal, documentation, finalReport } =
      myGroup.deadlines.deadlines;
    const {
      proposal: proposalStatus,
      documentation: documentationStatus,
      finalReport: finalReportStatus,
    } = myGroup.deadlines.status || {};

    if (proposal && new Date(proposal) > new Date() && !proposalStatus) {
      setActiveTask({ type: "Proposal", date: proposal });
    } else if (
      documentation &&
      new Date(documentation) > new Date() &&
      !documentationStatus
    ) {
      setActiveTask({ type: "Documentation", date: documentation });
    } else if (
      finalReport &&
      new Date(finalReport) > new Date() &&
      !finalReportStatus
    ) {
      setActiveTask({ type: "Final Report", date: finalReport });
    }
  }, [myGroup]); // Updates when myGroup changes

  const handleRequestMeeting = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to send a request to your supervisor for a meeting?"
    );

    if (!confirmed) return; // Exit if the user cancels

    try {
      // Optionally show loading state or disable button
      const result = await requestMeeting();

      if (result.success) {
        toast.success(result.message);
        setCurrentUser((prevUser) => ({
          ...prevUser,
          notifications: result.notifications,
        }));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <Toaster />
      {myGroup ? (
        <div className="min-h-screen p-6 bg-gray-100">
          <div className="max-w-9xl mx-auto bg-white p-8 rounded-lg shadow space-y-8 relative">
            {/* Deadline Badge */}
            {activeTask && (
              <div className="absolute top-4 right-4 flex flex-col items-end space-y-2">
                <span className="bg-red-500 text-white text-md font-semibold px-4 py-2 rounded-full">
                  {activeTask.type} Deadline:{" "}
                  {new Date(activeTask.date).toLocaleString()}
                </span>
                {!myGroup.submissions[activeTask.type.toLowerCase()]
                  .submitted &&
                  !myGroup.submissions[activeTask.type.toLowerCase()]
                    .documentLink && (
                    <button
                      button
                      className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600"
                      onClick={() => {
                        setUploadModal(true);
                        setSubmissionModal(true);
                      }}
                    >
                      Upload {activeTask.type}
                    </button>
                  )}
              </div>
            )}
            {/* Viva Badge */}
            {myGroup && myGroup.viva && (
              <div className="absolute top-4 right-4 flex flex-col items-end space-y-2">
                <span className="bg-red-500 text-white text-md font-semibold px-4 py-2 rounded-full">
                  You're Viva has been Scheduled!
                </span>
                <button
                  button
                  className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600"
                  onClick={() => setShowVivaModal(true)}
                >
                  See Viva Details
                </button>
              </div>
            )}
            <header className="text-center space-y-2">
              <h1 className="text-3xl font-semibold text-gray-800">
                {myGroup.title}
              </h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Supervisor Section */}
              <div className="border border-gray-300 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
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
                    <strong>Department:</strong> {myGroup.supervisor.department}
                  </p>
                )}
                {myGroup.supervisor.email && (
                  <p className="text-lg">
                    <strong>Email:</strong> {myGroup.supervisor.email}
                  </p>
                )}
              </div>

              {/* Student Section */}
              <div className="border border-gray-300 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  Group Members
                </h2>
                {myGroup.students.map((student) => (
                  <p
                    key={student._id}
                    className="cursor-pointer text-lg flex items-center gap-2 font-medium text-blue-600 hover:underline"
                    onClick={() => openModal(student)}
                  >
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    {student.name} ({student.rollNo})
                  </p>
                ))}
              </div>

              {/* Actions */}
              <div className="border border-gray-300 p-6 rounded-lg shadow-sm h-full flex flex-col justify-center space-y-4">
                {myGroup && myGroup.isApproved ? (
                  <>
                    <button
                      className="bg-green-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-green-700"
                      onClick={handleRequestMeeting}
                    >
                      Request Meeting
                    </button>
                    <button className="bg-orange-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-orange-600">
                      Extension Request
                    </button>
                    <button
                      className="bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700"
                      onClick={() => setUploadModal(true)}
                    >
                      Upload Document
                    </button>
                    <button
                      className="bg-gray-700 text-white px-6 py-3 rounded-md shadow-md hover:bg-gray-800"
                      onClick={openProjectModal}
                    >
                      View Project Details
                    </button>
                    <button
                      className="bg-purple-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-purple-700"
                      onClick={() => setViewSubmissionsModal(true)}
                    >
                      View Submissions
                    </button>
                  </>
                ) : (
                  <button
                    className="bg-gray-700 text-white px-6 py-3 rounded-md shadow-md hover:bg-gray-800"
                    onClick={openProjectModal}
                  >
                    View Project Details
                  </button>
                )}
              </div>
            </div>

            {/* Uploaded Documents Table */}
            {myGroup && myGroup.isApproved ? (
              <div className="overflow-x-auto mt-8 max-h-[250px]">
                <h1 className="text-xl text-center font-semibold mb-4">
                  Uploaded Documents
                </h1>
                <table className="min-w-full table-auto border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-4 py-2 border border-gray-300">Sr #</th>
                      <th className="px-4 py-2 border border-gray-300">
                        Document
                      </th>
                      <th className="px-4 py-2 border border-gray-300">
                        Comment
                      </th>
                      <th className="px-4 py-2 border border-gray-300">
                        Web Link
                      </th>
                      <th className="px-4 py-2 border border-gray-300">
                        Supervisor's Review
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {myGroup.docs?.map((doc, index) => (
                      <tr key={doc._id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border border-gray-300 text-center">
                          {index + 1}
                        </td>
                        <td className="px-4 py-2 border text-center">
                          {doc.docLink ? (
                            <a
                              href={doc.docLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
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
                                  : doc.comment
                                      ?.split(" ")
                                      .slice(0, 10)
                                      .join(" ") + "..."}
                              </span>
                              <button
                                className="text-blue-600 ml-2"
                                onClick={() => toggleComment(index)}
                              >
                                {expandedComment === index
                                  ? "Show Less"
                                  : "Show More"}
                              </button>
                            </>
                          ) : (
                            <p className="text-center">N/A</p>
                          )}
                        </td>
                        <td className="px-4 py-2 border border-gray-300 text-center">
                          {doc.webLink ? (
                            <a
                              href={
                                doc.webLink.startsWith("https://") ||
                                doc.webLink.startsWith("http://")
                                  ? doc.webLink
                                  : `https://${doc.webLink}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
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
                                    : doc.review
                                        .split(" ")
                                        .slice(0, 10)
                                        .join(" ") + "..."}
                                </span>
                                <button
                                  className="text-blue-600 ml-2"
                                  onClick={() => toggleComment(index)}
                                >
                                  {expandedComment === index
                                    ? "Show Less"
                                    : "Show More"}
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
            ) : (
              <div className="flex justify-center items-center h-64">
                <div className="text-center bg-white p-6 rounded-lg shadow-md border border-gray-200 max-w-xl">
                  <h2 className="text-lg font-semibold text-red-600 mb-2">
                    Your group is not approved yet!
                  </h2>
                  <p className="text-gray-700">
                    Once your group is approved, you’ll be able to view and
                    submit you're progress. Please contact the administrator if
                    you believe this is an error.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* View Submissions Modal */}
          {viewSubmissionsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-xl w-[90%] md:w-[70%] max-h-[80vh] overflow-y-auto">
                <h2 className="text-2xl font-semibold text-gray-800 text-center border-b pb-3 mb-4">
                  Submissions
                </h2>
                <div className="space-y-6">
                  {/* Submission Sections */}
                  {["proposal", "documentation"].map((type) => (
                    <div
                      key={type}
                      className="bg-gray-50 p-6 rounded-lg shadow flex flex-col md:flex-row items-center md:items-start"
                    >
                      {/* Submission Details on the Left */}
                      <div className="md:w-2/3 space-y-2">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 capitalize">
                          {type} Submission
                        </h3>
                        {myGroup.submissions[type].submitted ? (
                          <>
                            <p>
                              <strong>Submitted At:</strong>{" "}
                              {new Date(
                                myGroup.submissions[type].submittedAt
                              ).toLocaleString()}
                            </p>
                            <p>
                              <strong>Submitted By:</strong>{" "}
                              {`${myGroup.submissions[type].submittedBy.name} (${myGroup.submissions[type].submittedBy.rollNo})`}
                            </p>
                            <p>
                              <strong>Document Link:</strong>{" "}
                              <a
                                href={myGroup.submissions[type].documentLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View Document
                              </a>
                            </p>
                            <p>
                              <strong>Web Link:</strong>{" "}
                              {myGroup.submissions[type].webLink ? (
                                <a
                                  href={myGroup.submissions[type].webLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {type} Link
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-600">
                            No {type} submitted yet.
                          </p>
                        )}
                      </div>

                      {/* PDF Preview on the Right */}
                      {myGroup.submissions[type].submitted &&
                        myGroup.submissions[type].documentLink && (
                          <div className="md:w-1/3 mt-4 md:mt-0 md:ml-6">
                            <iframe
                              src={myGroup.submissions[type].documentLink}
                              className="w-full h-40 md:h-56 border rounded-lg shadow-lg"
                            ></iframe>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
                <button
                  className="mt-6 px-5 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 w-full"
                  onClick={() => setViewSubmissionsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* View Viva Detail Modal */}
          {myGroup && myGroup.viva && showVivaModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 px-4">
              <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] md:w-[50%] lg:w-[40%] max-h-[80vh] overflow-y-auto relative">
                <h2 className="text-2xl font-semibold text-gray-800 text-center border-b pb-4 mb-5">
                  Your Viva is Scheduled — Best of Luck!
                </h2>

                <div className="space-y-4 px-2 text-gray-700">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium flex items-center gap-2">
                      Date and Time:
                    </span>
                    <span>
                      {new Date(myGroup.viva.dateTime).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium flex items-center gap-2">
                      External:
                    </span>
                    <span>{myGroup.viva.external.name}</span>
                  </div>
                </div>

                <button
                  className="mt-6 px-5 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 w-full transition duration-200"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Project Details Modal */}
          {projectModalData && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 px-4">
              <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] md:w-[50%] lg:w-[40%] max-h-[80vh] overflow-y-auto relative">
                <h2 className="text-2xl font-semibold text-gray-800 text-center border-b pb-3 mb-4">
                  Project Details
                </h2>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <strong>Title:</strong> {projectModalData.title}
                  </p>
                  <p>
                    <strong>Scope:</strong> {projectModalData.scope}
                  </p>
                  <p>
                    <strong>Description:</strong> {projectModalData.description}
                  </p>
                </div>
                <button
                  className="mt-6 px-5 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 w-full"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Student Details Modal */}
          {studentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 px-4">
              <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] md:w-[50%] lg:w-[40%] max-h-[80vh] overflow-y-auto relative">
                <h2 className="text-2xl font-semibold text-gray-800 text-center border-b pb-3 mb-4">
                  Student Details
                </h2>
                <div className="space-y-3 text-gray-700 lg:grid lg:grid-cols-2">
                  <p>
                    <strong>Name:</strong> {studentModal.name}
                  </p>
                  <p>
                    <strong>Roll No:</strong> {studentModal.rollNo || "N/A"}
                  </p>
                  <p>
                    <strong>Semester:</strong> {studentModal.semester || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {studentModal.email || "N/A"}
                  </p>
                  <p>
                    <strong>Department:</strong>
                    {studentModal.department || "N/A"}
                  </p>
                  <p>
                    <strong>Batch:</strong> {studentModal.batch || "N/A"}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="mt-6 px-5 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 w-full"
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
                className="bg-white p-6 rounded-lg shadow-xl w-[500px] space-y-5 relative border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-semibold text-gray-900 text-center">
                  {submissionModal
                    ? `Upload ${activeTask.type}`
                    : "Upload Document"}
                </h2>

                <form
                  onSubmit={
                    submissionModal
                      ? handleTaskSubmission
                      : handleUploadDocument
                  }
                  className="space-y-4"
                >
                  {/* File Upload */}
                  <label className="block text-gray-700 font-medium">
                    Select File
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    onChange={(e) => {
                      console.log("file is ", e.target.files[0]);
                      setFile(e.target.files[0]);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="text-red-500 text-sm">
                    Document must be in PDF format and under 2MB.
                  </p>

                  {/* Comment Input */}
                  {!submissionModal && (
                    <div>
                      <label className="block text-gray-700 font-medium">
                        Comment (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Add a comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Web Link Input */}
                  <div>
                    <label className="block text-gray-700 font-medium">
                      Web Link (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter web link"
                      value={webLink}
                      onChange={handleWebLinkChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    {webLinkError && (
                      <p className="text-red-500 text-sm">{webLinkError}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={(!file && !webLink) || loading}
                    className={`w-full py-3 rounded-md font-medium transition ${
                      !file && !webLink
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </form>

                {/* Close Button */}
                <button
                  className="w-full bg-gray-600 text-white py-3 rounded-md font-medium hover:bg-gray-700 transition mt-2"
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
          <div className="w-4/6 text-center space-y-4 p-8 bg-gray-300 rounded-lg shadow-lg mt-8">
            <h1 className="text-4xl font-bold text-gray-800">
              You are not enrolled in any group
            </h1>
            <p className="text-lg text-gray-700">
              If you're part of a group, please reach out to your administrator.
              Otherwise, kindly submit your proposal to your supervisor for
              approval.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
