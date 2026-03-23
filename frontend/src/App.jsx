import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import { useAuth } from "./context/AuthContext"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import AdminDashboard from "./pages/AdminDashboard"
import UserDashboard from "./pages/UserDashboard"
import Dashboard from "./pages/user/Dashboard"
import AttendanceReport from "./pages/user/AttendanceReport"
import MyAccount from "./pages/user/MyAccount"
import AttendanceAnalytics from "./pages/user/AttendanceAnalytics"
import ForgetPassword from "./pages/ForgetPassword"
import AdminHome from "./pages/admin/AdminHome"
import AdminAttendance from "./pages/admin/AdminAttendance"
import Employees from "./pages/admin/Employees"
import DayWiseAttendance from "./pages/admin/DayWiseAttendance"
import LiveMap from "./pages/admin/LiveMap"
import Chat from "./pages/user/Chat"

function App() {

  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h2 className="text-xl font-semibold animate-pulse">
          Loading Application...
        </h2>
      </div>
    )
  }


  return (

    <BrowserRouter>

        <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"/>

      <Routes>

         <Route path="/" element={<Home />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
          <Route path="/user-dashboard" element={
          user?.role === "user" ? <UserDashboard /> : <Navigate to="/" />
        }>
          <Route index element={<Dashboard />} />
          <Route path="attendance" element={<AttendanceReport />} />
           <Route path="attendance-analytics" element={<AttendanceAnalytics />} />
          <Route path="account" element={<MyAccount />} />
           <Route path="chat" element={<Chat />} />
        </Route>
       <Route path="/admin-dashboard" element={<AdminDashboard/>}>

        <Route index element={<AdminHome/>}/>
        <Route path="attendance" element={<AdminAttendance/>}/>
        <Route path="employees" element={<Employees/>}/>
        <Route path="day-wise-attendance" element={<DayWiseAttendance />} />
        </Route>

        <Route path="/live-map/:userId" element={<LiveMap />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
       
      </Routes>

    </BrowserRouter>

  )
}

export default App