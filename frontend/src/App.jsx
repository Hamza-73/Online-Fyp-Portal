import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Admin from './pages/Admin/Admin'
import { AdminApis } from './context/AdminApis'
import { AuthApis } from './context/AuthApis'
import { StudentApis } from './context/StudentApis'
import Auth from './Auth'
import Student from './pages/Student/Student'
import { SupervisorApis } from './context/SupervisorApis.jsx'
import Supervisor from './pages/Supervisor/Supervisor.jsx'

export default function App() {
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
              </Routes>
            </AdminApis>
          </AuthApis>
        </StudentApis>
      </SupervisorApis>
    </>
  )
}
