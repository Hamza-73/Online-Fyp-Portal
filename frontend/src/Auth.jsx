import React, { useState, useContext, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'; // Import the icons
import GCU_COURAGE_TO_KNOW from './assets/images/gcu-logo-courage-tok-know.jpg';
import { AuthContext } from './context/AuthApis';

function Auth() {
    const { loginUser } = useContext(AuthContext);
    const navigate = useNavigate();
  
    const [data, setData] = useState({
        username: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false); // State to manage password visibility

    useEffect(() => {
        // Check if the user is already logged in by checking the auth cookie
        const authCookie = document.cookie.split('; ').find(row => row.startsWith('auth='));
        if (authCookie) {
            // Decode the cookie value before parsing it as JSON
            const decodedCookie = decodeURIComponent(authCookie.split('=')[1]);
            try {
                const auth = JSON.parse(decodedCookie);
                const { token, role } = auth;

                // Assuming a function `isTokenValid` that checks the token expiration
                if (token && role && isTokenValid(token)) {
                    navigate(`/${role}/profile`); // Redirect if token is valid
                }
            } catch (error) {
                console.error("Error parsing cookie:", error);
            }
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser(data);
            console.log("response is ", response);
            if (response.success) {
                toast.success(response.message);
                // Store token and role in cookies
                const authData = { token: response.token, role: response.role };
                document.cookie = `auth=${encodeURIComponent(JSON.stringify(authData))}; path=/; max-age=${3600 * 24}`;

                setTimeout(() => {
                    navigate(`/${response.role}/profile`);
                }, 1500);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error('Error in login:', error);
            toast.error('An error occurred while logging in');
        }
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev); // Toggle the state
    };

    const isTokenValid = (token) => {
        // Implement your token validation logic here (e.g., check expiration)
        try {
            const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT token
            const currentTime = Date.now() / 1000; // Get current time in seconds
            return decodedToken.exp > currentTime; // Check if token is expired
        } catch (error) {
            return false; // Invalid token or unable to decode
        }
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center ">
                <div className="lg:ml-0 flex w-full justify-center max-w-6xl h-screen bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Right Side: Form */}
                    <div className="w-1/2 flex items-center justify-center p-8">
                        <div className="w-full max-w-md flex flex-col items-center space-y-6">
                            {/* Centered Logo */}
                            <img src={GCU_COURAGE_TO_KNOW} alt="gcu logo" className="mx-auto" />

                            {/* Centered Title */}
                            <h2 className="text-2xl font-semibold text-center text-maroon-700">Login</h2>

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

export default Auth;
