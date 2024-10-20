import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Admin from './pages/Admin/Admin'
import { AdminApis } from './context/AdminApis'
import { AuthApis } from './context/AuthApis'
import { StudentApis } from './context/StudentApis'

export default function App() {
  return (
    <>
      <StudentApis>
        <AuthApis>
          <AdminApis>
            <Routes>
              <Route path='/admin/*' element={<Admin />} />
            </Routes>
          </AdminApis>
        </AuthApis>
      </StudentApis>
    </>
  )
}
