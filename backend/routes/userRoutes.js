import express from "express"
import { currentUser, deleteUser, getAllUsers, updateAvatar } from "../controllers/user.controller.js"
import { isAuth } from "../middleware/authMiddleware.js"

const userRouter = express.Router()

userRouter.get("/current-user",isAuth , currentUser)
userRouter.post("/update-avatar", updateAvatar)
userRouter.get("/all-user", getAllUsers)
userRouter.delete("/delete-user/:userId", isAuth, deleteUser)


export default userRouter