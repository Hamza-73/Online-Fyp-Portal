import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Admin from './pages/Admin/Admin'
import { AdminApis } from './context/AdminApis'
import { AuthApis } from './context/AuthApis'
import { StudentApis } from './context/StudentApis'
import Auth from './Auth'
import Student from './pages/Student/Student'
import { SupervisorApis } from './context/SupervisorApis.jsx'
import Supervisor from './pages/Supervisor/Supervisor.jsx'
import Loading from './pages/Loading.jsx'
import socket from './socket/socket.js'

export default function App() {

  //to verify socket connection
  useEffect(()=>{
    socket.on("connect", ()=>{
      console.log("socket connected ", socket.id)
    })

    socket.emit("message","frontend message");
    
  },[])

  return (
    <>
      <SupervisorApis>
        <StudentApis>
          <AuthApis>
            <AdminApis>
              <Routes>
                <Route path='/' element={<Auth />} />
                <Route path='/admin/*' element={<Admin />} />
                <Route path='/student/*' element={<Student />} />
                <Route path='/supervisor/*' element={<Supervisor />} />
                <Route path='/loading' element={<Loading />} />
              </Routes>
            </AdminApis>
          </AuthApis>
        </StudentApis>
      </SupervisorApis>
    </>
  )
}
