import React, { useState, useEffect, useCallback, useContext } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import AdminNav from "./AdminNav";
import Login from "../Login";
import Announcements from "../Announcements";
import AdminList from "./AdminList";
import AdminProfile from "./AdminProfile";
import EditAdminProfile from "./EditAdminProfile";
import EditStudentProfile from "./EditStudentProfile";
import { AdminContext } from "../../context/AdminApis";
import StudentList from "./StudentList";
import SupervisorList from "./SupervisorList";
import EditSupervisorProfile from "./EditSupervisorProfile";
import "../../index.css";
import Loading from "../Loading";

export default function Admin() {
  const { getProfile, currentUser, setCurrentUser } = useContext(AdminContext);

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const pathsWithoutSidebar = ["/", "/admin/login"];
  const showSidebar = !pathsWithoutSidebar.includes(location.pathname);

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

  return (
    <div
      className={`relative top-[85px] transition-all duration-300 flex-1 ${
        showSidebar && isSidebarOpen ? "ml-[250px]" : "ml-0"
      }`}
    >
      {showSidebar && currentUser && (
        <AdminNav
          currentUser={currentUser}
          onLogout={handleLogout}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          setCurrentUser={setCurrentUser}
        />
      )}
      <Routes>
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to="/admin/announcements" replace />
            ) : (
              <Login user="admin" onLogin={getProfile} />
            )
          }
        />
        <Route
          path="/announcements"
          element={
            currentUser ? (
              <Announcements />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/admin-list"
          element={
            currentUser ? (
              <AdminList
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/student-list"
          element={
            currentUser ? (
              <StudentList
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/supervisor-list"
          element={
            currentUser ? (
              <SupervisorList
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/profile"
          element={
            currentUser ? (
              <AdminProfile
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/edit-admin-profile/:id"
          element={
            currentUser ? (
              <EditAdminProfile
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/edit-student-profile/:id"
          element={
            currentUser ? (
              <EditStudentProfile
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/edit-supervisor-profile/:id"
          element={
            currentUser ? (
              <EditSupervisorProfile
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}