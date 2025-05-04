import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthApis";
import toast, { Toaster } from "react-hot-toast";
import {
  AiOutlineExclamationCircle,
  AiOutlineCheckCircle,
} from "react-icons/ai";

export default function Notifications({ currentUser, setCurrentUser }) {
  const { getNotifications, markSeenNotification, removeNotification } =
    useContext(AuthContext);

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

  useEffect(() => {
    if (notifications?.unseen?.length > 0) {
      notifications.unseen.forEach(async (_, index) => {
        await handleMarkSeenNotification(index);
      });
    }
  }, [notifications, currentUser]);

  const handleMarkSeenNotification = async (index) => {
    const result = await markSeenNotification(index);
    if (result.success) {
      const movedNotification = notifications.unseen[index];

      // Keep the notification in "unseen" for a while (5 seconds)
      setTimeout(() => {
        setNotifications((prevState) => ({
          unseen: prevState.unseen.filter((_, i) => i !== index),
          seen: [...prevState.seen, movedNotification],
        }));
      }, 5000); // 5-second delay before moving it to "seen" UI

      // Update currentUser.notifications
      setCurrentUser((prev) => ({
        ...prev,
        notifications: result.notifications, // Ensure this contains updated notifications
      }));
    } else {
      console.log("Error: ", result.message);
    }
  };

  const handleRemoveNotification = async (index, type) => {
    // Convert from reversed index to original index
    const originalIndex = notifications[type].length - 1 - index;
    
    const result = await removeNotification(originalIndex, type);
    if (result.success) {
      setNotifications((prevState) => ({
        ...prevState,
        [type]: prevState[type].filter((_, i) => i !== originalIndex),
      }));

      setCurrentUser((prev) => ({
        ...prev,
        notifications: result.notifications,
      }));

      toast.success("Notification removed.");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Toaster />
      <h1 className="text-3xl text-center font-bold mb-6 text-gray-800">
        Notifications
      </h1>
      {/* Notifications */}
      <section className="mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Unseen Notifications */}
          {[...notifications.unseen].reverse().map((notification, displayIndex) => (
            <div
              key={displayIndex}
              className="relative flex flex-col justify-between p-5 rounded-xl shadow-md overflow-hidden transform transition-all hover:scale-105 bg-gray-500 text-gray-900"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="text-2xl text-gray-600">
                    {notification.type === "Important" ? (
                      <AiOutlineExclamationCircle />
                    ) : (
                      <AiOutlineCheckCircle />
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
                  className="text-sm px-4 py-2 bg-gray-700 hover:bg-gray-900 text-white rounded-lg"
                  onClick={() => handleRemoveNotification(displayIndex, "unseen")}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* Seen Notifications */}
          {[...notifications.seen].reverse().map((notification, displayIndex) => (
            <div
              key={displayIndex}
              className="relative flex flex-col justify-between p-5 rounded-xl shadow-md overflow-hidden transform transition-all hover:scale-105 bg-gray-300 text-gray-800"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="text-2xl text-gray-500">
                    {notification.type === "Important" ? (
                      <AiOutlineExclamationCircle />
                    ) : (
                      <AiOutlineCheckCircle />
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
                  className="text-sm px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                  onClick={() => handleRemoveNotification(displayIndex, "seen")}
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