import Message from "../model/Message.js"
import mongoose from "mongoose"

/* SEND */
export const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, text } = req.body

    const msg = await Message.create({
      sender,
      receiver,
      text,
      seen: false // ✅ always unread
    })

    res.json(msg)

  } catch (err) {
    res.status(500).json({ error: "Send failed" })
  }
}

/* GET CHAT */
export const getMessages = async (req, res) => {
  const { sender, receiver } = req.params

  // ✅ safety check
  if (
    !mongoose.Types.ObjectId.isValid(sender) ||
    !mongoose.Types.ObjectId.isValid(receiver)
  ) {
    return res.status(400).json({ error: "Invalid ID" })
  }

  const messages = await Message.find({
    $or: [
      { sender, receiver },
      { sender: receiver, receiver: sender }
    ]
  }).sort({ createdAt: 1 })

  res.json(messages)
}

/* 🔥 UNREAD COUNT */
export const getUnreadCounts = async (req, res) => {
  const { userId } = req.params

  const counts = await Message.aggregate([
    {
      $match: {
        receiver: new mongoose.Types.ObjectId(userId),
        seen: false
      }
    },
    {
      $group: {
        _id: "$sender",
        count: { $sum: 1 }
      }
    }
  ])

  res.json(counts)
}

/* 🔥 MARK AS SEEN */
export const markAsSeen = async (req, res) => {
  const { senderId, receiverId } = req.body

  await Message.updateMany(
    {
      sender: senderId,
      receiver: receiverId,
      seen: false
    },
    { $set: { seen: true } } // ✅ important
  )

  res.json({ success: true })
}