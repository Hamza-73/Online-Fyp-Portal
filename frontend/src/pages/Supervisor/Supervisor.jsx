import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import SupervisorNav from './SupervisorNav';
import SupervisorProfile from './SupervisorProfile';
import { SupervisorContext } from '../../context/SupervisorApis';
import ProposalRequests from './ProposalRequests';
import Groups from '../Group/Groups';
import Notifications from '../Notifications';
import Announcements from '../Announcements';
import MyGroups from './MyGroups';
import GroupDetail from './GroupDetail';
import Loading from '../Loading';
import Dashboard from '../Dashboard';

export default function Supervisor() {
  const { getProfile } = useContext(SupervisorContext);

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar toggle state
  const location = useLocation();

  // Fetch user profile data
  const fetchUserProfile = useCallback(async () => {
    try {
      const profileData = await getProfile();
      setUserData(profileData.supervisor);
      console.log('Profile data:', profileData.supervisor);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUserData(null);
    }
    setLoading(false);
  }, [getProfile]);

  // Logout handler
  const handleLogout = useCallback(() => {
    setUserData(null); // Clear user data on logout
  }, []);

  // Sidebar toggle function
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    fetchUserProfile(); // Fetch profile data on component mount
  }, [fetchUserProfile]);

  // Loading state
  if (loading) {
    return <Loading />;
  }

  // Sidebar visibility logic
  const pathsWithoutSidebar = ['/', '/supervisor/login', '/'];
  const showSidebar = !pathsWithoutSidebar.includes(location.pathname);

  return (
    <div className="flex">
      {showSidebar && (
        <SupervisorNav
          userData={userData}
          onLogout={handleLogout}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      )}

      {/* Main content area */}
      <div
        className={`relative top-[85px] transition-all duration-300 flex-1 ${showSidebar && isSidebarOpen ? 'ml-[250px]' : 'ml-0'
          }`}
      >
        <Routes>
          <Route
            path="/dashboard"
            element={
              userData ? (
                <Dashboard userData={userData} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/announcements"
            element={
              userData ? (
                <Announcements userData={userData} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/profile"
            element={
              userData ? (
                <SupervisorProfile userData={userData} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/requests"
            element={
              userData ? (
                <ProposalRequests userData={userData} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/groups"
            element={
              userData ? (
                <Groups userData={userData} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/notifications"
            element={
              userData ? (
                <Notifications userData={userData} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/my-groups"
            element={
              userData ? (
                <MyGroups userData={userData} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/my-groups/:index"
            element={
              userData ? (
                <GroupDetail userData={userData} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
}
