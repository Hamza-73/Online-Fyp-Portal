import React, { useRef } from "react";
import LOGO from "../../assets/images/main-logo.png";
import AVATAR from "../../assets/images/avatar.png";
import "../../assets/css/nav.css";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { IoIosNotifications } from "react-icons/io";
import {
  FaBullhorn,
  FaUsers,
  FaUserShield,
  FaSignOutAlt,
  FaClipboardList,
  FaClock,
  FaTachometerAlt,
} from "react-icons/fa";

const SuperviorNav = ({
  currentUser,
  onLogout,
  isSidebarOpen,
  toggleSidebar,
}) => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const handleLogout = () => {
    Cookies.remove("auth");
    if (onLogout) {
      onLogout();
    }
    navigate("/");
  };

  const pathName = window.location.pathname;

  return (
    <header className="fixed top-0 left-0 w-full bg-gray-200 text-gray-800 z-40">
      {/* Sidebar Toggle Button */}
      <button
        className="absolute top-4 left-4 z-50 p-2 rounded focus:outline-none"
        onClick={toggleSidebar}
      >
        <div className="relative w-8 h-8 flex flex-col justify-center items-center">
          {/* Hamburger and Cross Animation */}
          <span
            className={`bg-gray-600 block w-8 h-1 mb-1 transition-transform duration-300 ${
              isSidebarOpen ? "rotate-[45deg] translate-y-[16px] " : ""
            }`}
          ></span>
          <span
            className={`bg-gray-600 block w-8 h-1 mb-1 transition-opacity duration-300 ${
              isSidebarOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`bg-gray-600 block w-8 h-1 mb-1 transition-transform duration-300 ${
              isSidebarOpen ? "-rotate-[45deg]  " : ""
            }`}
          ></span>
        </div>
      </button>
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-white text-gray-800 shadow-md transition-transform duration-300 z-40 lg:${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full sm:-translate-x-full md:-translate-x-full"
        }`}
        style={{ width: "250px" }}
      >
        <div className="flex flex-col p-4">
          <img src={LOGO} alt="GCU Logo" className="mb-4 w-20 mx-auto" />
          <Link
            to="/supervisor/dashboard"
            className={`flex items-center gap-2 p-2 text-lg ${
              pathName.includes("/supervisor/dashboard") && "bg-gray-200"
            } hover:bg-gray-200`}
          >
            <FaTachometerAlt size={20} className="text-blue-500" /> Dashboard
          </Link>
          <Link
            to="/supervisor/announcements"
            className={`p-2 text-lg flex items-center gap-2 ${
              pathName.includes("/supervisor/announcements") && "bg-gray-200"
            } hover:bg-gray-200`}
          >
            <FaBullhorn className="text-blue-600" /> Announcements
          </Link>
          <Link
            to="/supervisor/requests"
            className={`p-2 text-lg flex items-center gap-2 relative ${
              pathName.includes("/supervisor/requests") && "bg-gray-200"
            } hover:bg-gray-200`}
          >
            <FaClipboardList className="text-green-600" /> Requests
            {currentUser?.projectRequest?.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {currentUser?.projectRequest?.length}
              </span>
            )}
          </Link>
          <Link
            to="/supervisor/groups"
            className={`p-2 text-lg flex items-center gap-2 ${
              pathName.includes("/supervisor/groups") && "bg-gray-200"
            } hover:bg-gray-200`}
          >
            <FaUsers className="text-purple-600" /> Groups
          </Link>
          <Link
            to="/supervisor/my-groups"
            className={`p-2 text-lg flex items-center gap-2 ${
              pathName.includes("/supervisor/my-groups") && "bg-gray-200"
            } hover:bg-gray-200`}
          >
            <FaUserShield className="text-orange-600" /> Groups Under Me
          </Link>
          {currentUser && currentUser.isCommittee && (
            <>
              <Link
                to="/supervisor/schedule-viva"
                className={`p-2 text-lg flex items-center gap-2 ${
                  pathName.includes("/supervisor/schedule-viva") &&
                  "bg-gray-200"
                } hover:bg-gray-200`}
              >
                <FaClock className="text-red-600" /> Schedule Viva
              </Link>
              <Link
                to="/supervisor/extension-requests"
                className={`p-2 text-lg flex items-center gap-2 ${
                  pathName.includes("/supervisor/extension-requests") &&
                  "bg-gray-200"
                } hover:bg-gray-200`}
              >
                <FaClock className="text-red-600" /> Extension Requests
              </Link>
            </>
          )}

          <Link
            to="/supervisor/scheduled-vivas"
            className={`p-2 text-lg flex items-center gap-2 ${
              pathName.includes("/supervisor/scheduled-vivas") && "bg-gray-200"
            } hover:bg-gray-200`}
          >
            <FaClock className="text-red-600" /> Scheduled Vivas
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 text-lg text-red-500 hover:bg-gray-200 flex items-center gap-2"
          >
            <FaSignOutAlt className="text-red-600" /> Logout
          </button>
        </div>
      </div>

      {/* Avatar and User Info */}
      <div
        className="fixed top-0 right-0 w-full bg-gray-200 text-gray-800 shadow-md flex items-center justify-end space-x-4 p-10 z-35"
        style={{ height: "64px" }}
      >
        <Link to="/supervisor/notifications">
          <div className="relative">
            <IoIosNotifications className="text-gray-800 text-4xl cursor-pointer" />
            {/* Badge */}
            {currentUser?.notifications?.unseen?.length > 0 && (
              <span className="absolute top-0 right-0 rounded-full bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center">
                {currentUser.notifications.unseen.length}
              </span>
            )}
          </div>
        </Link>
        <Link
          to="/supervisor/profile"
          className="flex items-center space-x-4 relative group"
        >
          <img
            src={AVATAR}
            alt="User Avatar"
            className="w-10 h-10 rounded-full cursor-pointer"
          />
          <div className="flex flex-col">
            <h1 className="text-lg text-gray-800 font-semibold">
              {currentUser?.name || "User"}
            </h1>
            <h4>{currentUser?.username || ""}</h4>
          </div>
          {/* Tooltip */}
          <span className="absolute left-1/2 -bottom-8 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Profile
          </span>
        </Link>
      </div>
    </header>
  );
};

export default SuperviorNav;
