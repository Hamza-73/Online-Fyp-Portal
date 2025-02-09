import React, { useContext, useEffect, useState } from 'react';
import { SupervisorContext } from '../../context/SupervisorApis';

export default function MyGroups() {
  const { getMyGroups } = useContext(SupervisorContext);
  const [groups, setGroups] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      const result = await getMyGroups();
      if (result?.success) {
        setGroups(result.groups);
      }
    };
    fetchGroups();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-8">
      <h1 className="text-4xl font-extrabold text-center mb-10">
        My Groups
      </h1>
      {groups ? (
        <div className="flex flex-wrap justify-center gap-8">
          {groups.map((group,index) => (
            <a
              href={`/supervisor/my-groups/${index}`}
              key={group._id}
              className="bg-white rounded-xl cursor-pointer shadow-lg p-6 w-80 hover:scale-105 transition-transform duration-300"
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
            </a>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center mt-20">Loading groups...</p>
      )}
    </div>
  );
}
