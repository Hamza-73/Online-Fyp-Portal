import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthApis";
import toast, { Toaster } from "react-hot-toast";
import { StudentContext } from "../../context/StudentApis";
import Loading from "../Loading";

export default function Groups({ currentUser, setCurrentUser }) {
  const { getGroups } = useContext(AuthContext);
  const { requestToJoinGroup } = useContext(StudentContext);
  const [groups, setGroups] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      const result = await getGroups();
      if (result.success) {
        setGroups(result.data);
      }
      setLoading(false);
    };
    fetchGroup();
  }, []);

  const handleJoinRequest = async (groupId) => {
    try {
      const response = await requestToJoinGroup(groupId);
      if (response.success) {
        toast.success("Request sent successfully!");
        setCurrentUser((prevUser) => ({
          ...prevUser,
          notifications: response.notifications,
          requests: response.requests,
        }));
      } else {
        toast.error(response.message || "Failed to send request.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-center text-gray-700 mb-8">
          Available Groups
        </h1>
        <Toaster />
        {groups ? (
          groups.map((supervisor) => (
            <div
              key={supervisor.supervisorId}
              className="mb-12 bg-white shadow-md rounded-lg p-8"
            >
              {/* Supervisor Section */}
              <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                {supervisor.supervisorName}
              </h2>

              {/* Groups Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {supervisor.groups.map((group) => (
                  <div
                    key={group.groupId}
                    className="bg-gray-50 shadow-md rounded-lg p-6 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Group Title */}
                    <h3 className="text-xl font-semibold text-blue-800 text-center mb-4">
                      {group.title || "Untitled Group"}
                    </h3>

                    {/* Divider */}
                    <hr className="mb-4 border-gray-300" />

                    {/* Students List */}
                    <ul className="space-y-3 text-gray-700">
                      {group.students.length > 0 ? (
                        group.students.map((student, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            <span className="font-medium">
                              {student.name} ({student.rollNo})
                            </span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 italic text-center">
                          No students
                        </li>
                      )}
                    </ul>

                    {/* Join Group Button */}
                    {!currentUser?.isGroupMember &&
                      group.students.length < 3 &&
                      !currentUser.requests?.rejectedRequests?.includes(
                        supervisor.supervisorId
                      ) &&
                      !currentUser.requests?.pendingRequests?.includes(
                        supervisor.supervisorId
                      ) && (
                        <button
                          className="mt-6 w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300"
                          onClick={() => handleJoinRequest(group.groupId)}
                        >
                          Request to Join
                        </button>
                      )}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>No Group Found</p>
        )}
      </div>
    </div>
  );
}
