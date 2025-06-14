import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthApis";
import { SupervisorContext } from "../../context/SupervisorApis";
import { toast, Toaster } from "react-hot-toast";

export default function ScheduledVivas() {
  const { getScheduledVivas, updateVivaStatus } = useContext(SupervisorContext);
  const [showVivaModal, setShowVivaModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [vivas, setVivas] = useState([]);
  const [groupDetailsModal, setGroupDetailsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [vivaDetail, setVivaDetail] = useState(null);

  useEffect(() => {
    fetchScheduledVivas();
  }, []);

  const fetchScheduledVivas = async () => {
    try {
      const response = await getScheduledVivas();
      console.log("response is ", response);
      if (response.success) {
        setVivas(response.vivas);
      }
    } catch (error) {
      console.error("Error fetching vivas:", error);
    }
  };

  const handleUpdateVivaStstus = async (groupId, status) => {
    const confirmation = window.confirm(
      `Are you sure you want to mark this viva is completed?`
    );
    if (confirmation) {
      const result = await updateVivaStatus(groupId, status);
      console.log("result ", result);
      if (result.success) {
        toast.success("Viva status updated successfully");
        setVivas((prevVivas) =>
          prevVivas.map((viva) =>
            viva.group._id === groupId ? { ...viva, status } : viva
          )
        );
      } else {
        toast.error("Failed to update viva status");
      }
    }
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">
        Scheduled Viva
      </h1>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Search by group title or supervisor"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
        />
      </div>

      {/* Groups List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-6 text-left">#</th>
              <th className="py-3 px-6 text-left">Group Title</th>
              <th className="py-3 px-6 text-left">Supervisor</th>
              <th className="py-3 px-6 text-center">Group Details</th>
              <th className="py-3 px-6 text-center">Viva Details</th>
              <th className="py-3 px-6 text-center">Viva Status</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vivas.length > 0 ? (
              vivas.map((viva, index) => (
                <tr
                  key={viva._id || index}
                  className={`border-b cursor-pointer hover:bg-slate-100 ${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  <td className="py-3 px-6 text-center">{index + 1}</td>
                  <td className="py-3 px-6">{viva.group.title || "-"}</td>
                  <td className="py-3 px-6">
                    {viva.group.supervisor.name || "-"}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => {
                        setGroupDetailsModal(true);
                        setSelectedGroup(viva.group);
                      }}
                      className="text-blue-600 underline"
                    >
                      Group Details
                    </button>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => {
                        setShowVivaModal(true);
                        setVivaDetail(viva);
                      }}
                      className="text-blue-600 underline"
                    >
                      Viva Details
                    </button>
                  </td>
                  <td className="py-3 px-6 text-center">
                    {viva.status === "pending" ? (
                      <span className="text-yellow-500 font-semibold">
                        Pending
                      </span>
                    ) : (
                      <span className="text-green-500 font-semibold">
                        Completed
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {viva.status === "pending" ? (
                      <button
                        onClick={() =>
                          handleUpdateVivaStstus(viva.group._id, "completed")
                        }
                        className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                      >
                        Mark Viva Completed
                        
                      </button>
                    ) : (
                      <span className="text-green-500 font-semibold">
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="py-3 px-6 text-center text-gray-500 font-semibold"
                >
                  No Groups to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Group Details Modal (If needed) */}
      {groupDetailsModal && selectedGroup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Group Details: {selectedGroup.title}
            </h2>
            {/* Add your group details UI here */}
            <button
              onClick={() => setGroupDetailsModal(false)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Viva Detail Modal */}
      {showVivaModal && vivaDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-8 px-4 md:px-10">
              {/* Header */}
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-3 text-center">
                Scheduled Viva Details
              </h2>

              {/* Group Info */}
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Group Title:</strong>{" "}
                  <span className="text-blue-600">
                    {vivaDetail.group?.title || "N/A"}
                  </span>
                </p>
                <p>
                  <strong>Supervisor:</strong>{" "}
                  {vivaDetail.group.supervisor.name || "N/A"}
                </p>
              </div>

              {/* External Info */}
              <div className="space-y-2 text-gray-700">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 border-b pb-2">
                  External Examiner
                </h3>
                <p>
                  <strong>Name:</strong>{" "}
                  <span className="text-blue-600">
                    {vivaDetail.external?.name || "N/A"}
                  </span>
                </p>
                <p>
                  <strong>Email:</strong> {vivaDetail.external?.email || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong> {vivaDetail.external?.phone || "N/A"}
                </p>
              </div>

              {/* Viva Timing */}
              <div className="space-y-2 text-gray-700">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 border-b pb-2">
                  Viva Schedule
                </h3>
                <p>
                  <strong>Date & Time:</strong>{" "}
                  {new Date(vivaDetail.dateTime).toLocaleString()}
                </p>
              </div>

              {/* Close Button */}
              <button
                className="mt-6 px-5 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 w-full"
                onClick={() => setShowVivaModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Detail Modal */}
      {groupDetailsModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-8 px-4 md:px-10">
              {/* Project Details */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 border-b pb-3 mb-4">
                  Project Details
                </h2>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <strong>Title:</strong> {selectedGroup.title}
                  </p>
                  <p>
                    <strong>Scope:</strong> {selectedGroup.scope}
                  </p>
                  <p>
                    <strong>Description:</strong> {selectedGroup.description}
                  </p>
                </div>
              </div>

              {/* Student Details */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 border-b pb-3 mb-4">
                  Student Details
                </h2>
                <div className="overflow-x-auto">
                  <table className="text-left w-full border-collapse">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th className="py-3 px-6">Sr#</th>
                        <th className="py-3 px-6">Name</th>
                        <th className="py-3 px-6">Roll No</th>
                        <th className="py-3 px-6">Batch</th>
                        <th className="py-3 px-6">Email</th>
                        <th className="py-3 px-6">Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedGroup.students.map((student, index) => (
                        <tr
                          key={student._id || index}
                          className={`border-b ${
                            index % 2 === 0 ? "bg-gray-100" : "bg-white"
                          } hover:bg-slate-100`}
                        >
                          <td className="py-3 px-6">{index + 1}</td>
                          <td className="py-3 px-6">{student.name || " "}</td>
                          <td className="py-3 px-6">{student.rollNo || " "}</td>
                          <td className="py-3 px-6">{student.batch || " "}</td>
                          <td className="py-3 px-6">{student.email || " "}</td>
                          <td className="py-3 px-6">
                            {student.department || " "}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submissions */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 border-b pb-3 mb-4">
                  Submissions
                </h2>
                <div className="space-y-6">
                  {["proposal", "documentation"].map((type) => {
                    const submission = selectedGroup.submissions[type];
                    const submittedStudent = selectedGroup.students.find(
                      (student) => student._id === submission.submittedBy
                    );
                    return (
                      <div
                        key={type}
                        className="bg-gray-50 rounded-lg shadow p-4 flex flex-col md:flex-row items-start"
                      >
                        {/* Left side: Submission Details */}
                        <div className="md:w-2/3 space-y-2">
                          <h3 className="text-xl font-semibold text-gray-800 mb-4 capitalize">
                            {type} Submission
                          </h3>
                          {submission.submitted ? (
                            <>
                              <p>
                                <strong>Submitted At:</strong>{" "}
                                {new Date(
                                  submission.submittedAt
                                ).toLocaleString()}
                              </p>
                              <p>
                                <strong>Submitted By:</strong>{" "}
                                {submittedStudent
                                  ? `${submittedStudent.name} (${submittedStudent.rollNo})`
                                  : "Unknown"}
                              </p>
                              <p>
                                <strong>Document Link:</strong>{" "}
                                <a
                                  href={submission.documentLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  View Document
                                </a>
                              </p>
                              <p>
                                <strong>Web Link:</strong>{" "}
                                {submission.webLink ? (
                                  <a
                                    href={submission.webLink}
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

                        {/* Right side: PDF Preview */}
                        {submission.submitted && submission.documentLink && (
                          <div className="md:w-1/3 mt-4 md:mt-0 md:ml-6">
                            <iframe
                              src={submission.documentLink}
                              className="w-full h-40 md:h-56 border rounded-lg shadow-lg"
                              title={`${type}-preview`}
                            ></iframe>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Close Button */}
              <button
                className="mt-6 px-5 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 w-full"
                onClick={() => setGroupDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}
