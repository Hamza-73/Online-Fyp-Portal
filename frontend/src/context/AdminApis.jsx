// context/AdminApis.js
import React, { createContext, useState } from 'react';
import { server } from '../server';
import toast from 'react-hot-toast';

// Create the AdminContext
export const AdminContext = createContext();

// AdminProvider component to wrap your app
export function AdminApis({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Admin login function
    const loginAdmin = async (data) => {
        try {
            const res = await fetch(`${server}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            const json = await res.json();
            console.log('Login response:', json);

            // Return the response to the calling component
            return json;
        } catch (error) {
            console.error('Error logging in:', error);
            toast.error('An error occurred while logging in');
            return { success: false, message: 'Login failed due to an error.' };
        }
    };

    const getProfile = async () => {
        try {
            const res = await fetch(`${server}/admin/profile`, {
                method: 'GET',
                credentials: 'include',  // This ensures cookies are sent with the request
                headers: {
                    'Content-Type': 'application/json',  // Ensure the response is in JSON format
                },
            });
    
            const json = await res.json();
    
            console.log("profile data is ", json);
    
            return json;
        } catch (error) {
            console.error('Error getting profile ', error);
            return { success: false, message: 'Failed to fetch profile due to an error.' };
        }
    };

    const getAdminProfile = async (id) => {
        try {
            const res = await fetch(`${server}/admin/get-profile/${id}`, {
                method: 'GET',
                credentials: 'include',  // This ensures cookies are sent with the request
                headers: {
                    'Content-Type': 'application/json',  // Ensure the response is in JSON format
                },
            });
    
            const json = await res.json();
    
            console.log("profile data is ", json);
    
            return json;
        } catch (error) {
            console.error('Error getting profile ', error);
            return { success: false, message: 'Failed to fetch profile due to an error.' };
        }
    };

    const editAdmin = async (id, updatedData) => {
        try {
            const res = await fetch(`${server}/admin/edit-profile/${id}`, {
                method: 'PUT', // Use PUT for updates
                credentials: 'include', // This ensures cookies are sent with the request
                headers: {
                    'Content-Type': 'application/json', // Ensure the request body is in JSON format
                },
                body: JSON.stringify(updatedData), // Convert the updated data to JSON format
            });
    
            const json = await res.json();
    
            console.log("Edit profile response: ", json);
    
            return json; // Return the JSON response
        } catch (error) {
            console.error('Error editing profile: ', error);
            return { success: false, message: 'Failed to edit profile due to an error.' };
        }
    };
    
    return (
        <AdminContext.Provider
            value={{
                loginAdmin,
                isAuthenticated,
                setIsAuthenticated,
                getProfile,
                getAdminProfile,
                editAdmin,
            }}
        >
            {children}
        </AdminContext.Provider>
    );
}
