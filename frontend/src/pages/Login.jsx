import React, { useState, useContext } from 'react';
import { AdminContext } from '../context/AdminApis.jsx';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'; // Import the icons
import GCU from '../assets/images/gcu.jpeg';
import GCU_COURAGE_TO_KNOW from '../assets/images/gcu-logo-courage-tok-know.jpg';

export default function Login({ user, onLogin }) {
  const { loginAdmin } = useContext(AdminContext);
  const [data, setData] = useState({
    username: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginAdmin(data);

      if (response.success) {
        toast.success(response.message);

        setTimeout(() => {
          if (onLogin) {
            onLogin();
          }
          navigate(`/${user}/announcements`);
        }, 1500);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error in login:', error);
      toast.error('An error occurred while logging in');
    }
  };

  const [showPassword, setShowPassword] = useState(false); // State to manage password visibility

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev); // Toggle the state
  };

  return (
    <>
      <div className="lg:ml-0 min-h-screen flex items-center justify-center ">
        <div className="flex w-full justify-center max-w-6xl h-screen bg-white rounded-lg shadow-lg overflow-hidden">

          {/* Left Side: Image */}
          {/* <div className="w-1/2 h-full">
            <img
              src={GCU} // Replace with your image path
              alt="Login Visual"
              className="object-center h-full w-full"
            />
          </div> */}

          {/* Right Side: Form */}
          <div className="w-1/2 flex items-center justify-center p-8">
            <div className="w-full max-w-md flex flex-col items-center space-y-6">
              {/* Centered Logo */}
              <img src={GCU_COURAGE_TO_KNOW} alt="gcu logo" className="mx-auto" />

              {/* Centered Title */}
              <h2 className="text-2xl font-semibold text-center text-maroon-700">Admin Login</h2>

              {/* Form */}
              <form className="w-full space-y-4" onSubmit={handleSubmit}>

                {/* Username Input with Icon */}
                <div className="relative">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
                    <span className="px-3 text-gray-500">
                      <FaUser />
                    </span>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      required
                      className="flex-1 block w-full p-3 focus:outline-none focus:ring-[maroon] focus:border-[maroon] sm:text-sm border-0"
                      placeholder="Enter your username"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Password Input with Icon */}
                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
                    <span className="px-3 text-gray-500">
                      <FaLock />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      required
                      minLength={6}
                      className="flex-1 block w-full p-2 focus:outline-none focus:ring-[maroon] focus:border-[maroon] sm:text-sm border-0"
                      placeholder="Enter your password"
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      onClick={handleTogglePasswordVisibility}
                      className="text-gray-500 focus:outline-none p-2" // Added padding for better alignment
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-[maroon] text-white font-medium rounded-md shadow hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon-500"
                >
                  Login
                </button>
              </form>
            </div>
          </div>

        </div>
        <Toaster />
      </div>
    </>
  );
}
