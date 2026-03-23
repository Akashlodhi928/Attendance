import mongoose from "mongoose"

const attendanceSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  date: String,

  checkInTime: Date,

  checkOutTime: Date,

  image: String,

  location: {
    lat: Number,
    lng: Number
  },

  address: String,

  status: {
    type: String,
    enum:["active","completed"],
    default: "active"
  },

  createdAt:{
    type:Date,
    default:Date.now
  }

});

attendanceSchema.index({ user: 1, date: 1 }, { unique: true })

export default mongoose.model("Attendance", attendanceSchema)