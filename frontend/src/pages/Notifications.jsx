import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthApis";
import toast, { Toaster } from "react-hot-toast";
import { AiOutlineExclamationCircle, AiOutlineCheckCircle } from "react-icons/ai";

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
                            className={`relative flex flex-col justify-between p-5 rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 ${
                                notification.type === "Important"
                                    ? "bg-red-500 text-white"
                                    : "bg-blue-500 text-white"
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="text-2xl">
                                        {notification.type === "Important" ? (
                                            <AiOutlineExclamationCircle className="text-red-700" />
                                        ) : (
                                            <AiOutlineCheckCircle className="text-blue-700" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">{notification.message}</p>
                                        <p className="text-sm opacity-80">{notification.type}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button
                                    className="text-sm px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition"
                                    onClick={() => handleMarkSeenNotification(index)}
                                >
                                    Mark as Seen
                                </button>
                                <button
                                    className="text-sm px-4 py-2 bg-red-600 hover:bg-red-800 text-white rounded-lg"
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
                                    ? "bg-red-400 text-white"
                                    : "bg-blue-400 text-white"
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="text-2xl">
                                        {notification.type === "Important" ? (
                                            <AiOutlineExclamationCircle className="text-red-500" />
                                        ) : (
                                            <AiOutlineCheckCircle className="text-blue-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">{notification.message}</p>
                                        <p className="text-sm opacity-80">{notification.type}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <button
                                    className="text-sm px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg"
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