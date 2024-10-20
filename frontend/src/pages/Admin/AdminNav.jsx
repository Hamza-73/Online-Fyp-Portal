import React, { useState, useRef, useEffect } from 'react';
import LOGO from '../../assets/images/main-logo.png';
import AVATAR from '../../assets/images/avatar1.png';
import '../../assets/css/nav.css';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AdminNav = ({ userData, onLogout }) => {
  const navigate = useNavigate();

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('/admin/dashboard'); // Default active link
  const sidebarRef = useRef(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close sidebar when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    Cookies.remove('token');
    if (onLogout) {
      onLogout();
    }
    navigate('/admin/login');
  };

  const handleLinkClick = (path) => {
    setActiveLink(path); // Set the active link
    if (isMobileMenuOpen) {
      setMobileMenuOpen(false); // Close the mobile menu on link click
    }
  };

  return (
    <header style={{ background: 'maroon' }}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left Section (Email) */}
        <div className="flex items-center space-x-4">
          {/* Email Icon */}
          <div className="flex items-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H8m-4 4h16M8 16H4v4m12-8h4v4M8 8h8m-6 6h6" />
            </svg>
            <a href="mailto:gcu@edu.pk" className="ml-2">gcu@edu.pk</a>
          </div>
        </div>

        {/* Right Section (Hamburger for Mobile/Tablet) */}
        <div className="flex items-center space-x-4 text-white">
          <button id="menu-btn" className="block lg:hidden focus:outline-none" onClick={toggleMobileMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navbar Links with Logo (Desktop) */}
      <nav className="hidden lg:flex bg-white">
        <div className="container mx-auto px-10 flex items-center justify-between">
          {/* Logo */}
          <div className="flex justify-center">
            <a href="#">
              <img src={LOGO} alt="GCU LOGO" className="nav-logo" style={{ width: '80px' }} />
            </a>
          </div>

          {/* Nav Links */}
          <div className="flex space-x-6">
            <Link to="/admin/dashboard" className={`nav-item ${activeLink === '/admin/dashboard' ? 'active' : ''} font-semibold text-xl`} onClick={() => handleLinkClick('/admin/dashboard')}>Dashboard</Link>
            <Link to="/admin/admin-list" className={`nav-item ${activeLink === '/admin/admin-list' ? 'active' : ''} font-semibold text-xl`} onClick={() => handleLinkClick('/admin/admin-list')}>Admin</Link>
            <Link to="/admin/student-list" className={`nav-item ${activeLink === '/admin/student-list' ? 'active' : ''} font-semibold text-xl`} onClick={() => handleLinkClick('/admin/student-list')}>Students</Link>
            <a href="#" className={`nav-item ${activeLink === '/supervisors' ? 'active' : ''} font-semibold text-xl`} onClick={() => handleLinkClick('/supervisors')}>Supervisors</a>
          </div>

          <div className="relative">
            {/* Avatar and Username */}
            <div className="flex flex-col items-center space-y-2 group">
              {/* Avatar Icon */}
              <img
                src={AVATAR}
                alt="User Avatar"
                className="w-10 h-10 rounded-full cursor-pointer"
              />
              {/* Username */}
              <h1 className="text-xl font-semibold">{userData.username ? userData.username : ""}</h1>

              {/* Dropdown Menu */}
              <div className="absolute -left-[50px] top-[70px] mt-8 w-40 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 z-10">
                <ul>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <Link to="/admin/profile">Profile</Link>
                  </li>
                  <li
                    className="px-4 py-2 text-red-500 hover:bg-gray-100 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar (Mobile/Tablet) */}
      <div
        ref={sidebarRef}
        className={`fixed flex flex-col items-center left-0 top-0 w-64 h-full bg-white z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:hidden`}
      >
        <div className="flex items-center justify-between p-4">
          <a href="#">
            <img src={LOGO} alt="GCU LOGO" style={{ width: '110px' }} />
          </a>
        </div>
        <div className="flex flex-col space-y-6">
          <a href="#" className={`nav-item ${activeLink === '/home' ? 'active' : ''}`} onClick={() => handleLinkClick('/home')}>Home</a>
          <a href="#" className={`nav-item ${activeLink === '/about' ? 'active' : ''}`} onClick={() => handleLinkClick('/about')}>About Us</a>
          <a href="#" className={`nav-item ${activeLink === '/services' ? 'active' : ''}`} onClick={() => handleLinkClick('/services')}>Services</a>
          <a href="#" className={`nav-item ${activeLink === '/projects' ? 'active' : ''}`} onClick={() => handleLinkClick('/projects')}>Our Projects</a>
          <a href="#" className={`nav-item ${activeLink === '/resources' ? 'active' : ''}`} onClick={() => handleLinkClick('/resources')}>Resources</a>
          <a href="#" className={`nav-item ${activeLink === '/contact' ? 'active' : ''}`} onClick={() => handleLinkClick('/contact')}>Contact Us</a>
        </div>
      </div>
    </header>
  );
};

export default AdminNav;
