import React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import AdminDashboard from "./AdminDashboard"
import UserDashboard from "./UserDashboard"


function Home() {

  const { user, loading } = useAuth()


  /* ======================
        LOADING STATE
  ====================== */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h2 className="text-xl font-semibold animate-pulse">
          Loading...
        </h2>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (user.role === "admin") {
    return <Navigate to="/admin-dashboard" />
  }


  if (user.role === "user") {
    return <Navigate to="/user-dashboard" />
  }


  return null
}

export default Home