import { useEffect, useState } from "react"
import axios from "axios"
import socket from "../../socket"
import {
  Trophy,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react"
import { serverUrl } from "../../main"

/* MEMORY CACHE */
let cachedUsers = null

function AdminAttendance() {

  const [users, setUsers] = useState(cachedUsers || [])
  const [selectedUser, setSelectedUser] = useState(cachedUsers ? cachedUsers[0] : null)
  const [loading, setLoading] = useState(!cachedUsers)

  const fetchDashboard = async () => {
    try {

      /* USE CACHE FIRST */
      if (cachedUsers) {
        setUsers(cachedUsers)
        setSelectedUser(prev => prev || cachedUsers[0])
        setLoading(false)
        return
      }

      setLoading(true)

      const res = await axios.get(
        `${serverUrl}/api/attendance/admin-dashboard`,
        { withCredentials: true }
      )

      const usersData = res.data.users || []

      cachedUsers = usersData

      setUsers(usersData)
      setSelectedUser(prev => prev || usersData[0])

    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  /* INITIAL LOAD */
  useEffect(() => {
    if (!cachedUsers) {
      fetchDashboard()
    }
  }, [])

  /* SOCKET UPDATE */
  useEffect(() => {

    const handleAttendance = async () => {

      const res = await axios.get(
        `${serverUrl}/api/attendance/admin-dashboard`,
        { withCredentials: true }
      )

      const usersData = res.data.users || []

      cachedUsers = usersData

      setUsers(usersData)
      setSelectedUser(prev => prev || usersData[0])
    }

    socket.off("attendanceMarked")
    socket.on("attendanceMarked", handleAttendance)

    return () => socket.off("attendanceMarked", handleAttendance)

  }, [])

  /* ── Helpers ── */

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const monthName = now.toLocaleString("default", { month: "long" })
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const getInitials = (name = "") =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  const avatarColors = [
    "from-indigo-500 to-blue-500",
    "from-emerald-500 to-teal-400",
    "from-orange-400 to-amber-500",
    "from-pink-500 to-rose-400",
    "from-violet-500 to-purple-500",
  ]

  const getColor = (name = "") =>
    avatarColors[name.charCodeAt(0) % avatarColors.length]

  const getPresentDates = (user) => {
    if (!user?.records) return new Set()
    return new Set(
      user.records
        .map((r) => {
          const d = new Date(r.checkInTime)
          if (d.getMonth() === month && d.getFullYear() === year)
            return d.getDate()
          return null
        })
        .filter(Boolean)
    )
  }

  const presentDates = getPresentDates(selectedUser)

  const attendanceRate =
    selectedUser && now.getDate() > 0
      ? Math.round((selectedUser.present / now.getDate()) * 100)
      : 0

  const getRankBadge = (index) => {
    if (index === 0) return { emoji: "🥇", color: "text-amber-500 bg-amber-50 border-amber-200" }
    if (index === 1) return { emoji: "🥈", color: "text-slate-500 bg-slate-50 border-slate-200" }
    if (index === 2) return { emoji: "🥉", color: "text-orange-500 bg-orange-50 border-orange-200" }
    return { emoji: `#${index + 1}`, color: "text-slate-400 bg-slate-50 border-slate-200" }
  }

  /* CALENDAR */
  const renderCalendar = () => {

    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
    const blanks = Array.from({ length: firstDayOfMonth })
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    return (
      <div>

        <div className="grid grid-cols-7 mb-2">
          {days.map((d)=>(
            <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {blanks.map((_,i)=><div key={i}/> )}

          {daysArray.map(day=>{

            const isPresent = presentDates.has(day)
            const isPast = day < now.getDate()
            const isToday = day === now.getDate()
            const isFuture = day > now.getDate()

            let cellStyle=""
            let icon=null

            if(isToday){
              cellStyle = isPresent
                ? "bg-indigo-500 text-white shadow-lg scale-110"
                : "bg-indigo-100 text-indigo-600 border-2 border-indigo-400 scale-110"
            }
            else if(isPresent){
              cellStyle="bg-emerald-50 border border-emerald-300 text-emerald-700"
              icon=<CheckCircle2 size={8}/>
            }
            else if(isPast){
              cellStyle="bg-red-50 border border-red-200 text-red-400"
              icon=<XCircle size={8}/>
            }
            else{
              cellStyle="bg-slate-50 border border-slate-100 text-slate-300"
            }

            return(
              <div key={day}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-semibold ${cellStyle}`}>
                <span>{day}</span>
                {icon && <span className="absolute bottom-1">{icon}</span>}
              </div>
            )

          })}
        </div>

      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading attendance data…</p>
      </div>
    )
  }

 return (
    <div className="p-4 md:p-6 lg:p-8 min-h-full space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-200">
            <CalendarDays size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Attendance</h1>
            <p className="text-xs text-slate-400 mt-0.5">{monthName} {year}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-700">Live Sync</span>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Employee Ranking ── */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" />
              <span className="text-sm font-bold text-slate-700">Leaderboard</span>
            </div>
            <span className="text-xs text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
              {users.length} employees
            </span>
          </div>

          <div className="divide-y divide-slate-50 max-h-[520px] overflow-y-auto">
            {users.map((u, i) => {
              const active = selectedUser?.user?._id === u.user._id
              const rank = getRankBadge(i)
              return (
                <button
                  key={i}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 transition-all duration-200 text-left
                    ${active ? "bg-indigo-50/80" : "hover:bg-slate-50"}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank */}
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-lg border shrink-0 ${rank.color}`}>
                      {rank.emoji}
                    </span>

                    {/* Avatar */}
                    {u.user?.profileImage ? (
                      <img
                        src={u.user.profileImage}
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-white shadow-sm shrink-0"
                        alt={u.user.name}
                      />
                    ) : (
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getColor(u.user?.name)} flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0`}>
                        {getInitials(u.user?.name)}
                      </div>
                    )}

                    {/* Info */}
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate transition-colors ${active ? "text-indigo-700" : "text-slate-800"}`}>
                        {u.user?.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{u.user?.email}</p>
                    </div>
                  </div>

                  {/* Days badge */}
                  <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full transition-colors
                    ${active ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-600"}`}>
                    {u.present}d
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── RIGHT: Detail Panel ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Employee Summary Card */}
          {selectedUser && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">

                {/* Avatar */}
                <div className="relative shrink-0">
                  {selectedUser.user?.profileImage ? (
                    <img
                      src={selectedUser.user.profileImage}
                      className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md"
                      alt={selectedUser.user.name}
                    />
                  ) : (
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getColor(selectedUser.user?.name)} flex items-center justify-center text-white text-2xl font-bold shadow-md`}>
                      {getInitials(selectedUser.user?.name)}
                    </div>
                  )}
                  <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white shadow-sm" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-slate-800 truncate">
                    {selectedUser.user?.name}
                  </h2>
                  <p className="text-sm text-slate-400 mt-0.5 truncate">
                    {selectedUser.user?.email}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-500 font-medium">Monthly Attendance Rate</span>
                      <span className="text-xs font-bold text-indigo-600">{attendanceRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-700"
                        style={{ width: `${attendanceRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stat pills */}
                <div className="flex sm:flex-col gap-3 shrink-0">
                  {[
                    { label: "Present", value: selectedUser.present, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
                    { label: "Absent", value: now.getDate() - selectedUser.present, icon: XCircle, color: "text-red-500 bg-red-50 border-red-200" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${color}`}>
                      <Icon size={15} />
                      <div>
                        <p className="text-xs font-medium opacity-70">{label}</p>
                        <p className="text-sm font-bold leading-none">{value} days</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Calendar Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-indigo-500" />
                <h2 className="text-base font-bold text-slate-800">
                  {monthName} Calendar
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-slate-400" />
                <span className="text-xs text-slate-400 font-medium">
                  {selectedUser?.user?.name?.split(" ")[0]}
                </span>
              </div>
            </div>
            {selectedUser ? renderCalendar() : (
              <p className="text-center text-slate-400 text-sm py-10">Select an employee to view calendar</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAttendance

