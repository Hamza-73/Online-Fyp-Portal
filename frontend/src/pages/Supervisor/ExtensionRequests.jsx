import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthApis";
import { SupervisorContext } from "../../context/SupervisorApis";
import { toast, Toaster } from "react-hot-toast";

export default function ExtensionRequests() {
  const { getExtensionRequests, handleExtensionRequest } =
    useContext(SupervisorContext);

  const [extensionRequests, setExtensionRequests] = useState([]);
  const [groupDetailsModal, setGroupDetailsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchExtensionRequests = async () => {
      const result = await getExtensionRequests();
      if (result.success) {
        setExtensionRequests(result.extensionRequests);
        console.log("extensionRequests", extensionRequests);
      }
    };
    fetchExtensionRequests();
  }, []);

  const handleRequest = async (requestId, status) => {
    const confirm = window.confirm(
      `Are you sure you want to ${status} this request?`
    );

    if (!confirm) return;

    const result = await handleExtensionRequest(requestId, status);
    console.log("result is ", result);

    if (result.success) {
      setExtensionRequests((prev) =>
        prev.filter((req) => req._id !== requestId)
      );
    }
  };

  const filteredRequests = extensionRequests.filter((request) => {
    const lowerQuery = searchQuery.toLowerCase().trim();
    return (
      request?.group?.supervisor?.name
        ?.toString()
        .includes(lowerQuery.toLowerCase()) ||
      request?.group?.title?.toString().includes(lowerQuery.toLowerCase())
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">
        Extension Requests
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
              <th className="py-3 px-6 text-center">Reason</th>
              <th className="py-3 px-6 text-center">Group Details</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests
                .filter((request) => request.status.toLowerCase() === "pending")
                .map((request, index) => (
                  <tr
                    key={request._id || index}
                    className={`border-b cursor-pointer hover:bg-slate-100 ${
                      index % 2 === 0 ? "bg-gray-100" : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-6 text-center">{index + 1}</td>
                    <td className="py-3 px-6">{request.group.title || "-"}</td>
                    <td className="py-3 px-6">
                      {request.group.supervisor.name || "-"}
                    </td>
                    <td className="py-3 px-6">{request.reason || "-"}</td>
                    <td className="py-3 px-6 text-center">
                      <button
                        onClick={() => {
                          setGroupDetailsModal(true);
                          setSelectedGroup(request.group);
                        }}
                        className="text-blue-600 underline"
                      >
                        Group Details
                      </button>
                    </td>
                    <td className="py-3 px-6 text-center space-x-1">
                      <button
                        onClick={() => handleRequest(request._id, "Approved")}
                        className="text-green-600 border border-green-600 hover:bg-green-600 hover:text-white py-1 px-3 transition-colors duration-200 rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRequest(request._id, "Rejected")}
                        className="text-red-600 border border-red-600 hover:bg-red-600 hover:text-white py-1 px-3 transition-colors duration-200 rounded"
                      >
                        Reject
                      </button>
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
