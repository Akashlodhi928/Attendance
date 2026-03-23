import React, { createContext, useContext, useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { serverUrl } from "../main"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)


  /* =========================
        GET CURRENT USER
  ========================= */

  const fetchCurrentUser = async () => {

    try {

      const res = await axios.get(
        `${serverUrl}/api/user/current-user`,
        { withCredentials: true }
      )

      setUser(res.data.user)

    } catch (error) {

      setUser(null)

    } finally {

      setLoading(false)

    }

  }



  /* =========================
          LOGOUT
  ========================= */

  const logout = async () => {

    try {

      await axios.get(
        `${serverUrl}/api/auth/logout`,
        { withCredentials: true }
      )

      setUser(null)
      toast.success("logout success")

    } catch (error) {

      console.log("Logout error", error)
       toast.error(error?.response?.data?.message || "Something went wrong ")

    }

  }



  useEffect(() => {
    fetchCurrentUser()
  }, [])



  return (

    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        fetchCurrentUser,
        logout
      }}
    >

      {children}

    </AuthContext.Provider>

  )

}



/* =========================
        CUSTOM HOOK
========================= */

export const useAuth = () => {
  return useContext(AuthContext)
}