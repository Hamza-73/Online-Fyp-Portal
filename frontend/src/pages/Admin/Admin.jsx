import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import AdminNav from './AdminNav';
import Login from '../Login';
import Dashboard from '../Dashboard';
import AdminList from './AdminList';
import AdminProfile from './AdminProfile';
import EditAdminProfile from './EditAdminProfile.jsx';
import EditStudentProfile from './EditStudentProfile.jsx';
import { AdminContext } from '../../context/AdminApis.jsx'; // Import the getProfile function
import StudentList from './StudentList.jsx';

export default function Admin() {

  const { getProfile } = useContext(AdminContext); // Use the context

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const fetchUserProfile = useCallback(async () => {
    try {
      const profileData = await getProfile();
      setUserData(profileData.admin); // Set userData from profileData
      console.log('profiledata is in ', profileData.admin)
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUserData(null); // Handle error by setting userData to null
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUserProfile(); // Call fetchUserProfile on component mount
  }, [fetchUserProfile]);

  const handleLogout = useCallback(() => {
    setUserData(null); // Clear userData on logout
  }, []);

  const pathsWithoutSidebar = ['/', '/admin/login'];
  const showSidebar = !pathsWithoutSidebar.includes(location.pathname);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {showSidebar && userData && (
        <AdminNav 
          userData={userData} 
          onLogout={handleLogout}
        />
      )}
      <Routes>
        <Route 
          path="/login" 
          element={
            userData 
              ? <Navigate to="/admin/dashboard" replace /> 
              : <Login user="admin" onLogin={fetchUserProfile} />
          } 
        />
        <Route
          path="/dashboard"
          element={userData ? <Dashboard /> : <Navigate to="/admin/login" replace />}
        />
        <Route
          path="/admin-list"
          element={userData ? <AdminList userData={userData} /> : <Navigate to="/admin/login" replace />}
        />
        <Route
          path="/student-list"
          element={userData ? <StudentList userData={userData} /> : <Navigate to="/admin/login" replace />}
        />
        <Route
          path="/profile"
          element={userData ? <AdminProfile userData={userData} /> : <Navigate to="/admin/login" replace />}
        />
        <Route
          path="/edit-admin-profile/:id"
          element={userData ? <EditAdminProfile userData={userData} /> : <Navigate to="/admin/login" replace />}
        />
        <Route
          path="/edit-student-profile/:id"
          element={userData ? <EditStudentProfile userData={userData} /> : <Navigate to="/admin/login" replace />}
        />
      </Routes>
    </>
  );
}
