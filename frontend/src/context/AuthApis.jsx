// context/AdminApis.js
import React, { createContext, useState } from "react";
import { server } from "../server";

// Create the
export const AuthContext = createContext();

// AdminProvider component to wrap your app
export function AuthApis({ children }) {
  const registerStudent = async (data) => {
    try {
      console.log("data ", data);
      const res = await fetch(`${server}/auth/register-student`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      console.log("result is ", result);
      return result;
    } catch (error) {
      console.error("Error registering :", error);
      return {
        success: false,
        message: "Registering Student failed due to an error.",
      };
    }
  };

  const registerSupervisor = async (data) => {
    try {
      console.log("data ", data);
      const res = await fetch(`${server}/auth/register-supervisor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      console.log("result is ", result);
      return result;
    } catch (error) {
      console.error("Error registering :", error);
      return {
        success: false,
        message: "Registering Supervisor failed due to an error.",
      };
    }
  };

  const loginUser = async (data) => {
    try {
      const res = await fetch(`${server}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      return result;
    } catch (error) {
      console.log("error in loging in user", error);
    }
  };

  const getGroups = async (data) => {
    try {
      const res = await fetch(`${server}/auth/get-groups`, {
        method: "GET",
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      return result;
    } catch (error) {
      console.log("error in finding", error);
    }
  };

  const getNotifications = async () => {
    try {
      const res = await fetch(`${server}/auth/get-notifications`, {
        method: "GET",
        credentials: "include",
      });
      const result = await res.json();
      return result;
    } catch (error) {
      console.log("error fetching notigications", error);
    }
  };

  const markSeenNotification = async (index) => {
    try {
      const res = await fetch(
        `${server}/auth/mark-as-seen-notification/${index}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const result = await res.json();
      return result;
    } catch (error) {
      console.log("error marking notifications as seen", error);
    }
  };

  const removeNotification = async (index, type) => {
    try {
      const res = await fetch(
        `${server}/auth/remove-notification/${index}/${type}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const result = await res.json();
      return result;
    } catch (error) {
      console.log("error marking notifications as seen", error);
    }
  };

  const getAnnouncement = async () => {
    try {
      const res = await fetch(`${server}/auth/get-announcement`, {
        method: "GET",
      });
      const result = await res.json();
      return result;
    } catch (error) {
      console.log("error getting announcement ", error);
    }
  };

  const registerExternal = async (data) => {
    try {
      console.log("data ", data);
      const res = await fetch(`${server}/auth/register-external`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      console.log("result is ", result);
      return result;
    } catch (error) {
      console.error("Error registering :", error);
    }
  };

  const editExternal = async (data, id) => {
    try {
      console.log("data ", data);
      const res = await fetch(`${server}/auth/edit-external/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      console.log("result is ", result);
      return result;
    } catch (error) {
      console.error("Error editing :", error);
    }
  };

  const deleteExternal = async (id) => {
    try {
      const res = await fetch(`${server}/auth/delete-external/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await res.json();
      console.log("result is ", result);
      return result;
    } catch (error) {
      console.error("Error deleting :", error);
    }
  };

  const getExternals = async () => {
    try {
      const res = await fetch(`${server}/auth/get-externals`, {
        method: "GET",
        credentials: "include",
      });
      const result = await res.json();
      console.log("result is ", result);
      return result;
    } catch (error) {
      console.error("Error registering :", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        registerStudent,
        loginUser,
        registerSupervisor,
        getGroups,
        getNotifications,
        markSeenNotification,
        removeNotification,
        getAnnouncement,
        registerExternal,
        editExternal,
        deleteExternal,
        getExternals,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
