import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../model/auth.model.js";
import { sendOtpMail } from "../config/mail.js";



export const signup = async (req, res) => {
  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existUser = await User.findOne({ email });

    if (existUser) {
      return res.status(409).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
      // role default = user
    });

    return res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.log("Signup error:", error);

    return res.status(500).json({
      message: "Signup failed",
      error: error.message
    });

  }
};


export const login = async (req, res) => {

  try {

    const { email, password } = req.body;


    /* ========= ADMIN LOGIN ========= */

    if (email === process.env.ADMIN_EMAIL) {

      if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({
          message: "Invalid admin credentials"
        });
      }

      const token = jwt.sign(
        { role: "admin", email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge:  7 * 24 * 60 * 60 * 1000
      });

      return res.status(200).json({
        message: "Admin login successful",
        role: "admin"
      });
    }



    /* ========= USER LOGIN ========= */

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      message: "Login successful",
      role: user.role
    });

  } catch (error) {

    console.log("Login error:", error);

    return res.status(500).json({
      message: "Login error",
      error: error.message
    });

  }

};



export const logOut = async (req, res) => {

  try {

    res.clearCookie("token");

    return res.status(200).json({
      message: "Logout successfully"
    });

  } catch (error) {

    return res.status(500).json({
      message: "Error in logout",
      error: error.message
    });

  }

};

export const sendOtp = async(req,res)=>{
    try {
        const {email} = req.body;

        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"user not found"})
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        //opt user model me resetopt me store karne ke liye step 

        user.resetOtp = otp
        user.otpExpires = Date.now()+5*60*1000

        user.isOtpVerified = false
        await user.save()

        await sendOtpMail({ to: email, otp });

        return res.status(200).json({message:"OTP send successfully"})
    } catch (error) {
        return res.status(500).json(`OTP send error ${error}`)
        
    }
}

export const verifyOtp = async(req,res)=>{
    try {
        const {email, otp} = req.body;

        const user = await User.findOne({email})

        if(!user || user.resetOtp!=otp || user.otpExpires<Date.now()){
            return res.status(400).json({message:"invalid/expired otp"})
        }

        user.isOtpVerified=true
        user.resetOtp = undefined
        user.otpExpires = undefined

        await user.save()
        return res.status(200).json({message:"OTP verify successfully"})

    } catch (error) {
        return res.status(500).json(`error in otp verify ${error}`)
    }
}


export const resetPassword = async(req,res)=>{
    try {
        const {email, newPassword} = req.body

         const user = await User.findOne({email})

        if(!user || !user.isOtpVerified){
            return res.status(400).json({message:"OTP verification required"})
        }

        if(!newPassword){
            return res.status(404).json({message:"password is requires"})
        }
        const hashPassword = await bcrypt.hash(newPassword, 12)
        user.password = hashPassword
        user.isOtpVerified = false
        await user.save()

        return res.status(200).json({message:"password reset successfully"})

    } catch (error) {
        console.log(`error in password reset ${error}`)
         
        return res.status(400).json({message:`verify token error ${error}`})
        
    }
}


export const googleAuth = async(req,res)=>{
    try {
        const {mobile, fullName, email,role} = req.body

        let user = await User.findOne({email})
        if(!user){
            user = await User.create({
                email,
                fullName,
                mobile,
                role
            })
        }

        let token = await getToken(user._id)
        res.cookie("token", token, {
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000,
            httpOnly:true
        })

        return res.status(200).json(user)

    } catch (error) {
        console.log(`error in googleAuth ${error}`)
        return res.status(500).json(`error in googleAuth ${error}`)
    }
}

