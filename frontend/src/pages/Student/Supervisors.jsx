import React, { useContext, useEffect, useState } from 'react';
import { SupervisorContext } from '../../context/SupervisorApis';
import { FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Loading from '../Loading';

export default function Supervisors() {
  const [supervisors, setSupervisors] = useState(null);
  const { getSupervisors } = useContext(SupervisorContext);

  useEffect(() => {
    const fetchSupervisors = async () => {
      const fetchedData = await getSupervisors();
      if (fetchedData.success) {
        setSupervisors(fetchedData.supervisors);
        console.log('Supervisors:', fetchedData.supervisors);
      }
    };

    fetchSupervisors();
  }, [getSupervisors]);

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-semibold text-gray-900 text-center mb-10">Supervisors</h2>

        {supervisors ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {supervisors?.map((supervisor) => (
              <Link
                to={`/student/supervisor/${supervisor._id}`}
                key={supervisor._id}
                className="bg-white shadow-md rounded-lg overflow-hidden transform transition duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Supervisor info */}
                <div className="p-6 flex flex-col items-center text-center">
                  {/* User Icon */}
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <FaUser className="text-gray-500 text-4xl" />
                  </div>

                  {/* Supervisor Details */}
                  <h3 className="text-xl font-semibold text-gray-800">{supervisor.name}</h3>
                  <p className="text-gray-600 mt-1">{supervisor.designation}</p>
                  <span className="mt-3 px-4 py-2 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
                    Slots Available: {supervisor.slots}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
}
