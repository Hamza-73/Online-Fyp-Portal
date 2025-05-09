import React, { useContext, useEffect, useState } from "react";
import { SupervisorContext } from "../../context/SupervisorApis";
import { toast, Toaster } from "react-hot-toast";

export default function ProposalRequests({ currentUser, setCurrentUser }) {
  const { getPropsalRequests, acceptProposalRequest, rejectProposalRequest } =
    useContext(SupervisorContext);
  const [requests, setRequests] = useState([]); // All fetched requests
  const [selectedRequest, setSelectedRequest] = useState(null); // Selected request for modal
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [activeTab, setActiveTab] = useState("proposal"); // "proposal" or "group"

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await getPropsalRequests();
        if (response?.success) {
          setRequests(response.requests); // Store requests
        } else {
          console.error("Failed to fetch requests:", response?.message);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchRequests();
  }, [getPropsalRequests]);

  // Modal handlers
  const handleViewDetail = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  const handleAcceptRequest = async (id) => {
    const response = await acceptProposalRequest(id);
    console.log("response from accepttProposalRequest", response);
    if (response?.success) {
      toast.success(response.message);
      closeModal();

      // Update state with new requests & notifications from backend
      setRequests(response.requests); // Use updated requests from backend

      setCurrentUser((prevUser) => ({
        ...prevUser,
        projectRequest: response.requests, // Directly update requests from backend
        notifications: response.notifications, // Directly update notifications from backend
      }));
    } else {
      toast.error(response.message);
      console.error("Failed to accept request:", response?.message);
    }
  };

  const handleRejectRequest = async (id) => {
    const response = await rejectProposalRequest(id);
    console.log("response from rejectProposalRequest", response);
    if (response?.success) {
      toast.success(response.message);
      closeModal();

      // Update state with new requests & notifications from backend
      setRequests(response.requests); // Use updated requests from backend

      setCurrentUser((prevUser) => ({
        ...prevUser,
        projectRequest: response.requests, // Directly update requests from backend
        notifications: response.notifications, // Directly update notifications from backend
      }));
    } else {
      toast.error(response.message);
      console.error("Failed to reject request:", response?.message);
    }
  };

  // Filter requests based on the active tab
  const filteredRequests =
    activeTab === "proposal"
      ? (requests || []).filter(
          (request) => request.project && request.project.status === "pending"
        )
      : (requests || []).filter(
          (request) => request.project && request.project.status === "accepted"
        );

  const proposalCount = requests.filter(
    (req) => req.project?.status === "pending"
  ).length;
  const groupRequestCount = requests.filter(
    (req) => req.project?.status === "accepted"
  ).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-center mb-6">
        Manage Requests
      </h1>

      {/* Toggle Buttons with Badges */}
      <div className="flex justify-center mb-6">
        <button
          className={`relative px-4 py-2 mr-2 rounded ${
            activeTab === "proposal"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setActiveTab("proposal")}
        >
          Proposal Requests
          {proposalCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {proposalCount}
            </span>
          )}
        </button>
        <button
          className={`relative px-4 py-2 rounded ${
            activeTab === "group"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setActiveTab("group")}
        >
          Requests to Join Group
          {groupRequestCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {groupRequestCount}
            </span>
          )}
        </button>
      </div>

      {/* Requests Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-6 text-left">#</th>
              <th className="py-3 px-6 text-left">
                {activeTab === "proposal" ? "Project Title" : "Group Name"}
              </th>
              {activeTab === "proposal" && (
                <th className="py-3 px-6 text-left">Project Scope</th>
              )}
              <th className="py-3 px-6 text-left">Student Name</th>
              <th className="py-3 px-6 text-left">Batch</th>
              <th className="py-3 px-6 text-left">Roll No</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request, index) => (
                <tr
                  key={request._id || index}
                  className={`border-b cursor-pointer hover:bg-slate-100 ${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  <td className="py-3 px-6 text-center">{index + 1}</td>
                  <td className="py-3 px-6">{request.project?.title || "-"}</td>
                  {activeTab === "proposal" && (
                    <td className="py-3 px-6">
                      {request.project?.scope || "-"}
                    </td>
                  )}
                  <td className="py-3 px-6">{request.student?.name || "-"}</td>
                  <td className="py-3 px-6">{request.student?.batch || "-"}</td>
                  <td className="py-3 px-6">
                    {request.student?.rollNo || "-"}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => handleViewDetail(request)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      View Detail
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
                  No requests to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl h-5/6 p-6 relative overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-center">
              {activeTab === "proposal"
                ? "Proposal Details"
                : "Group Request Details"}
            </h2>
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-6 font-bold">
                    {activeTab === "proposal" ? "Project Name" : "Group Name"}
                  </td>
                  <td className="py-3 px-6">
                    {selectedRequest.project?.title || "-"}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-6 font-bold">Scope</td>
                  <td className="py-3 px-6">
                    {selectedRequest.project?.scope || "-"}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-6 font-bold">Description</td>
                  <td className="py-3 px-6">
                    {selectedRequest.project?.description || "-"}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-6 font-bold">Student Name</td>
                  <td className="py-3 px-6">
                    {selectedRequest.student?.name || "-"}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-6 font-bold">Student Roll No</td>
                  <td className="py-3 px-6">
                    {selectedRequest.student?.rollNo || "-"}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-6 font-bold">Student Batch</td>
                  <td className="py-3 px-6">
                    {selectedRequest.student?.batch || "-"}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-6 font-bold">Student Department</td>
                  <td className="py-3 px-6">
                    {selectedRequest.student?.department || "-"}
                  </td>
                </tr>
                {/* {activeTab === "group" && (
                  <tr className="border-b">
                    <td className="py-3 px-6 font-bold">Members</td>
                    <td className="py-3 px-6">
                      {selectedRequest.group?.students
                        ?.map((member) => member.name)
                        .join(", ") || "-"}
                    </td>
                  </tr>
                )} */}
              </tbody>
            </table>
            <div className="flex justify-center my-4">
              <button
                onClick={() => handleAcceptRequest(selectedRequest.project._id)}
                className="bg-green-500 text-white px-4 py-2 mx-2 rounded hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={() => handleRejectRequest(selectedRequest.project._id)}
                className="bg-red-500 text-white px-4 py-2 mx-2 rounded hover:bg-red-600"
              >
                Reject
              </button>
            </div>
            <button
              onClick={closeModal}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 absolute top-4 right-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
}
