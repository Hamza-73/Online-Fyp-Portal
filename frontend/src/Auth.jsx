import React, { useState, useContext, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Particles from 'react-tsparticles'; // For background particles
import GCU_COURAGE_TO_KNOW from './assets/images/gcu-logo-courage-tok-know.jpg';
import { AuthContext } from './context/AuthApis';
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

function Auth() {

    const navigate = useNavigate();
    useEffect(() => {
        const authCookie = Cookies.get("auth");
        if (!authCookie) return; // No cookie, exit early

        try {
            const { token, role } = JSON.parse(authCookie); // Parse stored JSON
            if (!token || !role) return; // Missing data, exit early

            const { exp } = jwtDecode(token);
            if (exp && exp < Math.floor(Date.now() / 1000)) {
                console.log("Token expired, removing...");
                Cookies.remove("auth");
                return;
            }

            navigate(`/${role}/announcements`);
        } catch (error) {
            console.log("Invalid auth data, removing...");
            Cookies.remove("auth");
        }
    }, [navigate]);

    const { loginUser } = useContext(AuthContext);

    const [data, setData] = useState({
        username: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [currentSlogan, setCurrentSlogan] = useState(0);

    const slogans = [
        "Unlock Your Potential with Us!",
        "Achieve More, Dream Bigger!",
        "Your Journey to Success Starts Here!",
        "Innovate, Inspire, Impact!"
    ];

    useEffect(() => {
        const sloganInterval = setInterval(() => {
            setCurrentSlogan((prev) => (prev + 1) % slogans.length);
        }, 3000); // Change slogan every 3 seconds

        return () => clearInterval(sloganInterval);
    }, [slogans.length]);

    const handleInputChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser(data);
            if (response.success) {
                toast.success(response.message);
                const authData = { token: response.token, role: response.role };
                document.cookie = `auth=${encodeURIComponent(JSON.stringify(authData))}; path=/; max-age=${3600 * 24}`;

                setTimeout(() => {
                    navigate(`/${response.role}/announcements`);
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
        setShowPassword((prev) => !prev);
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
            <Particles
                className="absolute inset-0 z-0"
                options={{
                    // background: { color: { value: "#5a0006" } },
                    particles: {
                        number: { value: 100 },
                        color: { value: "#ffc107" },
                        shape: { type: "circle" },
                        opacity: { value: 0.3 },
                        size: { value: 5 },
                        move: { speed: 2, direction: "none" }
                    }
                }}
            />

            <div className="relative z-10 w-full max-w-6xl flex rounded-lg overflow-hidden shadow-2xl">
                {/* Left Side: Animated Slogans */}
                <div className="hidden lg:flex w-1/2 text-white flex-col justify-center items-center p-8 relative"
                    style={{
                        background: "rgba(90, 0, 6, 0.7)",
                        // boxShadow: "0px 0px 50px 10px rgba(0, 0, 0, 0.15)",
                        backdropFilter: "blur(106px)",
                        WebkitBackdropFilter: "blur(106px)",
                        backgroundImage: "linear-gradient(rgba(0, 0, 91, 1), rgba(90, 0, 6, 1))"
                    }}>
                    <div className="text-4xl font-bold mb-4 text-center animate-slide-in-left">
                        {slogans[currentSlogan]}
                    </div>
                    <div className="text-lg text-center max-w-sm">
                        Empower your future today. Login to get started!
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        <img
                            src={GCU_COURAGE_TO_KNOW}
                            alt="GCU Logo"
                            className="mx-auto mb-6 animate-zoom-in"
                        />
                        <h2 className="text-3xl font-bold text-center" style={{ color: "#5a0006" }}>
                            Login
                        </h2>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Username Input */}
                            <div className="relative">
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Username
                                </label>
                                <div className="flex items-center border border-gray-300 rounded-md shadow-sm hover:shadow-md transition-shadow">
                                    <span className="px-3 text-gray-500">
                                        <FaUser />
                                    </span>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        required
                                        className="flex-1 block w-full p-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm border-0"
                                        placeholder="Enter your username"
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="relative">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Password
                                </label>
                                <div className="flex items-center border border-gray-300 rounded-md shadow-sm hover:shadow-md transition-shadow">
                                    <span className="px-3 text-gray-500">
                                        <FaLock />
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        required
                                        minLength={6}
                                        className="flex-1 block w-full p-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm border-0"
                                        placeholder="Enter your password"
                                        onChange={handleInputChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleTogglePasswordVisibility}
                                        className="text-gray-500 focus:outline-none px-3 hover:text-amber-500 transition-colors"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full py-3 px-4 font-medium rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-opacity"
                                style={{
                                    backgroundColor: "#ffc107",
                                    color: "#5a0006"
                                }}
                            >
                                Login
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <Toaster />
        </div>
    );
}

export default Auth;
