import React, { useCallback, useContext, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import SupervisorNav from "./SupervisorNav";
import SupervisorProfile from "./SupervisorProfile";
import { SupervisorContext } from "../../context/SupervisorApis";
import ProposalRequests from "./ProposalRequests";
import Groups from "../Group/Groups";
import Notifications from "../Notifications";
import Announcements from "../Announcements";
import MyGroups from "./MyGroups";
import GroupDetail from "./GroupDetail";
import Loading from "../Loading";
import Dashboard from "../Dashboard";
import ScheduleViva from "./ScheduleViva";
import ScheduledVivas from "./ScheduledVivas";

export default function Supervisor() {
  const { getProfile, currentUser, setCurrentUser } =
    useContext(SupervisorContext);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        await getProfile();
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!currentUser) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [currentUser, getProfile]);

  if (loading) {
    return <Loading />;
  }

  const pathsWithoutSidebar = ["/", "/supervisor/login", "/"];
  const showSidebar = !pathsWithoutSidebar.includes(location.pathname);

  return (
    <div className="flex">
      {showSidebar && (
        <SupervisorNav
          currentUser={currentUser}
          onLogout={handleLogout}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      )}
      <div
        className={`relative top-[85px] transition-all duration-300 flex-1 ${
          showSidebar && isSidebarOpen ? "ml-[250px]" : "ml-0"
        }`}
      >
        <Routes>
          <Route
            path="/dashboard"
            element={
              currentUser ? (
                <Dashboard
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/announcements"
            element={
              currentUser ? (
                <Announcements
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/profile"
            element={
              currentUser ? (
                <SupervisorProfile
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/requests"
            element={
              currentUser ? (
                <ProposalRequests
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/groups"
            element={
              currentUser ? (
                <Groups
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/notifications"
            element={
              currentUser ? (
                <Notifications
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/my-groups"
            element={
              currentUser ? (
                <MyGroups
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/my-groups/:index"
            element={
              currentUser ? (
                <GroupDetail
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/schedule-viva"
            element={
              currentUser ? (
                <ScheduleViva
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/scheduled-vivas"
            element={
              currentUser ? (
                <ScheduledVivas
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
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
