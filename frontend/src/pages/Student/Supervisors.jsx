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
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Supervisors</h2>

        {/* Display supervisors in a grid */}
        {supervisors ? <div className="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {supervisors?.map((supervisor) => (
            <Link to={`/student/supervisor/${supervisor._id}`}
              key={supervisor._id}
              className="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow duration-300"
              style={{ height: 'max-content' }}
            >
              {/* Supervisor image */}
              {/* <div className="relative h-40 overflow-hidden">
                <img
                  src={supervisor.image || 'https://via.placeholder.com/150'}
                  alt={supervisor.name}
                  className="w-full h-full object-cover"
                />
              </div> */}

              {/* Supervisor info */}
              <div className="p-6">
                {/* User icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <FaUser className="text-gray-500 text-3xl" />
                  </div>
                </div>

                {/* Supervisor details */}
                <h3 className="text-xl font-bold text-gray-800 text-center mb-2">{supervisor.name}</h3>
                <p className="text-gray-600 text-center">Designation: {supervisor.designation}</p>
                <p className="text-gray-600 text-center mt-1">Slots Available: {supervisor.slots}</p>
              </div>
            </Link>
          ))}
        </div> : <Loading />}
      </div>
    </div>
  );
}
