import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  lat: Number,
  lng: Number,
  address: String
}, {
  timestamps: true   // ⚠️ THIS IS MUST
})

const Location = mongoose.model("Location", locationSchema)

export default Location