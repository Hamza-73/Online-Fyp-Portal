// context/AdminApis.js
import React, { createContext } from 'react';
import { server } from '../server';

// Create the 
export const SupervisorContext = createContext();

// AdminProvider component to wrap your app
export function SupervisorApis({ children }) {


    const deleteSupervisor = async (id)=>{
        try {
            const res = await fetch(`${server}/supervisor/delete-supervisor/${id}`,{
                method:"DELETE",
                credentials:"include"
            });
            const result = await res.json();
            return result;
        } catch (error) {
            console.log("error in deleting student", error)            
        }
    }

    const getSupervisorProfile = async (id)=>{
        try {
            const res = await fetch(`${server}/supervisor/get-profile/${id}`,{
                method: 'GET',
                credentials: 'include',
            });
            const result = await res.json();
            console.log("result is ", result);
            return result;
        } catch (error) {
            console.error('Error getting profile :', error);
            return { success: false, message: 'Getting Supervisor Profile failed due to an error.' };
        }
    }

    const editSupervisorProfile = async (id, data)=>{
        try {
            const res = await fetch(`${server}/supervisor/edit-profile/${id}`,{
                method: 'PUT',
                headers:{
                    'Content-Type': 'application/json',
                },
                credentials:"include",
                body: JSON.stringify(data)
            });
            const result = await res.json();
            console.log("result is ", result);
            return result;
        } catch (error) {
            console.log("error in editing student", error)
        }
    }

    const getSupervisors = async () => {
        try {
            const res = await fetch(`${server}/supervisor/supervisors`, { method: 'GET' });
            const json = await res.json();
            return json;
        } catch (error) {
            console.error('Error fetching supervisors:', error);
        }
    };

    const getProfile = async ()=>{
        try {
            const res = await fetch(`${server}/supervisor/get-profile`,{
                method: 'GET',
                credentials: 'include',
            });
            const result = await res.json();
            console.log("result is ", result);
            return result;
        } catch (error) {
            console.error('Error getting profile :', error);
            return { success: false, message: 'Getting Supervisor Profile failed due to an error.' };
        }
    }

    const getMyGroups = async ()=>{
        try {
            const res = await fetch(`${server}/supervisor/get-my-groups`,{
                method: 'GET',
                credentials: 'include',
            });
            const result = await res.json();
            console.log("result is ", result);
            return result;
        } catch (error) {
            console.error('Error getting profile :', error);
            return { success: false, message: 'Getting Supervisor Profile failed due to an error.' };
        }
    }

    const getPropsalRequests = async ()=>{
        try {
            const res = await fetch(`http://localhost:4000/supervisor/view-requests`,{
                method: 'GET',
                credentials: 'include',
            });
            const result = await res.json();
            console.log("result is ", result);
            return result;
        } catch (error) {
            console.error('Error getting profile :', error);
            return { success: false, message: 'Getting Supervisor Profile failed due to an error.' };
        }
    }

    const acceptProposalRequest = async (requestId) =>{
        try {
            const response = await fetch(`${server}/supervisor/accept-request/${requestId}`,{
                method: 'POST',
                credentials: 'include',
            });
            const result = await response.json();
            return result;
        } catch (error) {
            console.log("error in accepting request", error)            
        }
    }

    const rejectProposalRequest = async (requestId) =>{
        try {
            const response = await fetch(`${server}/supervisor/reject-request/${requestId}`,{
                method: 'POST',
                credentials: 'include',
            });
            const result = await response.json();
            return result;
        } catch (error) {
            console.log("error in accepting request", error)            
        }
    }
    
    return (
        <SupervisorContext.Provider
            value={{
                deleteSupervisor,
                getSupervisorProfile,
                editSupervisorProfile,
                getSupervisors,
                getProfile,
                getPropsalRequests,
                acceptProposalRequest,
                rejectProposalRequest,
                getMyGroups
            }}
        >
            {children}
        </SupervisorContext.Provider>
    );
}
