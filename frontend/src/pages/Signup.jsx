import React, { useState } from "react"
import { User, Mail, Lock } from "lucide-react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { toast } from "react-toastify"
import { serverUrl } from "../main"

function Signup() {

  const navigate = useNavigate()
  const { setUser } = useAuth()

  const [name,setName] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [loading,setLoading] = useState(false)

  const handleSignup = async (e)=>{
    e.preventDefault()

    try {

      setLoading(true)

      /* ========= REGISTER ========= */

      await axios.post(
        `${serverUrl}/api/auth/register`,
        {
          name,
          email,
          password
        },
        { withCredentials:true }
      )


     

      const loginRes = await axios.post(
        `${serverUrl}/api/auth/login`,
        {
          email,
          password
        },
        { withCredentials:true }
      )

      const role = loginRes.data.role


      /* ========= CURRENT USER ========= */

      const userRes = await axios.get(
        `${serverUrl}/api/user/current-user`,
        { withCredentials:true }
      )

      setUser(userRes.data.user)


      /* ========= REDIRECT ========= */

      if(role === "admin"){
        navigate("/admin-dashboard")
      }else{
        navigate("/user-dashboard")
      }
      
    toast.success("signUp success")
    } catch (error) {

       toast.error(error?.response?.data?.message || "Something went wrong ")

    } finally {

      setLoading(false)

    }
  }


  return (

    <div className="min-h-screen flex">

      {/* LEFT SECTION */}

      <div className="hidden md:flex w-1/2 bg-indigo-600 text-white flex-col justify-center items-center p-10">

        <h1 className="text-4xl font-bold mb-6">
          Join Our Attendance System
        </h1>

        <p className="text-lg text-center max-w-md">
          Create your account and start managing your attendance easily.
        </p>

      </div>



      {/* RIGHT SECTION */}

      <div className="w-full md:w-1/2 flex justify-center items-center bg-gray-100">

        <form
          onSubmit={handleSignup}
          className="bg-white p-8 rounded-xl shadow-lg w-[350px] space-y-5"
        >

          <h2 className="text-2xl font-bold text-center text-gray-800">
            Create Account
          </h2>



          {/* NAME */}

          <div className="flex items-center border rounded px-3 py-2">

            <User size={18} className="text-gray-400"/>

            <input
              type="text"
              placeholder="Name"
              required
              className="outline-none ml-2 w-full"
              value={name}
              onChange={(e)=>setName(e.target.value)}
            />

          </div>



          {/* EMAIL */}

          <div className="flex items-center border rounded px-3 py-2">

            <Mail size={18} className="text-gray-400"/>

            <input
              type="email"
              placeholder="Email"
              required
              className="outline-none ml-2 w-full"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />

          </div>



          {/* PASSWORD */}

          <div className="flex items-center border rounded px-3 py-2">

            <Lock size={18} className="text-gray-400"/>

            <input
              type="password"
              placeholder="Password"
              required
              className="outline-none ml-2 w-full"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />

          </div>



          {/* BUTTON */}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>



          {/* LOGIN LINK */}

          <p className="text-center text-sm text-gray-500">

            Already have an account?{" "}

            <span
              onClick={()=>navigate("/login")}
              className="text-indigo-600 cursor-pointer hover:underline"
            >
              Login
            </span>

          </p>

        </form>

      </div>

    </div>
  )
}

export default Signup