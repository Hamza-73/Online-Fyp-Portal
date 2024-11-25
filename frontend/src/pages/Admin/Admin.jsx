import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import AdminNav from './AdminNav';
import Login from '../Login';
import Dashboard from '../Dashboard';
import AdminList from './AdminList';
import AdminProfile from './AdminProfile';
import EditAdminProfile from './EditAdminProfile';
import EditStudentProfile from './EditStudentProfile';
import { AdminContext } from '../../context/AdminApis';
import StudentList from './StudentList';
import SupervisorList from './SupervisorList';
import EditSupervisorProfile from './EditSupervisorProfile';
import '../../index.css'

export default function Admin() {
  const { getProfile } = useContext(AdminContext);

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const fetchUserProfile = useCallback(async () => {
    try {
      const profileData = await getProfile();
      setUserData(profileData.admin);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUserData(null);
    }
    setLoading(false);
  }, [getProfile]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleLogout = useCallback(() => {
    setUserData(null);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const pathsWithoutSidebar = ['/', '/admin/login'];
  const showSidebar = !pathsWithoutSidebar.includes(location.pathname);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className={`relative top-[60px] transition-all duration-300 ${
        isSidebarOpen ? 'lg:ml-[250px]' : 'ml-0'
      }`}
    >
      {showSidebar && userData && (
        <AdminNav
          userData={userData}
          onLogout={handleLogout}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      )}
      <Routes>
        <Route
          path="/login"
          element={
            userData ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Login user="admin" onLogin={fetchUserProfile} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            userData ? <Dashboard /> : <Navigate to="/admin/login" replace />
          }
        />
        <Route
          path="/admin-list"
          element={
            userData ? (
              <AdminList userData={userData} />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/student-list"
          element={
            userData ? (
              <StudentList userData={userData} />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/supervisor-list"
          element={
            userData ? (
              <SupervisorList userData={userData} />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/profile"
          element={
            userData ? (
              <AdminProfile userData={userData} />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/edit-admin-profile/:id"
          element={
            userData ? (
              <EditAdminProfile userData={userData} />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/edit-student-profile/:id"
          element={
            userData ? (
              <EditStudentProfile userData={userData} />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/edit-supervisor-profile/:id"
          element={
            userData ? (
              <EditSupervisorProfile userData={userData} />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}
