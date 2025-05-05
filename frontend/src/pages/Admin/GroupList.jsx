import React, { useContext, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "../../context/AuthApis";
import { AdminContext } from "../../context/AdminApis";

export default function GroupList({ currentUser }) {
  const { getGroups } = useContext(AuthContext);
  const { approveOrRejectGroup } = useContext(AdminContext);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [groupDetailsModal, setGroupDetailsModal] = useState(false);
  const [selectedGroup, setSelectedgroup] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await getGroups();
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, []);

  const handleGroupStatus = async (groupId, isApproved) => {
    const result = await approveOrRejectGroup(groupId, isApproved);
    if (result.success) {
      setGroups((prevGroups) =>
        prevGroups.map((supervisor) => ({
          ...supervisor,
          groups: supervisor.groups.map((group) =>
            group.groupId === groupId ? { ...group, isApproved } : group
          ),
        }))
      );
    }
  };

  // Filtered groups based on search and approval
  const filteredGroups = groups.map((supervisor) => {
    const filtered = supervisor.groups.filter((group) => {
      const searchMatch =
        group.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supervisor.supervisorName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        group.members?.some((member) =>
          member.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const approvalMatch =
        approvalFilter === "all"
          ? true
          : approvalFilter === "approved"
          ? group.isApproved
          : !group.isApproved;

      return searchMatch && approvalMatch;
    });

    return {
      ...supervisor,
      groups: filtered,
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-center mb-6">Group List</h1>
      <Toaster />

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
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
            placeholder="Search by title, supervisor, or student"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
        </div>

        {/* Approval Filter */}
        <div className="w-full md:w-64">
          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          >
            <option value="all">All Groups</option>
            <option value="approved">Approved</option>
            <option value="not-approved">Not Approved</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Title</th>
              <th className="py-3 px-6 text-left">Supervisor</th>
              <th className="py-3 px-6 text-left">Approval</th>
              <th className="py-3 px-6 text-left">Group Details</th>
              {(currentUser?.superAdmin || currentUser?.write_permission) && (
                <th className="py-3 px-6 text-center">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredGroups?.map((supervisor) =>
              supervisor.groups.map((group) => (
                <tr key={group.groupId} className="border-b hover:bg-slate-100">
                  <td className="py-3 px-6">{group.title}</td>
                  <td className="py-3 px-6">{supervisor.supervisorName}</td>
                  <td className="py-3 px-6">
                    <span
                      className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        group.isApproved
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {group.isApproved ? "Approved" : "Not Approved"}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <button
                    className="text-blue-500 underline"
                      onClick={() => {
                        setSelectedgroup(group);
                        setGroupDetailsModal(true);
                      }}
                    >
                      Group Details
                    </button>
                  </td>
                  {(currentUser?.superAdmin ||
                    currentUser?.write_permission) && (
                    <td className="py-3 px-6 text-center space-x-2">
                      {!group.isApproved ? (
                        <>
                          <button
                            onClick={() =>
                              handleGroupStatus(group.groupId, true)
                            }
                            className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleGroupStatus(group.groupId, false)
                            }
                            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 text-sm"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-sm font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                          Approved
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Group Detail Modal */}
      {groupDetailsModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-8 px-4 md:px-10">
              {/* Group Details */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 border-b pb-3 mb-4">
                  Group Details
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
    </div>
  );
}
