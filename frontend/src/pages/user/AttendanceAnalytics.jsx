import React, { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import { CalendarDays, Clock, MapPin, CheckCircle2, Loader2, AlertCircle, Search, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { serverUrl } from "../../main"

/* CACHE */
let cachedAttendanceHistory = null

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

function AttendanceHistory() {

  const { user, token } = useAuth()

  const [attendance, setAttendance] = useState(cachedAttendanceHistory || [])
  const [loading, setLoading] = useState(!cachedAttendanceHistory)
  const [searchDate, setSearchDate] = useState("")
  const navigate = useNavigate()

  const fetchAttendance = async (force = false) => {

    try {

      /* USE CACHE */
      if (!force && cachedAttendanceHistory) {
        setAttendance(cachedAttendanceHistory)
        setLoading(false)
        return
      }

      setLoading(true)

      const res = await axios.get(
        `${serverUrl}/api/attendance/history/${user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const data = res.data.attendance || []

      cachedAttendanceHistory = data
      setAttendance(data)

    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }

  }

  useEffect(() => {
    if (user?._id) {
      fetchAttendance()
    }
  }, [user])

  const fmt = (d) =>
    d
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

  /* ── Filter by date ── */
  const filtered = searchDate
    ? attendance.filter((item) => {
        const d = new Date(item.checkInTime || item.date)
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, "0")
        const day = String(d.getDate()).padStart(2, "0")
        return `${y}-${m}-${day}` === searchDate
      })
    : attendance

  const total = attendance.length
  const completed = attendance.filter(a => a.checkOutTime).length
  const active = attendance.filter(a => !a.checkOutTime).length


  return (
    <div className="space-y-6 pb-8">

         <button
  onClick={() => navigate(-1)}
  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 
             px-5 py-2 rounded-lg text-white font-medium 
             shadow-md hover:shadow-lg 
             hover:scale-105 active:scale-95 
             transition-all duration-200"
>
  ← Back
</button>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-none flex items-center gap-2.5">
            <CalendarDays size={24} className="text-blue-500" />
            Attendance History
          </h2>
        </div>
      </div>


      {/* ── Content ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Card header + search bar */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-700">All Records</p>
            {!loading && (
              <p className="text-xs text-slate-400 mt-0.5">
                {searchDate
                  ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for ${fmtDate(searchDate + "T00:00:00")}`
                  : `${total} total entries`
                }
              </p>
            )}
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-auto">
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 hover:border-blue-300 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200 w-full sm:w-56">
              <Search size={14} className="text-slate-400 flex-shrink-0" />
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-700 font-medium outline-none placeholder:text-slate-400 cursor-pointer min-w-0"
              />
              {searchDate && (
                <button
                  onClick={() => setSearchDate("")}
                  className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-300 hover:bg-red-400 flex items-center justify-center transition-colors duration-200"
                >
                  <X size={11} className="text-white" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 size={28} className="animate-spin text-blue-400" />
            <p className="text-sm font-medium">Loading records…</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
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
                  {filtered.map((item) => {
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
                              {item.address || "No location"}
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
              {filtered.map((item) => {
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
                        {item.address || "No location recorded"}
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

export default AttendanceHistory