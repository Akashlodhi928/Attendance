import express from "express"
import { getMessages, getUnreadCounts, markAsSeen, sendMessage } from "../controllers/messageController.js"


const messageRoute = express.Router()

messageRoute.post("/send", sendMessage)

// ✅ IMPORTANT: specific route first
messageRoute.get("/unread/:userId", getUnreadCounts)

// ✅ dynamic route after
messageRoute.get("/:sender/:receiver", getMessages)

messageRoute.post("/seen", markAsSeen)

export default messageRoute