import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthApis";
import toast, { Toaster } from "react-hot-toast";

export default function Notifications() {
    const { getNotifications, markSeenNotification, removeNotification } = useContext(AuthContext);

    const [notifications, setNotifications] = useState({ seen: [], unseen: [] });

    useEffect(() => {
        const fetchNotifications = async () => {
            const result = await getNotifications();
            if (result.success) {
                setNotifications(result.notifications);
            } else {
                toast.error(result.message);
            }
        };
        fetchNotifications();
    }, []);

    const handleMarkSeenNotification = async (index) => {
        const result = await markSeenNotification(index);
        if (result.success) {
            const movedNotification = notifications.unseen[index];
            setNotifications((prevState) => ({
                unseen: prevState.unseen.filter((_, i) => i !== index),
                seen: [...prevState.seen, movedNotification],
            }));
            toast.success("Notification marked as seen.");
        } else {
            toast.error(result.message);
        }
    };

    const handleRemoveNotification = async (index, type) => {
        const result = await removeNotification(index, type);
        if (result.success) {
            if (type === "unseen") {
                setNotifications((prevState) => ({
                    ...prevState,
                    unseen: prevState.unseen.filter((_, i) => i !== index),
                }));
            } else if (type === "seen") {
                setNotifications((prevState) => ({
                    ...prevState,
                    seen: prevState.seen.filter((_, i) => i !== index),
                }));
            }
            toast.success("Notification removed.");
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="p-6">
            <Toaster />
            <h1 className="text-3xl text-center font-bold mb-6">Your Notifications</h1>
            {/* Unseen Notifications */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">Unseen Notifications</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...notifications.unseen].reverse().map((notification, index) => (
                        <div
                            key={index}
                            className={`relative cursor-pointer flex flex-col justify-between p-5 rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 ${
                                notification.type === "Important"
                                    ? "bg-gradient-to-r from-red-500 to-red-400 text-white"
                                    : "bg-gradient-to-r from-blue-500 to-blue-400 text-white"
                            }`}
                        >
                            <div>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full">
                                            {notification.type === "Important" ? (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-6 h-6 text-red-500"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M13 16h-1v-4h-1m1-4h.01M12 18c1.104.002 2-.896 2-2 0-1.104-.896-2-2-2s-2 .896-2 2c0 1.104.896 2 2 2zm0-10V4"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-6 h-6 text-blue-500"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M13 16h-1v-4h-1m1-4h.01M12 18c1.104.002 2-.896 2-2 0-1.104-.896-2-2-2s-2 .896-2 2c0 1.104.896 2 2 2zm0-10V4"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{notification.message}</p>
                                            <p className="text-sm opacity-80">{notification.type}</p>
                                        </div>
                                    </div>
                                    {notification.type === "Important" && (
                                        <span className="bg-red-700 text-white text-xs font-semibold px-3 py-1 rounded-full absolute top-2 right-2">
                                            Important
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button
                                    className="text-sm px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition self-end"
                                    onClick={() => handleMarkSeenNotification(index)}
                                >
                                    Mark as Seen
                                </button>
                                <button
                                    className="text-sm px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg mt-2 self-end"
                                    onClick={() => handleRemoveNotification(index, "unseen")}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            {/* Seen Notifications */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">Seen Notifications</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...notifications.seen].reverse().map((notification, index) => (
                        <div
                            key={index}
                            className={`relative flex flex-col justify-between p-5 rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 ${
                                notification.type === "Important"
                                    ? "bg-gradient-to-r from-red-400 to-red-300 text-white"
                                    : "bg-gradient-to-r from-blue-400 to-blue-300 text-white"
                            }`}
                        >
                            <div>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full">
                                            {notification.type === "Important" ? (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-6 h-6 text-red-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M13 16h-1v-4h-1m1-4h.01M12 18c1.104.002 2-.896 2-2 0-1.104-.896-2-2-2s-2 .896-2 2c0 1.104.896 2 2 2zm0-10V4"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-6 h-6 text-blue-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M13 16h-1v-4h-1m1-4h.01M12 18c1.104.002 2-.896 2-2 0-1.104-.896-2-2-2s-2 .896-2 2c0 1.104.896 2 2 2zm0-10V4"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{notification.message}</p>
                                            <p className="text-sm">{notification.type}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <button
                                    className="text-sm px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg transition self-end"
                                    onClick={() => handleRemoveNotification(index, "seen")}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
