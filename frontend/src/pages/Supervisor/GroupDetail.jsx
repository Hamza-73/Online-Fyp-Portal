import React, { useContext, useEffect, useState } from "react";
import { StudentContext } from "../../context/StudentApis";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { SupervisorContext } from "../../context/SupervisorApis";

export default function GroupDetail() {
  const { index } = useParams();

  const [group, setGroup] = useState(null);
  const [studentModal, setStudentModal] = useState(null);
  const [projectModalData, setProjectModalData] = useState(null);
  const [expandedComment, setExpandedComment] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [viewSubmissionsModal, setViewSubmissionsModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");

  const [activeTask, setActiveTask] = useState(null);

  const openReviewModal = (doc) => {
    setSelectedDoc(doc);
    setReviewText(doc.review || ""); // Pre-fill with existing review if available
    setIsModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsModalOpen(false);
    setReviewText("");
  };

  const { getMyGroups, reviewDocument } = useContext(SupervisorContext);

  useEffect(() => {
    const fetchGroups = async () => {
      const result = await getMyGroups();
      if (result?.success) {
        setGroup(result.groups);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    if (!group || group.length === 0 || !group[index]) return; // Prevents errors

    const { deadlines } = group[index];
    if (!deadlines || !deadlines.deadlines) return; // Ensures `deadlines` exists

    const { proposal, documentation, finalReport } = deadlines.deadlines;
    const {
      proposal: proposalStatus,
      documentation: documentationStatus,
      finalReport: finalReportStatus,
    } = deadlines.status || {};

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
  }, [group]); // Depend only on `group`, not `group[index]`

  const openModal = (data) => {
    setStudentModal(data);
  };

  const openProjectModal = () => {
    setProjectModalData({
      title: group[index].title,
      scope: group[index].scope,
      description: group[index].description,
    });
  };

  const closeModal = () => {
    setStudentModal(null);
    setProjectModalData(null);
    setUploadModal(false);
    setWebLink(null);
    setWebLinkError(null);
    setFile(null);
  };

  const toggleComment = (index) => {
    setExpandedComment(expandedComment === index ? null : index);
  };

  const renderDocumentPreview = (docLink) => {
    const fileExtension = docLink.split(".").pop().toLowerCase();

    if (fileExtension === "pdf") {
      return (
        <iframe
          src={docLink}
          width="100%"
          height="200px"
          title="Document Preview"
          className="border border-gray-300 rounded"
        />
      );
    } else if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
      return (
        <img
          src={docLink}
          alt="Document Preview"
          className="max-w-full h-auto rounded"
        />
      );
    } else {
      return <span>Unsupported file type</span>;
    }
  };

  const handleReviewDocument = async (e) => {
    e.preventDefault();
    const result = await reviewDocument(group[index]._id, index, reviewText);
    // console.log("response in adding review is ", result)
    if (result.success) {
      toast.success("Review Added");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <>
      <Toaster />
      {group && group[index] ? (
        <div className="min-h-screen p-8 bg-gray-100">
          <div className="max-w-9xl mx-auto bg-white p-8 rounded-lg shadow-xl space-y-8">
            {/* Deadline Badge */}
            {activeTask && (
              <div className="absolute top-12 right-12 flex flex-col items-end space-y-2">
                <span className="bg-red-500 text-white text-md font-semibold px-4 py-2 rounded-full">
                  {activeTask.type} Deadline:{" "}
                  {new Date(activeTask.date).toLocaleString()}
                </span>
              </div>
            )}

            <header className="text-center space-y-2">
              <h1 className="text-4xl font-semibold text-gray-800">
                {group[index].title}
              </h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:px-[10rem]">
              <div className="border border-gray-300 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  Group Members
                </h2>
                {group[index].students.map((student) => (
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
                <button
                  className="bg-green-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-green-700"
                  onClick={() => openProjectModal(true)}
                >
                  View Project Details
                </button>
                <button
                  className="bg-orange-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-orange-600"
                  onClick={() => setViewSubmissionsModal(true)}
                >
                  View Submissions
                </button>
              </div>
            </div>

            {/* Uploaded Documents Table */}
            <div className="overflow-x-auto mt-8 max-h-[250px] rounded-lg p-4 shadow-lg">
              <h1 className="text-xl font-semibold mb-4 text-center">
                Uploaded Documents
              </h1>
              <table className="min-w-full table-auto border-collapse border border-gray-200 text-center">
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
                  {group[index].docs?.map((doc, i) => (
                    <tr key={doc._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border border-gray-300 text-center">
                        {i + 1}
                      </td>
                      <td className="px-4 py-2 border text-center border-gray-300">
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
                              {expandedComment === i
                                ? doc.comment
                                : doc.comment
                                    ?.split(" ")
                                    .slice(0, 10)
                                    .join(" ") + "..."}
                            </span>
                            <button
                              className="text-blue-600 ml-2"
                              onClick={() => toggleComment(i)}
                            >
                              {expandedComment === i
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
                          <>
                            <span>
                              {expandedComment === i
                                ? doc.review
                                : doc.review
                                    ?.split(" ")
                                    .slice(0, 10)
                                    .join(" ") + "..."}
                            </span>
                            <button
                              className="text-blue-600 ml-2"
                              onClick={() => toggleComment(i)}
                            >
                              {expandedComment === i
                                ? "Show Less"
                                : "Show More"}
                            </button>
                          </>
                        ) : (
                          <button
                            className="text-blue-600 underline"
                            onClick={() => openReviewModal(doc)}
                          >
                            Add Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                        {group[index].submissions[type].submitted ? (
                          <>
                            <p>
                              <strong>Submitted At:</strong>{" "}
                              {new Date(
                                group[index].submissions[type].submittedAt
                              ).toLocaleString()}
                            </p>
                            <p>
                              <strong>Submitted By:</strong>{" "}
                              {`${group[index].submissions[type].submittedBy.name} (${group[index].submissions[type].submittedBy.rollNo})`}
                            </p>
                            <p>
                              <strong>Document Link:</strong>{" "}
                              <a
                                href={
                                  group[index].submissions[type].documentLink
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View Document
                              </a>
                            </p>
                            <p>
                              <strong>Web Link:</strong>{" "}
                              {group[index].submissions[type].webLink ? (
                                <a
                                  href={group[index].submissions[type].webLink}
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
                      {group[index].submissions[type].submitted &&
                        group[index].submissions[type].documentLink && (
                          <div className="md:w-1/3 mt-4 md:mt-0 md:ml-6">
                            <iframe
                              src={group[index].submissions[type].documentLink}
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
                <div className="space-y-3 text-gray-700">
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
                    <strong>Department:</strong>{" "}
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

          {/* Review Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-8 rounded-2xl shadow-2xl w-[90%] sm:w-[50%] md:w-[40%] lg:w-[30%] relative">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
                  Add Review
                </h2>

                <textarea
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  rows="5"
                  placeholder="Write your review here..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />

                <div className="mt-6 flex justify-between">
                  <button
                    className="px-6 py-3 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition-all w-[48%]"
                    onClick={closeReviewModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all w-[48%]"
                    onClick={handleReviewDocument}
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full flex justify-center">
          <div className="w-4/6 text-center space-y-6 p-8 bg-gradient-to-r from-red-50 to-red-100 rounded-lg shadow-lg mt-8">
            <h1 className="text-4xl font-bold text-red-600">
              404 Group not found
            </h1>
            <p className="text-lg text-gray-700">
              The group you are looking for is either unavailable or not found.
              Please contact your administrator for further assistance.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
