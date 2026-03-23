import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { CalendarDays, MapPin, Users, Clock, CheckCircle2, Activity, Search, X } from "lucide-react"
import socket from "../../socket"
import { useNavigate } from "react-router-dom"
import { serverUrl } from "../../main"

/* CACHE */
let cachedAttendance = null

function AdminHome() {
  const [attendance, setAttendance] = useState(cachedAttendance || [])
  const [loading, setLoading] = useState(!cachedAttendance)
  const [refreshing, setRefreshing] = useState(false)
  const [searchName, setSearchName] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const filterRef = useRef(null)
  const navigate = useNavigate()

  const today = new Date().toISOString().split("T")[0]

  const fetchAttendance = async (isRefresh = false) => {
    try {
      if (!isRefresh && cachedAttendance) {
        setAttendance(cachedAttendance)
        setLoading(false)
        return
      }
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const res = await axios.get(`${serverUrl}/api/attendance/all`, { withCredentials: true })
      const data = res.data.attendance || []
      const todayData = data.filter((item) => item.date === today)
      cachedAttendance = todayData
      setAttendance(todayData)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchAttendance() }, [])

  useEffect(() => {
    const handleAttendance = () => fetchAttendance(true)
    socket.off("attendanceMarked")
    socket.on("attendanceMarked", handleAttendance)
    return () => socket.off("attendanceMarked", handleAttendance)
  }, [])

  const filtered = attendance.filter((item) => {
    const matchName = item.user?.name?.toLowerCase().includes(searchName.toLowerCase())
    const matchStatus =
      filterStatus === "all" ? true
      : filterStatus === "active" ? !item.checkOutTime
      : !!item.checkOutTime
    return matchName && matchStatus
  })

  const activeCount = attendance.filter((a) => !a.checkOutTime).length
  const completedCount = attendance.filter((a) => a.checkOutTime).length

  const formatTime = (time) =>
    time ? new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"

  const formattedDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })

  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  const avatarGradients = [
    ["#6366f1", "#3b82f6"],
    ["#10b981", "#14b8a6"],
    ["#f97316", "#f59e0b"],
    ["#ec4899", "#f43f5e"],
    ["#8b5cf6", "#a855f7"],
  ]

  const getGradient = (name = "") => avatarGradients[name.charCodeAt(0) % avatarGradients.length]

  const isFiltering = searchName || filterStatus !== "all"

  const statCards = [
    { label: "Total Present",    value: attendance.length, icon: Users,        grad: ["#6366f1","#3b82f6"], filter: "all" },
    { label: "Currently Active", value: activeCount,        icon: Activity,     grad: ["#f59e0b","#f97316"], filter: "active" },
    { label: "Completed",        value: completedCount,     icon: CheckCircle2, grad: ["#34d399","#14b8a6"], filter: "completed" },
  ]

  /* ── Styles ── */
  const s = {
    page: {
      minHeight: "100%",
      padding: "20px 16px 40px",
      display: "flex",
      flexDirection: "column",
      gap: 24,
      boxSizing: "border-box",
      width: "100%",
    },
    card: {
      background: "#fff",
      borderRadius: 20,
      border: "1px solid #f1f5f9",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    },
  }

  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 14,
                background: "linear-gradient(135deg,#6366f1,#06b6d4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(99,102,241,0.3)", flexShrink: 0,
              }}>
                <CalendarDays size={18} color="#fff" />
              </div>
              <h1 style={{ fontSize: "clamp(17px,4vw,22px)", fontWeight: 800, color: "#1e293b", margin: 0, letterSpacing: "-0.3px" }}>
                Today's Attendance
              </h1>
            </div>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6, marginLeft: 2 }}>{formattedDate}</p>
          </div>

          {/* Day-wise button */}
          <button
            onClick={() => navigate("/admin-dashboard/day-wise-attendance")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 16px", borderRadius: 12, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg,#4f46e5,#3b82f6)",
              color: "#fff", fontSize: 13, fontWeight: 700,
              boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
              whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            <CalendarDays size={14} />
            Day-wise
          </button>
        </div>

        {/* Search bar — full width on mobile */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#fff", border: `1.5px solid ${searchName ? "#a5b4fc" : "#e2e8f0"}`,
          borderRadius: 12, padding: "10px 14px",
          boxShadow: searchName ? "0 0 0 3px rgba(165,180,252,0.2)" : "none",
          transition: "all 0.2s", width: "100%", boxSizing: "border-box",
        }}>
          <Search size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search employee…"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{
              background: "transparent", border: "none", outline: "none",
              fontSize: 13, color: "#334155", width: "100%",
            }}
          />
          {searchName && (
            <button onClick={() => setSearchName("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
              <X size={13} color="#94a3b8" />
            </button>
          )}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
        gap: 12,
      }}>
        {statCards.map(({ label, value, icon: Icon, grad, filter }) => {
          const active = filterStatus === filter
          return (
            <button
              key={label}
              onClick={() => setFilterStatus(filter === filterStatus ? "all" : filter)}
              style={{
                background: "#fff",
                borderRadius: 18,
                border: active ? "1.5px solid #a5b4fc" : "1px solid #f1f5f9",
                boxShadow: active
                  ? "0 0 0 3px rgba(165,180,252,0.2), 0 2px 8px rgba(0,0,0,0.06)"
                  : "0 1px 4px rgba(0,0,0,0.06)",
                padding: "16px 18px",
                display: "flex", alignItems: "center", gap: 14,
                cursor: "pointer", textAlign: "left", width: "100%",
                transition: "all 0.2s",
              }}
            >
              <div style={{
                width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                background: `linear-gradient(135deg,${grad[0]},${grad[1]})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 4px 10px ${grad[0]}44`,
              }}>
                <Icon size={20} color="#fff" />
              </div>
              <div>
                <p style={{ fontSize: "clamp(20px,5vw,26px)", fontWeight: 900, color: "#1e293b", margin: 0, lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 11, color: "#64748b", fontWeight: 600, margin: "4px 0 0" }}>{label}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Table / Cards ── */}
      <div style={{ ...s.card, overflow: "hidden" }}>

        {/* Table header */}
        <div style={{
          padding: "14px 20px", borderBottom: "1px solid #f1f5f9",
          background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Attendance Records</span>
          <span style={{
            fontSize: 11, color: "#94a3b8", background: "#fff",
            border: "1px solid #e2e8f0", padding: "3px 10px", borderRadius: 99,
          }}>
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div style={{ overflowX: "auto", display: "none" }} className="desktop-table">
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                {["Employee", "Email", "Location", "Check In", "Check Out", "Status", "Live"].map((h) => (
                  <th key={h} style={{
                    padding: "14px 20px", fontSize: 10, fontWeight: 700,
                    color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: "60px 20px", textAlign: "center" }}>
                    <LoadingState />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: "60px 20px", textAlign: "center" }}>
                    <EmptyState isFiltering={isFiltering} onClear={() => { setSearchName(""); setFilterStatus("all") }} />
                  </td>
                </tr>
              ) : filtered.map((item) => (
                <tr key={item._id} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8f9ff"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar item={item} getInitials={getInitials} getGradient={getGradient} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{item.user?.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 12, color: "#64748b" }}>{item.user?.email}</td>
                  <td style={{ padding: "14px 20px", minWidth: 180, maxWidth: 240 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                      <MapPin size={12} color="#94a3b8" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, wordBreak: "break-word" }}>{item.address || "—"}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Clock size={12} color="#34d399" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>{formatTime(item.checkInTime)}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Clock size={12} color="#fb7185" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#e11d48" }}>{formatTime(item.checkOutTime)}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <StatusBadge done={!!item.checkOutTime} />
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <button
                      onClick={() => navigate(`/live-map/${item.user._id}`)}
                      style={{
                        background: "#6366f1", color: "#fff", border: "none", cursor: "pointer",
                        fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 8,
                      }}
                    >
                      View Live
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="mobile-cards">
          {loading ? (
            <div style={{ padding: "50px 20px", display: "flex", justifyContent: "center" }}>
              <LoadingState />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "50px 20px" }}>
              <EmptyState isFiltering={isFiltering} onClear={() => { setSearchName(""); setFilterStatus("all") }} />
            </div>
          ) : filtered.map((item) => (
            <div key={item._id} style={{ padding: "16px", borderBottom: "1px solid #f8fafc" }}>
              {/* Top row: avatar + name + status */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <Avatar item={item} getInitials={getInitials} getGradient={getGradient} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1e293b",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.user?.name}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.user?.email}
                    </p>
                  </div>
                </div>
                <StatusBadge done={!!item.checkOutTime} compact />
              </div>

              {/* Check in / out row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "10px 12px" }}>
                  <p style={{ margin: 0, fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>Check In</p>
                  <p style={{ margin: "3px 0 0", fontSize: 14, fontWeight: 800, color: "#059669" }}>{formatTime(item.checkInTime)}</p>
                </div>
                <div style={{ background: "#fff1f2", borderRadius: 12, padding: "10px 12px" }}>
                  <p style={{ margin: 0, fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>Check Out</p>
                  <p style={{ margin: "3px 0 0", fontSize: 14, fontWeight: 800, color: "#e11d48" }}>{formatTime(item.checkOutTime)}</p>
                </div>
              </div>

              {/* Address */}
              {item.address && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 6,
                  background: "#f8fafc", borderRadius: 10, padding: "8px 12px", marginBottom: 10 }}>
                  <MapPin size={11} color="#94a3b8" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, wordBreak: "break-word" }}>{item.address}</span>
                </div>
              )}

              {/* Live button — full width */}
              <button
                onClick={() => navigate(`/live-map/${item.user._id}`)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  background: "linear-gradient(135deg,#6366f1,#3b82f6)", color: "#fff",
                  border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
                  padding: "11px 16px", borderRadius: 12,
                  boxShadow: "0 3px 10px rgba(99,102,241,0.3)",
                }}
              >
                <MapPin size={13} /> View Live Location
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {!loading && attendance.length > 0 && (
          <div style={{
            padding: "12px 20px", borderTop: "1px solid #f1f5f9", background: "#f8fafc",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
          }}>
            <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
              {isFiltering
                ? `${filtered.length} of ${attendance.length} records shown`
                : `${attendance.length} total record${attendance.length !== 1 ? "s" : ""} today`}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#10b981", fontWeight: 700 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", display: "inline-block", animation: "pulse 2s infinite" }} />
              Live
            </div>
          </div>
        )}
      </div>

      {/* Responsive + animation styles */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

        /* Desktop: show table, hide cards */
        @media (min-width: 768px) {
          .desktop-table { display: block !important; }
          .mobile-cards  { display: none !important; }
        }
        /* Mobile: hide table, show cards */
        @media (max-width: 767px) {
          .desktop-table { display: none !important; }
          .mobile-cards  { display: block !important; }
        }
      `}</style>
    </div>
  )
}

/* ── Sub-components ── */

function Avatar({ item, getInitials, getGradient }) {
  const grad = getGradient(item.user?.name)
  return item.image ? (
    <img src={item.image} alt={item.user?.name}
      style={{ width: 40, height: 40, borderRadius: 12, objectFit: "cover", flexShrink: 0, border: "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }} />
  ) : (
    <div style={{
      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
      background: `linear-gradient(135deg,${grad[0]},${grad[1]})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: 13, fontWeight: 700,
      boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
    }}>
      {getInitials(item.user?.name)}
    </div>
  )
}

function StatusBadge({ done, compact }) {
  return done ? (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: compact ? "4px 8px" : "5px 12px",
      borderRadius: 99, fontSize: compact ? 10 : 11, fontWeight: 700,
      background: "#f0fdf4", color: "#059669", border: "1px solid #bbf7d0",
      whiteSpace: "nowrap",
    }}>
      <CheckCircle2 size={10} /> {compact ? "Done" : "Completed"}
    </span>
  ) : (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: compact ? "4px 8px" : "5px 12px",
      borderRadius: 99, fontSize: compact ? 10 : 11, fontWeight: 700,
      background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a",
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", animation: "pulse 2s infinite", display: "inline-block" }} />
      Active
    </span>
  )
}

function LoadingState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: "4px solid #e0e7ff", borderTopColor: "#6366f1",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Loading attendance…</p>
    </div>
  )
}

function EmptyState({ isFiltering, onClear }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CalendarDays size={22} color="#94a3b8" />
      </div>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#475569" }}>
        {isFiltering ? "No matching records" : "No attendance today"}
      </p>
      <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
        {isFiltering ? "Try adjusting your search or filter" : "Records will appear once employees check in"}
      </p>
      {isFiltering && (
        <button onClick={onClear} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 12, color: "#6366f1", fontWeight: 700, textDecoration: "underline", marginTop: 4,
        }}>
          Clear filters
        </button>
      )}
    </div>
  )
}

export default AdminHome