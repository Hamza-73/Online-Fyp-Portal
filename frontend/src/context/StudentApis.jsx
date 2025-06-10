// context/AdminApis.js
import React, { createContext, useEffect, useState } from "react";
import { server } from "../server";

// Create the
export const StudentContext = createContext();

// AdminProvider component to wrap your app
export function StudentApis({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const registerStudentFromFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("excelFile", file);

      const response = await fetch(`${server}/student/register-from-file`, {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(
          json.message || "Failed to register students from file."
        );
      }

      return json;
    } catch (error) {
      console.error("Error in registerFromFile:", error.message);
      throw error;
    }
  };

  const editStudentProfile = async (id, data) => {
    try {
      const res = await fetch(`${server}/student/edit-profile/${id}`, {
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
      console.log("error in editing student", error);
    }
  };

  const getStudentProfile = async (id) => {
    try {
      const res = await fetch(`${server}/student/get-profile/${id}`, {
        method: "GET",
        credentials: "include",
      });
      const result = await res.json();
      console.log("result is ", result);
      return result;
    } catch (error) {
      console.error("Error registering :", error);
      return {
        success: false,
        message: "Getting Student Profile failed due to an error.",
      };
    }
  };

  const getProfile = async () => {
    try {
      const res = await fetch(`${server}/student/get-profile`, {
        method: "GET",
        credentials: "include",
      });
      const result = await res.json();
      setCurrentUser(result.student);
    } catch (error) {
      console.error("Error registering :", error);
      return {
        success: false,
        message: "Getting Student Profile failed due to an error.",
      };
    }
  };

  const deleteStudent = async (id) => {
    try {
      const res = await fetch(`${server}/student/delete-student/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await res.json();
      return result;
    } catch (error) {
      console.log("error in deleting student", error);
    }
  };

  const sendProjectRequest = async (id, data) => {
    try {
      const res = await fetch(`${server}/student/send-project-request/${id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "Application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      console.log("result is ", result);
      return result;
    } catch (error) {
      console.error("Error getting :", error);
      return { success: false, message: "supervisor not found" };
    }
  };

  const getSupervisorDetail = async (id) => {
    try {
      const res = await fetch(`${server}/student/get-supervisor-detail/${id}`, {
        method: "GET",
      });
      const result = await res.json();
      console.log("result is supervisor ", result);
      return result;
    } catch (error) {
      console.error("Error getting :", error);
      return { success: false, message: "supervisor not found" };
    }
  };

  const fetchMyGroup = async () => {
    try {
      const res = await fetch(`${server}/student/my-group`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error getting :", error);
      return { success: false, message: "group not found" };
    }
  };

  const requestToJoinGroup = async (groupId) => {
    try {
      const res = await fetch(
        `${server}/student/request-to-join-group/${groupId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error getting :", error);
      return { success: false, message: "group not found" };
    }
  };

  const uploadDocument = async (formData) => {
    try {
      const response = await fetch(`${server}/student/upload-document`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await response.json();
      console.log("response in uplading file is ", data);
      return data;
    } catch (error) {
      setMessage("Error uploading document");
    }
  };

  const uploadProjectSubmission = async (formData) => {
    try {
      const response = await fetch(`${server}/student/upload-project`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await response.json();
      console.log("response in uplading file is ", data);
      return data;
    } catch (error) {
      setMessage("Error uploading document");
    }
  };

  const requestMeeting = async () => {
    try {
      const response = await fetch(`${server}/student/request-meeting`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error requesting meeting :", error);
      return { success: false, message: "error requesting meeting try again!" };
    }
  };

  const requestExtension = async (reason) => {
    try {
      const response = await fetch(`${server}/student/request-extension`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(reason),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error requesting extension :", error);
      return {
        success: false,
        message: "error requesting extension try again!",
      };
    }
  };

  return (
    <StudentContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        editStudentProfile,
        deleteStudent,
        getStudentProfile,
        getProfile,
        sendProjectRequest,
        getSupervisorDetail,
        fetchMyGroup,
        requestToJoinGroup,
        registerStudentFromFile,
        uploadDocument,
        uploadProjectSubmission,
        requestMeeting,
        requestExtension,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}
