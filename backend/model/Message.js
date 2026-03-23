import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,

  // 🔥 NEW FIELD
  seen: {
    type: Boolean,
    default: false
  }

}, { timestamps: true })

export default mongoose.model("Message", messageSchema)