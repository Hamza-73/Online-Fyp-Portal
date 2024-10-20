// context/AdminApis.js
import React, { createContext, useState } from 'react';
import { server } from '../server';

// Create the 
export const StudentContext = createContext();

// AdminProvider component to wrap your app
export function StudentApis({ children }) {
    
    const editStudentProfile = async (id, data)=>{
        try {
            const res = await fetch(`${server}/student/edit-profile/${id}`,{
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
            
        }
    }
    
    return (
        <StudentContext.Provider
            value={{
                editStudentProfile
            }}
        >
            {children}
        </StudentContext.Provider>
    );
}
