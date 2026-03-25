import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import { DbConnection } from "./config/db.js";

import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import attendanceRouter from "./routes/attendanceRoutes.js";
import locationRoute from "./routes/locationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

import Attendance from "./model/Attendance.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

/* 🔥 SOCKET SETUP */
const io = new Server(server, {
  cors: {
    origin: "https://attendance-564p.onrender.com",
    credentials: true
  }
});

app.set("io", io);

const port = process.env.PORT || 8000;

DbConnection();

/* 🔥 MIDDLEWARE */
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: "https://attendance-564p.onrender.com",
    credentials: true,
  })
);

/* 🔥 ROUTES */
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/location", locationRoute);
app.use("/api/messages", messageRoutes);

/* 🔥 SOCKET CONNECTION */
const users = {}; // userId → socketId

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  /* ✅ REGISTER USER */
  socket.on("register", (userId) => {
    users[userId] = socket.id;
    console.log("User registered:", userId);
  });

  /* ✅ SEND MESSAGE */
  socket.on("sendMessage", (data) => {
    const { receiver, sender } = data;

    const receiverSocket = users[receiver];

    // 🔥 SEND MESSAGE TO RECEIVER
    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", data);

      // 🔥 SEND UNREAD NOTIFICATION
      io.to(receiverSocket).emit("newMessageNotification", {
        senderId: sender
      });
    }
  });

  /* ✅ DISCONNECT */
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});

const autoCloseAllAttendance = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const records = await Attendance.find({
      status: "active"
    });

    for (let record of records) {

      // 👉 sirf purane records close karega
      if (record.date !== today) {

        const checkoutTime = new Date(record.checkInTime);
        checkoutTime.setHours(23, 59, 59, 999);

        record.checkOutTime = checkoutTime;
        record.status = "completed";

        await record.save();
      }
    }

    console.log("✅ Auto close old attendance done");

  } catch (err) {
    console.log("❌ Auto close error:", err);
  }
};

/* 🔥 HAR 5 MINUTE ME AUTO FIX */
setInterval(() => {
  autoCloseAllAttendance();
}, 5 * 60 * 1000);


/* 🔥 SERVER START */
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
