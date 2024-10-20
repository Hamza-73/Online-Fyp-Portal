// context/AdminApis.js
import React, { createContext, useState } from 'react';
import { server } from '../server';
import toast from 'react-hot-toast';

// Create the 
export const AuthContext = createContext();

// AdminProvider component to wrap your app
export function AuthApis({ children }) {
    
    const registerStudent = async (data)=>{
        try {
            console.log("data ", data)
            const res = await fetch(`${server}/auth/register-student`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    
                },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            const result = await res.json();
            console.log("result is ", result);
            return result;
        } catch (error) {
            console.error('Error registering :', error);
            return { success: false, message: 'Registering Student failed due to an error.' };
        }
    }

    const getStudentProfile = async (id) =>{
        try {
            const res = await fetch(`${server}/student/get-profile/${id}`,{
                method: 'GET',
                credentials: 'include',
            });
            const result = await res.json();
            console.log("result is ", result);
            return result;
        } catch (error) {
            console.error('Error registering :', error);
            return { success: false, message: 'Getting Student Profile failed due to an error.' };
        }
    }
    
    return (
        <AuthContext.Provider
            value={{
                registerStudent,
                getStudentProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
