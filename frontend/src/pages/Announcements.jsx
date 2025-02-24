import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthApis';
import { FaBullhorn } from 'react-icons/fa';

export default function Dashboard() {
  const { getAnnouncement } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    getAnnouncement().then((response) => {
      setAnnouncements(response.announcement.reverse());
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-700 mb-8">📢 Announcements</h1>

        <div className="space-y-6">
          {(announcements && announcements.length > 0) ? (
            announcements.map((announcement) => (
              <div 
                key={announcement._id} 
                className="bg-white shadow-xl rounded-lg p-6 border-l-8 border-blue-500 transition-all hover:scale-[1.02] hover:shadow-2xl"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-blue-500 p-3 rounded-full">
                    <FaBullhorn className="text-white text-2xl" />
                  </div>
                  <h2 className="text-xl font-bold ml-4 text-gray-800">{announcement.title}</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">{announcement.content}</p>
                <p className="text-gray-500 text-sm mt-3">📅 Published on: {new Date(announcement.date).toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 text-lg">No announcements available.</p>
          )}
        </div>
      </div>
    </div>
  );
}