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
    origin: [
      "http://localhost:5173",
      "https://your-frontend-url.vercel.app"
    ],
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
    origin: [
      "http://localhost:5173",
      "https://your-frontend-url.vercel.app"
    ],
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

/* 🔥 AUTO CHECKOUT LOGIC */
setInterval(async () => {
  try {
    const now = new Date();

    if (now.getHours() === 23 && now.getMinutes() === 59) {

      const today = new Date().toISOString().split("T")[0];

      const records = await Attendance.find({
        date: today,
        checkOutTime: null,
      });

      for (const record of records) {
        record.checkOutTime = new Date();
        await record.save();
      }

      console.log("Auto checkout executed");
    }

  } catch (error) {
    console.log("Auto checkout error:", error);
  }
}, 60000);

/* 🔥 SERVER START */
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
