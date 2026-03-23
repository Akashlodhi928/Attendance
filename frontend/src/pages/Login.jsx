import React, { useState } from "react"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { toast } from "react-toastify"
import { serverUrl } from "../main"

function Login() {

  const navigate = useNavigate()
  const { setUser } = useAuth()

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [loading,setLoading] = useState(false)
  const [showPassword,setShowPassword] = useState(false)

  const handleLogin = async (e)=>{
    e.preventDefault()

    try {

      setLoading(true)

      const res = await axios.post(
        `${serverUrl}/api/auth/login`,
        { email, password },
        { withCredentials:true }
      )

      const role = res.data.role

      const userRes = await axios.get(
        `${serverUrl}/api/user/current-user`,
        { withCredentials:true }
      )
      toast.success("Login success")
      setUser(userRes.data.user)

      if(role === "admin"){
        navigate("/admin-dashboard")
      }else{
        navigate("/user-dashboard")
      }

    } catch (error) {

      toast.error(error.response?.data?.message || "Login failed")

    } finally {
      setLoading(false)
    }
  }

  return (

    <div className="min-h-screen flex">

      {/* LEFT SECTION */}

      <div className="hidden md:flex w-1/2 bg-blue-600 text-white flex-col justify-center items-center p-10">

        <h1 className="text-4xl font-bold mb-6">
          Employee Attendance System
        </h1>

        <p className="text-lg text-center max-w-md">
          Track employee attendance easily with our modern attendance
          management system. Monitor check-ins, manage users and
          simplify workforce tracking.
        </p>

      </div>


      {/* RIGHT SECTION */}

      <div className="w-full md:w-1/2 flex justify-center items-center bg-gray-100">

        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-xl shadow-lg w-[360px] space-y-5"
        >

          <h2 className="text-2xl font-bold text-center text-gray-800">
            Login
          </h2>


          {/* EMAIL */}

          <div className="flex items-center border rounded px-3 py-2">

            <Mail size={18} className="text-gray-400"/>

            <input
              type="email"
              placeholder="Email"
              required
              className="outline-none ml-2 w-full"
              onChange={(e)=>setEmail(e.target.value)}
            />

          </div>


          {/* PASSWORD */}

          <div className="flex items-center border rounded px-3 py-2">

            <Lock size={18} className="text-gray-400"/>

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              className="outline-none ml-2 w-full"
              onChange={(e)=>setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={()=>setShowPassword(!showPassword)}
              className="text-gray-500"
            >
              {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>

          </div>


          {/* FORGOT PASSWORD BUTTON */}

          <div className="text-right -mt-2">
            <span
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-blue-600 cursor-pointer hover:underline"
            >
              Forgot Password?
            </span>
          </div>


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>


          {/* REGISTER SECTION */}

          <p className="text-center text-sm text-gray-500">

            Create a new account ?

            <span
              onClick={()=>navigate("/signup")}
              className="text-blue-600 font-medium ml-1 cursor-pointer hover:underline"
            >
              Signup
            </span>

          </p>

        </form>

      </div>

    </div>
  )
}

export default Login