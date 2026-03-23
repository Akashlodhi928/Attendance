import express from "express";
import { checkIn, checkOut, fetchAttendanceHistory, fetchTodayAttendance, getAdminDashboard, getAllAttendance, getAttendanceByDate,  } from "../controllers/attendanceController.js";
import { isAuth } from "../middleware/authMiddleware.js";

const attendanceRouter = express.Router();

attendanceRouter.post("/checkin", checkIn);
attendanceRouter.post("/checkout", checkOut);
attendanceRouter.get("/today/:userId", fetchTodayAttendance);
attendanceRouter.get("/history/:userId", fetchAttendanceHistory)
attendanceRouter.get("/all", getAllAttendance);
attendanceRouter.get("/admin-dashboard", isAuth, getAdminDashboard);
attendanceRouter.get("/day/:date", getAttendanceByDate)

export default attendanceRouter;