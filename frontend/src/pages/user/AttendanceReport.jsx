import React, { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import socket from "../../socket"
import { useNavigate } from "react-router-dom"
import { CalendarDays, Clock, MapPin, TrendingUp, CheckCircle2, Loader2, ChevronRight, AlertCircle } from "lucide-react"
import { serverUrl } from "../../main"

const StatCard = ({ label, value, color }) => (
  <div className={`rounded-2xl p-4 border ${color}`}>
    <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-1">{label}</p>
    <p className="text-2xl font-black leading-none">{value}</p>
  </div>
)

const StatusBadge = ({ checkedOut }) =>
  checkedOut ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-700 whitespace-nowrap">
      <CheckCircle2 size={10} /> Completed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-100 text-amber-700 whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Active
    </span>
  )

function AttendanceReport() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAttendance = async () => {
    try {
      // ✅ today's date
      const today = new Date().toISOString().split("T")[0]

      const res = await axios.get(
        `${serverUrl}/api/attendance/day/${today}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // ✅ filter only current user
      const userData = (res.data.attendance || []).filter(
        item => item.user?._id === user._id
      )

      setAttendance(userData)

    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?._id) fetchAttendance()
  }, [user])

  useEffect(() => {
    socket.on("attendanceMarked", fetchAttendance)
    return () => socket.off("attendanceMarked", fetchAttendance)
  }, [])

  const total = attendance.length
  const completed = attendance.filter(a => a.checkOutTime).length
  const active = attendance.filter(a => !a.checkOutTime).length

  const fmt = (d) => d
    ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null

  const fmtDate = (d) => {
    if (!d) return "—"
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">Records</p>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-none flex items-center gap-2.5">
            <CalendarDays size={24} className="text-blue-500" />
            Today Attendace
          </h2>
        </div>
        <button
          onClick={() => navigate("/user-dashboard/attendance-analytics")}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-blue-200 w-fit"
        >
          Attendance history
          <ChevronRight size={14} />
        </button>
      </div>

      {/* ── Content card ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-700">All Records</p>
          {!loading && <span className="text-xs text-slate-400 font-medium">{total} entries</span>}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 size={28} className="animate-spin text-blue-400" />
            <p className="text-sm font-medium">Loading records…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && attendance.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <AlertCircle size={22} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-500">No attendance records yet</p>
            <p className="text-xs text-slate-400">Your check-in history will appear here</p>
          </div>
        )}

        {!loading && attendance.length > 0 && (
          <>
            {/* ── DESKTOP TABLE ── */}
            <div className="hidden lg:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Date", "Check In", "Check Out", "Address", "Status"].map(h => (
                      <th key={h} className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {attendance.map((item) => {
                    const checkIn = fmt(item.checkInTime)
                    const checkOut = fmt(item.checkOutTime)

                    return (
                      <tr key={item._id} className="hover:bg-blue-50/30 transition-colors duration-150 align-top">
                        <td className="px-5 py-4 font-semibold text-slate-800 text-sm whitespace-nowrap">
                          {fmtDate(item.date || item.checkInTime)}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          {checkIn
                            ? <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm"><Clock size={13} />{checkIn}</div>
                            : <span className="text-slate-300 text-sm">—</span>}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          {checkOut
                            ? <div className="flex items-center gap-1.5 text-red-500 font-semibold text-sm"><Clock size={13} />{checkOut}</div>
                            : <span className="text-slate-300 text-sm">—</span>}
                        </td>

                        <td className="px-5 py-4" style={{ minWidth: "200px", maxWidth: "320px", wordBreak: "break-word" }}>
                          <div className="flex items-start gap-1.5">
                            <MapPin size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-slate-500 leading-relaxed">
                              {item.address || "No address"}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <StatusBadge checkedOut={!!item.checkOutTime} />
                        </td>

                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* ── MOBILE / TABLET CARDS ── */}
            <div className="lg:hidden divide-y divide-slate-100">
              {attendance.map((item) => {
                const checkIn = fmt(item.checkInTime)
                const checkOut = fmt(item.checkOutTime)

                return (
                  <div key={item._id} className="p-4 sm:p-5 space-y-3">

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-800">
                        {fmtDate(item.date || item.checkInTime)}
                      </p>
                      <StatusBadge checkedOut={!!item.checkOutTime} />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-emerald-50 rounded-xl px-3 py-2.5">
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-0.5">Check In</p>
                        <p className="text-sm font-bold text-emerald-700">{checkIn || "—"}</p>
                      </div>

                      <div className="bg-red-50 rounded-xl px-3 py-2.5">
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mb-0.5">Check Out</p>
                        <p className="text-sm font-bold text-red-600">{checkOut || "—"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-slate-50 rounded-xl px-3 py-2.5">
                      <MapPin size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-slate-500 leading-relaxed" style={{ wordBreak: "break-word" }}>
                        {item.address || "No address recorded"}
                      </span>
                    </div>

                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AttendanceReport