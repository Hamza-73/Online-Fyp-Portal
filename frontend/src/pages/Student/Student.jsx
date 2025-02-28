import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import StudentNav from './StudentNav';
import StudentProfile from './StudentProfile';
import { StudentContext } from '../../context/StudentApis';
import Supervisors from './Supervisors';
import SendRequest from './SendRequest';
import SupervisorDetail from './SupervisorDetail';
import MyGroup from './MyGroup';
import Groups from './Groups';
import Notifications from '../Notifications';
import Announcements from '../Announcements';
import Loading from '../Loading';
import Dashboard from '../Dashboard';

export default function Student() {
  const { getProfile } = useContext(StudentContext);

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const fetchUserProfile = useCallback(async () => {
    try {
      const profileData = await getProfile();
      setUserData(profileData.student);
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

  if (loading) {
    return <Loading />;
  }

  const pathsWithoutSidebar = ['/', '/student/login', '/'];
  const showSidebar = !pathsWithoutSidebar.includes(location.pathname);

  return (
    <div className={`relative top-[20px] transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[250px]' : 'ml-0'
      }`}
      style={{ paddingTop: '64px' }}> {/* Adjust padding for header */}
      {showSidebar && (
        <StudentNav
          userData={userData}
          onLogout={handleLogout}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      )}
      <Routes>
        <Route
          path="/dashboard"
          element={
            userData ? <Dashboard userData={userData} /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/announcements"
          element={
            userData ? <Announcements userData={userData} /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/profile"
          element={
            userData ? <StudentProfile userData={userData} /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/supervisors"
          element={
            userData ? <Supervisors userData={userData} /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/send-project-request"
          element={
            userData ? <SendRequest userData={userData} /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/supervisor/:supervisorId"
          element={
            userData ? <SupervisorDetail userData={userData} /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/my-group"
          element={
            userData ? <MyGroup userData={userData} /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/groups"
          element={
            userData ? <Groups userData={userData} /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/notifications"
          element={
            userData ? <Notifications userData={userData} /> : <Navigate to="/" replace />
          }
        />
      </Routes>
    </div>
  );
}