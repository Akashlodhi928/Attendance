import cloudinary from "../config/cloudinary.js";
import Attendance from "../model/Attendance.js";
import mongoose from "mongoose"
import axios from "axios";

const autoCloseAttendance = async (userId) => {

  const active = await Attendance.findOne({
    user:userId,
    status:"active"
  })

  if(active){

    const today = new Date().toISOString().split("T")[0]

    if(active.date !== today){

      const checkoutTime = new Date(active.checkInTime)

      checkoutTime.setHours(23,59,59,999)

      active.checkOutTime = checkoutTime

      active.status = "completed"

      await active.save()

    }

  }

}


export const checkIn = async (req, res) => {
  try {

    const { userId, image, lat, lng } = req.body

    if (!userId || !lat || !lng) {
      return res.status(400).json({
        message: "UserId, latitude and longitude required"
      })
    }

    const today = new Date().toISOString().split("T")[0]

    /* AUTO CLOSE OLD ATTENDANCE */

    await autoCloseAttendance(userId)

    const existing = await Attendance.findOne({
      user: new mongoose.Types.ObjectId(userId),
      date: today
    })

    if (existing) {
      return res.status(400).json({
        message: "Attendance already marked today"
      })
    }

    let address = "Address not found"

    try {

      const geo = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: {
            format: "json",
            lat: lat,
            lon: lng
          },
          headers: {
            "User-Agent": "attendance-system"
          }
        }
      )

      if (geo.data?.display_name) {
        address = geo.data.display_name
      }

    } catch (error) {
      console.log("Geo location error:", error.message)
    }

    let imageUrl = ""

    if (image) {

      const upload = await cloudinary.uploader.upload(image, {
        folder: "attendance"
      })

      imageUrl = upload.secure_url
    }

    const attendance = await Attendance.create({
      user: new mongoose.Types.ObjectId(userId),
      date: today,
      checkInTime: new Date(),
      location: {
        lat: lat,
        lng: lng
      },
      address: address,
      image: imageUrl,
      status: "active"
    })

    const io = req.app.get("io")

    if (io) {
      io.emit("attendanceMarked")
    }

    res.status(200).json({
      message: "Check-in successful",
      attendance
    })

  } catch (error) {

    console.log("CHECKIN ERROR:", error)

    res.status(500).json({
      message: "Server Error",
      error: error.message
    })

  }
}

export const checkOut = async (req, res) => {

  try {

    const { userId } = req.body

    const today = new Date().toISOString().split("T")[0]

    const attendance = await Attendance.findOne({
      user:userId,
      date:today,
      status:"active"
    })

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance not found"
      })
    }

    if (attendance.checkOutTime) {
      return res.json({
        message: "Already checked out"
      })
    }

    attendance.checkOutTime = new Date()

    attendance.status = "completed"

    await attendance.save()

    const io = req.app.get("io")

    if(io){
      io.emit("attendanceMarked")
    }

    res.json({
      message: "Checkout successful",
      attendance
    })

  } catch (error) {

    res.status(500).json({ error: error.message })

  }

};


export const fetchTodayAttendance = async (req, res) => {

  try {

    const { userId } = req.params;

    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({
      user: userId,
      date: today,
       checkOutTime: null 
    });

    res.json({
      attendance
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

export const fetchAttendanceHistory = async (req, res) => {

  try {

    const { userId } = req.params

    const attendance = await Attendance
      .find({ user: userId })
      .populate("user", "name")

    res.json({ attendance })

  } catch (error) {

    res.status(500).json({ error: error.message })

  }

}

export const getAllAttendance = async (req, res) => {
  try {

    const attendance = await Attendance
      .find()
      .populate("user", "name email avatar")
      .sort({ checkInTime: -1 });

    res.json({ attendance });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
};

export const getAdminDashboard = async (req, res) => {
  try {

    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const attendance = await Attendance.find()
      .populate("user", "name email avatar"); // ✅ FIXED

    const map = {};

    attendance.forEach(item => {

      // 🔥 VERY IMPORTANT FIX
      if (!item.user) return;

      const userId = item.user._id.toString();

      if (!map[userId]) {
        map[userId] = {
          user: item.user,
          present: 0,
          totalHours: 0,
          records: []
        };
      }

      map[userId].present += 1;

      if (item.checkInTime && item.checkOutTime) {
        const hours =
          (new Date(item.checkOutTime) - new Date(item.checkInTime)) / (1000 * 60 * 60);

        map[userId].totalHours += hours;
      }

      map[userId].records.push({
        date: item.checkInTime,
        checkInTime: item.checkInTime,
        checkOutTime: item.checkOutTime
      });

    });

    const users = Object.values(map).sort((a, b) => b.present - a.present);

    const topUser = users.length > 0 ? users[0] : null;

    const monthly = await Attendance.countDocuments({
      checkInTime: { $gte: startMonth }
    });

    res.json({
      success: true,
      users,
      topUser,
      monthly
    });

  } catch (err) {

    console.log("ADMIN DASHBOARD ERROR:", err); // 🔥 DEBUG

    res.status(500).json({
      message: err.message
    });
  }
};

export const getAttendanceByDate = async (req, res) => {
  try {

    const { date } = req.params

    const attendance = await Attendance.find({ date })
      .populate("user", "name email")

    res.status(200).json({
      success: true,
      attendance
    })

  } catch (error) {
    console.log(error)

    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}