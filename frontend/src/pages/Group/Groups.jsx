import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthApis";
import toast, { Toaster } from "react-hot-toast";
import { StudentContext } from "../../context/StudentApis";

export default function Groups({ userData }) {
  const { getGroups } = useContext(AuthContext);
  const { requestToJoinGroup } = useContext(StudentContext);
  const [groups, setGroups] = useState(null);

  useEffect(() => {
    const fetchGroup = async () => {
      const result = await getGroups();
      console.log("group ",
        result.data
      )
      if (result.success) {
        setGroups(result.data);
      } else {
        toast.error(result.message);
      }
    };
    fetchGroup();
  }, []);

  const handleJoinRequest = async (groupId) => {
    const result = await requestToJoinGroup(groupId);
    console.log("result is ", result)
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Groups
      </h1>
      <Toaster />
      {groups ? (
        groups.map((supervisor) => (
          <div
            key={supervisor.supervisorId}
            className="mb-12 mx-auto bg-white rounded-lg shadow-lg p-6 max-w-5xl"
          >
            {/* Supervisor Section */}
            <h2 className="text-3xl font-semibold mb-4 text-center">
              {supervisor.supervisorName}
            </h2>
            {/* Groups Section */}
            <div className="flex flex-wrap justify-center gap-6">
              {supervisor.groups.map((group) => (
                <div
                  key={group.groupId}
                  className="bg-gradient-to-br cursor-pointer from-blue-50 to-white shadow-lg rounded-lg p-5 w-72 hover:shadow-2xl transition-transform transform hover:scale-105"
                >
                  {/* Group Title */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {group.title}
                  </h3>
                  {/* Students List */}
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="font-medium text-gray-700">Students:</li>
                    {group.students.length > 0 ? (
                      group.students.map((student) => (
                        <li
                          key={student.rollNo}
                          className="flex items-center gap-2"
                        >
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          {student.name} ({student.rollNo})
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">No students assigned</li>
                    )}
                  </ul>
                  {/* Join Group Button */}
                  {!userData?.isGroupMember && group.students.length < 3 &&
                    !userData.requests?.rejectedRequests?.includes(supervisor.supervisorId) &&
                    !userData.requests?.pendingRequests?.includes(supervisor.supervisorId) && (
                      <button
                        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                        onClick={() => handleJoinRequest(group.groupId)}
                      >
                        Request to Join Group
                      </button>
                    )}
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-center">Loading groups...</p>
      )}
    </div>
  );
}
