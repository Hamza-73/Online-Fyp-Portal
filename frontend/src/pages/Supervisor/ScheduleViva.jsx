import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthApis";
import { SupervisorContext } from "../../context/SupervisorApis";
import { toast, Toaster } from "react-hot-toast";

export default function ScheduleViva() {
  const { getGroups } = useContext(AuthContext);
  const { scheduleViva } = useContext(SupervisorContext);
  const [eligibleGroups, setEligibleGroups] = useState([]);
  const [pendingGroups, setPendingGroups] = useState([]);
  const [activeTab, setActiveTab] = useState("eligible");
  const [showVivaModal, setShowVivaModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDetailsModal, setGroupDetailsModal] = useState(false);
  const [external, setExternal] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [vivaDateTime, setVivaDateTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await getGroups();
      const eligible = [];
      const pending = [];

      response?.data?.forEach((group) => {
        const groupData = group?.groups?.[0];

        // Skip if group has viva already scheduled
        if (!groupData || groupData.viva) return;

        const proposalSubmitted = groupData.submissions?.proposal?.submitted;
        const documentationSubmitted =
          groupData.submissions?.documentation?.submitted;

        if (proposalSubmitted && documentationSubmitted) {
          eligible.push(group);
        } else {
          pending.push(group);
        }
      });

      setEligibleGroups(eligible);
      setPendingGroups(pending);
    } catch (error) {
      toast.error("Error fetching groups");
      console.error("Error fetching groups:", error);
    }
  };

  const handleScheduleClick = (group) => {
    // Store the whole group object to ensure we have all the needed data
    setSelectedGroup(group);
    setShowVivaModal(true);
  };

  const closeModal = () => {
    setSelectedGroup(null);
    setShowVivaModal(false);
    // Reset form data
    setExternal({
      name: "",
      email: "",
      phone: "",
    });
    setVivaDateTime("");
  };

  const handleChangeExternal = (e) => {
    const { name, value } = e.target;
    setExternal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const groupsToShow =
    activeTab === "eligible" ? eligibleGroups : pendingGroups;

  const validateForm = () => {
    if (!external.name.trim()) {
      toast.error("External examiner name is required");
      return false;
    }
    if (!external.email.trim()) {
      toast.error("External examiner email is required");
      return false;
    }
    if (!external.phone.trim()) {
      toast.error("External examiner phone is required");
      return false;
    }
    if (!vivaDateTime) {
      toast.error("Viva date and time is required");
      return false;
    }
    return true;
  };

  const handleScheduleViva = async (e) => {
    e.preventDefault();

    if (!selectedGroup) {
      toast.error("No group selected");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Make sure we're using the correct group ID
      const groupId = selectedGroup.groupId;
      console.log("groupId ", groupId);

      if (!groupId) {
        toast.error("Invalid group ID");
        setIsSubmitting(false);
        return;
      }

      const result = await scheduleViva(groupId, external, vivaDateTime);

      console.log("result is ", result);

      if (result.success) {
        toast.success(result.message || "Viva scheduled successfully");
        closeModal();
        // Refresh the groups list
        fetchGroups();
      } else {
        toast.error(result.message || "Failed to schedule viva");
      }
    } catch (error) {
      toast.error(
        "Error scheduling viva: " + (error.message || "Unknown error")
      );
      console.error("Error scheduling viva:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVivaDateTimeChange = (e) => {
    setVivaDateTime(e.target.value);
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

  // Filtered groups based on the search query
  const filteredGroups = (
    activeTab === "eligible" ? eligibleGroups : pendingGroups
  ).filter((group) => {
    const title = group.groups[0]?.title?.toLowerCase() || "";
    const supervisor = group.supervisorName?.toLowerCase() || "";
    return (
      title.includes(searchQuery.toLowerCase()) ||
      supervisor.includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">
        Schedule Viva
      </h1>

      {/* Toggle Buttons */}
      <div className="flex justify-center mb-6">
        <button
          className={`relative px-4 py-2 mr-2 rounded ${
            activeTab === "eligible"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setActiveTab("eligible")}
        >
          Eligible Groups
          {eligibleGroups.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              {eligibleGroups.length}
            </span>
          )}
        </button>
        <button
          className={`relative px-4 py-2 rounded ${
            activeTab === "pending"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setActiveTab("pending")}
        >
          Non-Eligible Groups
          {pendingGroups.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {pendingGroups.length}
            </span>
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z"
            />
          </svg>
        </span>
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
              {activeTab === "eligible" && (
                <th className="py-3 px-6 text-center">Schedule Viva</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group, index) => (
                <tr
                  key={group._id || index}
                  className={`border-b cursor-pointer hover:bg-slate-100 ${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  <td className="py-3 px-6 text-center">{index + 1}</td>
                  <td className="py-3 px-6">{group.groups[0].title || "-"}</td>
                  <td className="py-3 px-6">{group.supervisorName || "-"}</td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => {
                        setGroupDetailsModal(true);
                        setSelectedGroup(group.groups[0]);
                      }}
                      className="bg-yellow-500 text-white p-2 rounded"
                    >
                      Group Details
                    </button>
                  </td>
                  {activeTab === "eligible" && (
                    <td className="py-3 px-6 text-center">
                      <button
                        onClick={() => handleScheduleClick(group.groups[0])}
                        className="bg-blue-500 text-white p-2 rounded"
                      >
                        Schedule Viva
                      </button>
                    </td>
                  )}
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

      {/* Viva Modal */}
      {showVivaModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 relative">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Schedule Viva
            </h2>
            <p className="mb-4 text-center text-gray-700 font-medium">
              Group:{" "}
              <span className="text-blue-600">{selectedGroup.title}</span>
            </p>
            <form onSubmit={handleScheduleViva} className="grid gap-4">
              <input
                type="text"
                name="name"
                value={external.name}
                placeholder="External Name"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={handleChangeExternal}
                required
              />
              <input
                type="email"
                name="email"
                value={external.email}
                placeholder="External Email"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={handleChangeExternal}
                required
              />
              <input
                type="tel"
                name="phone"
                value={external.phone}
                placeholder="External Phone Number"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={handleChangeExternal}
                required
              />

              {/* Date and Time Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="dateTime-local"
                    name="vivaDateTime"
                    value={vivaDateTime}
                    onChange={handleVivaDateTimeChange}
                    min={getCurrentDateTime()} // Disable past dates
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Scheduling..." : "Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
