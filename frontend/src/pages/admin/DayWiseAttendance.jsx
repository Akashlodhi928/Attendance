import { useState, useEffect } from "react"
import axios from "axios"
import { CalendarDays, MapPin, Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { serverUrl } from "../../main"

function DayWiseAttendance() {
  const today = new Date().toISOString().split("T")[0]

  const [date, setDate] = useState(today)
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const fetchAttendance = async (selectedDate) => {
    try {
      setLoading(true)
      const res = await axios.get(
        `${serverUrl}/api/attendance/day/${selectedDate}`,
        { withCredentials: true }
      )
      setAttendance(res.data.attendance || [])
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAttendance(today) }, [])

  const handleDateChange = (e) => {
    setDate(e.target.value)
    fetchAttendance(e.target.value)
  }

  const shiftDay = (dir) => {
    const d = new Date(date)
    d.setDate(d.getDate() + dir)
    const newDate = d.toISOString().split("T")[0]
    setDate(newDate)
    fetchAttendance(newDate)
  }

  const isToday = date === today

  const formatTime = (t) =>
    t ? new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null

  const fmtDateLabel = (d) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric"
    })

  const completedCount = attendance.filter(a => a.checkOutTime).length
  const activeCount = attendance.filter(a => !a.checkOutTime).length

  const getInitials = (name = "") =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  const avatarColors = [
    "from-indigo-500 to-blue-500",
    "from-emerald-500 to-teal-400",
    "from-orange-400 to-amber-500",
    "from-pink-500 to-rose-400",
    "from-violet-500 to-purple-500",
  ]
  const getColor = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-10">

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

      {/* ══ HEADER ══ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
            <CalendarDays size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-none">Day-wise Attendance</h2>
            <p className="text-xs text-slate-400 mt-1">{fmtDateLabel(date)}</p>
          </div>
        </div>

        {/* Date navigator */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
        

          <div className="flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 rounded-xl px-3 py-2 transition-all duration-200 shadow-sm">
            <CalendarDays size={14} className="text-indigo-400 flex-shrink-0" />
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              max={today}
              className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer"
            />
          </div>

    

          {!isToday && (
            <button
              onClick={() => { setDate(today); fetchAttendance(today) }}
              className="px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors whitespace-nowrap"
            >
              Today
            </button>
          )}
        </div>
      </div>

  

      {/* ══ TABLE CARD ══ */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-700">Attendance Records</p>
          {!loading && (
            <span className="text-xs text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full font-medium">
              {attendance.length} record{attendance.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-9 h-9 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Loading attendance…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && attendance.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <AlertCircle size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-semibold">No attendance found</p>
            <p className="text-sm text-slate-400">No employees checked in on this day</p>
          </div>
        )}

        {!loading && attendance.length > 0 && (
          <>
            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {["Employee", "Email", "Check In", "Check Out", "Location", "Status"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {attendance.map((item) => {
                    const checkIn = formatTime(item.checkInTime)
                    const checkOut = formatTime(item.checkOutTime)
                    return (
                      <tr key={item._id} className="group hover:bg-indigo-50/30 transition-colors duration-150 align-top">

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img src={item.image} alt={item.user?.name} className="w-9 h-9 rounded-xl object-cover ring-2 ring-white shadow-sm flex-shrink-0" />
                            ) : (
                              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getColor(item.user?.name)} flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0`}>
                                {getInitials(item.user?.name)}
                              </div>
                            )}
                            <span className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors whitespace-nowrap">
                              {item.user?.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">
                          {item.user?.email}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          {checkIn
                            ? <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm"><Clock size={13} />{checkIn}</div>
                            : <span className="text-slate-300">—</span>}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          {checkOut
                            ? <div className="flex items-center gap-1.5 text-rose-500 font-semibold text-sm"><Clock size={13} />{checkOut}</div>
                            : <span className="text-slate-300">—</span>}
                        </td>

                        <td className="px-5 py-4" style={{ minWidth: "180px", maxWidth: "260px", wordBreak: "break-word" }}>
                          <div className="flex items-start gap-1.5">
                            <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
                            <span className="text-xs text-slate-500 leading-relaxed">{item.address || "—"}</span>
                          </div>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          {item.checkOutTime ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 size={11} /> Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Active
                            </span>
                          )}
                        </td>

                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden divide-y divide-slate-100">
              {attendance.map((item) => {
                const checkIn = formatTime(item.checkInTime)
                const checkOut = formatTime(item.checkOutTime)
                return (
                  <div key={item._id} className="p-4 sm:p-5 space-y-3 hover:bg-slate-50/80 transition-colors">

                    {/* Name + status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image ? (
                          <img src={item.image} alt={item.user?.name} className="w-10 h-10 rounded-2xl object-cover flex-shrink-0" />
                        ) : (
                          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${getColor(item.user?.name)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                            {getInitials(item.user?.name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate">{item.user?.name}</p>
                          <p className="text-xs text-slate-400 truncate">{item.user?.email}</p>
                        </div>
                      </div>
                      {item.checkOutTime ? (
                        <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={10} /> Done
                        </span>
                      ) : (
                        <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Active
                        </span>
                      )}
                    </div>

                    {/* Times */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-emerald-50 rounded-xl px-3 py-2.5">
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-0.5">Check In</p>
                        <p className="text-sm font-bold text-emerald-700">{checkIn || "—"}</p>
                      </div>
                      <div className="bg-rose-50 rounded-xl px-3 py-2.5">
                        <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider mb-0.5">Check Out</p>
                        <p className="text-sm font-bold text-rose-600">{checkOut || "—"}</p>
                      </div>
                    </div>

                    {/* Address */}
                    {item.address && (
                      <div className="flex items-start gap-2 bg-slate-50 rounded-xl px-3 py-2.5">
                        <MapPin size={13} className="mt-0.5 shrink-0 text-slate-400" />
                        <span className="text-xs text-slate-500 leading-relaxed" style={{ wordBreak: "break-word" }}>
                          {item.address}
                        </span>
                      </div>
                    )}

                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Footer */}
        {!loading && attendance.length > 0 && (
          <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium">
              {attendance.length} employee{attendance.length !== 1 ? "s" : ""} present on{" "}
              {new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{completedCount} done
              </span>
              <span className="text-amber-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />{activeCount} active
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default DayWiseAttendance