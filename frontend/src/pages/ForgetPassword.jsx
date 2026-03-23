import { FaArrowAltCircleLeft } from 'react-icons/fa';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { serverUrl } from '../main';

function ForgetPassword() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [ confirmPassword ,setConfirmPassword] = useState("")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSendOtp = async()=>{
        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/auth/sendotp`,{
                email,
                
            }, {withCredentials:true})
            console.log(result)
            setErr("")
            setStep(2)
            setLoading(false)
        } catch (error) {
            setLoading(false)
          setErr(error?.response?.data?.message || error.message)

        }
    }

      const handleVerifyOtp = async()=>{
        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/auth/verifyotp`,{
                email,otp
                
            }, {withCredentials:true})
            console.log(result)
            setErr("")
            setStep(3)
            setLoading(false)
        } catch (error) {
            setLoading(false)
          setErr(error?.response?.data?.message || error.message)

        }
    }

    const handleResetPassword = async()=>{
        if(newPassword!=confirmPassword){
            return null
        }
        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/auth/resetpassword`,{
                email,newPassword
                
            }, {withCredentials:true})
            console.log(result)
            setErr("")
            navigate("/login")
            setLoading(false)
        } catch (error) {
            setLoading(false)
          setErr(error?.response?.data?.message || error.message)

        }
    }

    

  return (
    <div className='flex justify-center items-center min-h-screen p-4 w-full bg-[#fff9f6]'>
        <div className='bg-white rounded-xl shadow-lg w-full max-w-md p-8'>

            <div className='flex items-center gap-4 mb-4'>
                <FaArrowAltCircleLeft size={25} onClick={()=>navigate("/login")} className='cursor-pointer'  />
               <h1 className='text-xl font-bold text-center text-blue-500'>Forgot Password</h1>
            </div>

            {step==1
            && <div> 
                <div className='mb-4 mt-6'>
                    <label htmlFor="email" className='block text-gray-700 font-medium mb-1 ml-1'>Email</label>
                    <input type="email" className='w-full border rounded-lg px-3 py-2 focus:outline-none border-[1px] border-gray-400'
                    onChange={(e)=>setEmail(e.target.value)}
                    value={email}
                    placeholder='Enter Your Email' required />
               </div>
                <button onClick={handleSendOtp}  className={`w-full mt-4 items-center justify-center text-md font-semibold flex 
                gap-2 rounded-lg px-4 py-2 transition duration-200 bg-blue-500 text-white hover:bg-blue-600 cursor-pointer`} disabled={loading} >
                    {loading?<ClipLoader color='white' size={20}/>:"Send OTP"}
                </button>

                 {err && <p className='text-red-500 text-center mt-[4px] font-semibold '>*{err}</p>}

               </div>}

             {step==2
            && <div> 
                <div className='mb-4 mt-6'>
                    <label htmlFor="email" className='block text-gray-700 font-medium mb-1 ml-1'>OTP</label>
                    <input type="string" className='w-full border rounded-lg px-3 py-2 focus:outline-none border-[1px] border-gray-400'
                    onChange={(e)=>setOtp(e.target.value)}
                    value={otp}
                    placeholder='Enter OTP number' required />
               </div>
                <button onClick={handleVerifyOtp}  className={`w-full mt-4 items-center justify-center text-md font-semibold flex 
                gap-2 rounded-lg px-4 py-2 transition duration-200 bg-blue-500 text-white hover:bg-blue-600 cursor-pointer`} disabled={loading} >
                    {loading?<ClipLoader  color='white' size={20}/>:"Verify OTP"}

                </button>
                
                 {err && <p className='text-blue-500 text-center mt-[4px] font-semibold '>*{err}</p>}
               </div>}

              {step==3
               && <div> 
                <div className='mb-4 mt-6'>
                    <label htmlFor="new password" className='block text-gray-700 font-medium mb-1 ml-1'>New Password</label>
                    <input type="string" className='w-full border rounded-lg px-3 py-2 focus:outline-none border-[1px] border-gray-400'
                    onChange={(e)=>setNewPassword(e.target.value)}
                    value={newPassword}
                    placeholder='New Password' required />
               </div>

               <div className='mb-4 mt-6'>
                    <label htmlFor="confrim password" className='block text-gray-700 font-medium mb-1 ml-1'>Confirm Password</label>
                    <input type="string" className='w-full border rounded-lg px-3 py-2 focus:outline-none border-[1px] border-gray-400'
                    onChange={(e)=>setConfirmPassword(e.target.value)}
                    value={confirmPassword}
                    placeholder='Confirm Password' required />
               </div>
                <button onClick={handleResetPassword}  className={`w-full mt-4 items-center justify-center text-md font-semibold flex 
                gap-2 rounded-lg px-4 py-2 transition duration-200 bg-blue-500 text-white hover:bg-blue-600 cursor-pointer`} disabled={loading} >
                    {loading?<ClipLoader color='white' size={20}/>:"Reset Password"}

                </button>

                     {err && <p className='text-blue-500 text-center mt-[4px] font-semibold '>*{err}</p>}
               </div>}
        </div>
    </div>
  )
}

export default ForgetPassword