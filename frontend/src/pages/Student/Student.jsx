import React, { useCallback, useContext, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import StudentNav from "./StudentNav";
import StudentProfile from "./StudentProfile";
import { StudentContext } from "../../context/StudentApis";
import Supervisors from "./Supervisors";
import SupervisorDetail from "./SupervisorDetail";
import MyGroup from "./MyGroup";
import Groups from "./Groups";
import Notifications from "../Notifications";
import Announcements from "../Announcements";
import Loading from "../Loading";
import Dashboard from "../Dashboard";

export default function Student() {
  const { getProfile, currentUser, setCurrentUser } =
    useContext(StudentContext);

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        await getProfile();
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      setIsLoading(false);
    };

    fetchUserProfile();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  const pathsWithoutSidebar = ["/", "/student/login", "/"];
  const showSidebar = !pathsWithoutSidebar.includes(location.pathname);

  return (
    <div
      className={`relative top-[20px] transition-all duration-300 ${
        isSidebarOpen ? "lg:ml-[250px]" : "ml-0"
      }`}
      style={{ paddingTop: "64px" }}
    >
      {showSidebar && (
        <StudentNav
          currentUser={currentUser}
          onLogout={handleLogout}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      )}
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
              <StudentProfile
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/supervisors"
          element={
            currentUser ? (
              <Supervisors
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/supervisor/:supervisorId"
          element={
            currentUser ? (
              <SupervisorDetail
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/my-group"
          element={
            currentUser ? (
              <MyGroup
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
      </Routes>
    </div>
  );
}
