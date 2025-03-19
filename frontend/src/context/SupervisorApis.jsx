// context/AdminApis.js
import React, { createContext, useEffect, useState } from "react";
import { server } from "../server";

// Create the
export const SupervisorContext = createContext();

// AdminProvider component to wrap your app
export function SupervisorApis({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const registerSupervisorFromFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("excelFile", file);

      const response = await fetch(`${server}/supervisor/register-from-file`, {
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

  const deleteSupervisor = async (id) => {
    try {
      const res = await fetch(`${server}/supervisor/delete-supervisor/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await res.json();
      return result;
    } catch (error) {
      console.log("error in deleting student", error);
    }
  };

  const getSupervisorProfile = async (id) => {
    try {
      const res = await fetch(`${server}/supervisor/get-profile/${id}`, {
        method: "GET",
        credentials: "include",
      });
      const result = await res.json();
      console.log("result is ", result);
      return result;
    } catch (error) {
      console.error("Error getting profile :", error);
      return {
        success: false,
        message: "Getting Supervisor Profile failed due to an error.",
      };
    }
  };

  const editSupervisorProfile = async (id, data) => {
    try {
      const res = await fetch(`${server}/supervisor/edit-profile/${id}`, {
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

  const getSupervisors = async () => {
    try {
      const res = await fetch(`${server}/supervisor/supervisors`, {
        method: "GET",
      });
      const json = await res.json();
      return json;
    } catch (error) {
      console.error("Error fetching supervisors:", error);
    }
  };

  const getProfile = async () => {
    try {
      const res = await fetch(`${server}/supervisor/get-profile`, {
        method: "GET",
        credentials: "include",
      });
      const result = await res.json();
      console.log("result is ", result);
      setCurrentUser(result.supervisor);
    } catch (error) {
      console.error("Error getting profile :", error);
      return {
        success: false,
        message: "Getting Supervisor Profile failed due to an error.",
      };
    }
  };

  const getMyGroups = async () => {
    try {
      const res = await fetch(`${server}/supervisor/get-my-groups`, {
        method: "GET",
        credentials: "include",
      });
      const result = await res.json();
      console.log("result is ", result);
      return result;
    } catch (error) {
      console.error("Error getting profile :", error);
      return {
        success: false,
        message: "Getting Supervisor Profile failed due to an error.",
      };
    }
  };

  const getPropsalRequests = async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/supervisor/view-requests`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const result = await res.json();
      console.log("result is ", result);
      return result;
    } catch (error) {
      console.error("Error getting profile :", error);
      return {
        success: false,
        message: "Getting Supervisor Profile failed due to an error.",
      };
    }
  };

  const acceptProposalRequest = async (requestId) => {
    try {
      const response = await fetch(
        `${server}/supervisor/accept-request/${requestId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.log("error in accepting request", error);
    }
  };

  const rejectProposalRequest = async (requestId) => {
    try {
      const response = await fetch(
        `${server}/supervisor/reject-request/${requestId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.log("error in accepting request", error);
    }
  };

  const reviewDocument = async (groupId, index, review) => {
    try {
      const response = await fetch(
        `${server}/supervisor/review-document/${groupId}/${index}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ review }),
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.log("error in accepting request", error);
    }
  };

  const setDeadline = async (submissionType, deadlineDate) => {
    try {
      const response = await fetch(`${server}/supervisor/set-deadline`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submissionType, deadlineDate }),
      });
      const result = response.json();
      return result;
    } catch (error) {
      console.log("error in setting deadline ", error);
    }
  };

  return (
    <SupervisorContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        deleteSupervisor,
        getSupervisorProfile,
        editSupervisorProfile,
        getSupervisors,
        getProfile,
        getPropsalRequests,
        acceptProposalRequest,
        rejectProposalRequest,
        getMyGroups,
        registerSupervisorFromFile,
        reviewDocument,
        setDeadline,
      }}
    >
      {children}
    </SupervisorContext.Provider>
  );
}
