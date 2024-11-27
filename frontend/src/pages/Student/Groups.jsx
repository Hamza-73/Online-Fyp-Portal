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
                  className="rounded-xl cursor-pointer shadow-lg p-6 w-80 hover:scale-105 transition-transform duration-300 from bg-gray-100 to bg-gray-200 "
                >
                  {/* Group Title */}
                  <h2 className="text-xl font-bold text-blue-800 text-center mb-4">
                    {group.title || "Untitled Group"}
                  </h2>

                  {/* Divider */}
                  <hr className="mb-4 border-blue-300" />

                  {/* Students */}
                  <ul className="space-y-3">
                    {group.students.length > 0 ? (
                      group.students.map((student, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                          <span className="text-gray-700 font-medium">
                            {student.name} ({student.rollNo})
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic">No students</li>
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
