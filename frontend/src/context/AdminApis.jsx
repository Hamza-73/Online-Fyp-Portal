// context/AdminApis.js
import React, { createContext, useState } from "react";
import { server } from "../server";
import toast from "react-hot-toast";

// Create the AdminContext
export const AdminContext = createContext();

// AdminProvider component to wrap your app
export function AdminApis({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Admin login function
  const loginAdmin = async (data) => {
    try {
      const res = await fetch(`${server}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const json = await res.json();
      console.log("Login response:", json);

      // Return the response to the calling component
      return json;
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("An error occurred while logging in");
      return { success: false, message: "Login failed due to an error." };
    }
  };

  const getProfile = async () => {
    try {
      const res = await fetch(`${server}/admin/profile`, {
        method: "GET",
        credentials: "include", // This ensures cookies are sent with the request
        headers: {
          "Content-Type": "application/json", // Ensure the response is in JSON format
        },
      });
      const data = await res.json();
      console.log("profile data is ", data);
      setCurrentUser(data.admin);
    } catch (error) {
      console.error("Error getting profile ", error);
      return {
        success: false,
        message: "Failed to fetch profile due to an error.",
      };
    }
  };

  const getAdminProfile = async (id) => {
    try {
      const res = await fetch(`${server}/admin/get-profile/${id}`, {
        method: "GET",
        credentials: "include", // This ensures cookies are sent with the request
        headers: {
          "Content-Type": "application/json", // Ensure the response is in JSON format
        },
      });

      const json = await res.json();

      console.log("profile data is ", json);

      return json;
    } catch (error) {
      console.error("Error getting profile ", error);
      return {
        success: false,
        message: "Failed to fetch profile due to an error.",
      };
    }
  };

  const editAdmin = async (id, updatedData) => {
    try {
      const res = await fetch(`${server}/admin/edit-profile/${id}`, {
        method: "PUT", // Use PUT for updates
        credentials: "include", // This ensures cookies are sent with the request
        headers: {
          "Content-Type": "application/json", // Ensure the request body is in JSON format
        },
        body: JSON.stringify(updatedData), // Convert the updated data to JSON format
      });

      const json = await res.json();

      console.log("Edit profile response: ", json);

      return json; // Return the JSON response
    } catch (error) {
      console.error("Error editing profile: ", error);
      return {
        success: false,
        message: "Failed to edit profile due to an error.",
      };
    }
  };

  const getAdmins = async () => {
    try {
      const res = await fetch(`${server}/admin/admins`, {
        method: "GET",
      });
      const json = await res.json();
      return json;
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  const registerAdmin = async (data) => {
    try {
      const response = await fetch(`${server}/admin/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error("An error occurred while adding the admin.");
    }
  };

  const registerAdminFromFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("excelFile", file);

      const response = await fetch(`${server}/admin/register-from-file`, {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Failed to register admins from file.");
      }

      return json;
    } catch (error) {
      console.error("Error in registerFromFile:", error.message);
      throw error;
    }
  };

  const deleteAdmin = async (id) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      try {
        const response = await fetch(`${server}/admin/delete/${id}`, {
          method: "DELETE",
        });
        const result = await response.json();
        return result;
      } catch (error) {
        console.error("Error deleting admin:", error);
        toast.error("An error occurred while deleting the admin.");
      }
    }
  };

  return (
    <AdminContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loginAdmin,
        isAuthenticated,
        setIsAuthenticated,
        getProfile,
        getAdminProfile,
        editAdmin,
        getAdmins,
        registerAdminFromFile,
        registerAdmin,
        deleteAdmin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
