import express from "express"
import { login, logOut, resetPassword, sendOtp, signup, verifyOtp } from "../controllers/auth.controller.js"

const authRouter = express.Router()

authRouter.post("/register",signup)
authRouter.post("/login",login)
authRouter.get("/logout",logOut)
authRouter.post("/sendotp", sendOtp)
authRouter.post("/verifyotp", verifyOtp)
authRouter.post("/resetpassword", resetPassword)

export default authRouter