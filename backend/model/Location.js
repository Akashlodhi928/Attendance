import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  lat: Number,
  lng: Number,
  address: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Location = mongoose.model("Location", locationSchema)

export default Location