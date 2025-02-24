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
    <div className="min-h-screen bg-gray-100 py-10">
  <div className="max-w-7xl mx-auto px-6">
    <h1 className="text-4xl font-bold text-center text-gray-700 mb-8">My Groups</h1>
    
    {groups ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group, index) => (
          <a
            href={`/supervisor/my-groups/${index}`}
            key={group._id}
            className="bg-gray-50 shadow-md rounded-lg p-6 hover:shadow-lg transition-all duration-300"
          >
            {/* Group Title */}
            <h2 className="text-xl font-semibold text-blue-800 text-center mb-4">
              {group.title || "Untitled Group"}
            </h2>

            {/* Divider */}
            <hr className="mb-4 border-gray-300" />

            {/* Students List */}
            <ul className="space-y-3 text-gray-700">
              {group.students.length > 0 ? (
                group.students.map((student, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    <span className="font-medium">{student.name} ({student.rollNo})</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 italic text-center">No students</li>
              )}
            </ul>
          </a>
        ))}
      </div>
    ) : (
      <p className="text-gray-600 text-center mt-20">Loading groups...</p>
    )}
  </div>
</div>

  );
}
