import { useState } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Menu,
  Zap,
 
  Search,
  ChevronDown,
  LogOut,
  X,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useRef } from "react"
import { useEffect } from "react"


/* MENU */

const menu = [
  {
    name: "Dashboard",
    path: "/admin-dashboard",
    icon: LayoutDashboard,
    description: "Overview & stats",
  },
  {
    name: "Attendance",
    path: "/admin-dashboard/attendance",
    icon: CalendarCheck,
    description: "Daily records",
  },
  {
    name: "Employees",
    path: "/admin-dashboard/employees",
    icon: Users,
    description: "Team members",
  },
]

/* AVATAR */

const avatarColors = [
  "from-indigo-500 to-blue-500",
  "from-emerald-500 to-teal-400",
  "from-orange-400 to-amber-500",
  "from-pink-500 to-rose-400",
]

const getColor = (name = "") =>
  avatarColors[name.charCodeAt(0) % avatarColors.length]

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

/* DASHBOARD */

function AdminDashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const profileRef = useRef()

   const { user, logout } = useAuth()

  const notifications = [
    { id: 1, text: "New employee registered", time: "2m ago", unread: true },
    { id: 2, text: "Attendance updated", time: "10m ago", unread: true },
    { id: 3, text: "Backup completed", time: "1h ago", unread: false },
  ]

  const unreadCount = notifications.filter((n) => n.unread).length

  const navigate = useNavigate()
   const handleLogout = async () => {

    try {

      await logout()

      navigate("/", { replace: true })

    } catch (error) {

      console.log("Logout error:", error)

    }

  }

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setProfileOpen(false)
    }
  }

  document.addEventListener("mousedown", handleClickOutside)

  return () => {
    document.removeEventListener("mousedown", handleClickOutside)
  }
}, [])


  return (

    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`
          fixed lg:relative z-30 flex flex-col h-full
          bg-[#0d1117] text-white
          transition-all duration-300 ease-in-out
          
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          
          lg:translate-x-0
          w-64
        `}
      >

        {/* LOGO */}

        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">

          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
            <Zap size={16} />
          </div>

          <p className="font-bold">
            Admin<span className="text-indigo-400">Panel</span>
          </p>

          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden"
          >
            <X size={18} />
          </button>

        </div>

        {/* MENU */}

        <nav className="flex-1 px-3 py-4 space-y-2">

          {menu.map(({ name, path, icon: Icon, description }) => (

            <NavLink
              key={name}
              to={path}
              end={path === "/admin-dashboard"}
              onClick={() => {
                if (window.innerWidth < 1024) setSidebarOpen(false)
              }}
              className={({ isActive }) => `
              
              flex items-center gap-3 px-3 py-3 rounded-xl
              transition
              
              ${
                isActive
                  ? "bg-indigo-500/20 text-white"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
              }
              
              `}
            >

              <Icon size={18} />

              <div>

                <p className="text-sm font-semibold">
                  {name}
                </p>

                <p className="text-xs text-gray-500">
                  {description}
                </p>

              </div>

            </NavLink>

          ))}

        </nav>

        {/* USER */}

        <div className="px-4 py-4 border-t border-white/10">

          <div className="flex items-center gap-3">

            <div
              className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getColor(
                user?.name
              )} flex items-center justify-center text-xs font-bold`}
            >
              {getInitials(user?.name)}
            </div>

            <div>

              <p className="text-sm font-semibold">
                {user?.name || "Admin"}
              </p>

              <p className="text-xs text-gray-400">
                Super Admin
              </p>

            </div>

          </div>

        </div>

      </aside>

      {/* MAIN */}

      <div className="flex flex-col flex-1">

        {/* HEADER */}

        <header className="h-16 bg-white border-b flex items-center justify-between px-4">

          <div className="flex items-center gap-3">

            {/* MENU BUTTON */}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center lg:hidden"
            >
              <Menu size={18} />
            </button>

            {/* SEARCH */}

          

          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-4">

            {/* NOTIFICATION */}

            <div className="relative">

            

            </div>

            {/* PROFILE */}

            <div  ref={profileRef} className="relative">

              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2"
              >

                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getColor(
                    user?.name
                  )} flex items-center justify-center text-white text-xs`}
                >
                  {getInitials(user?.name)}
                </div>

                <ChevronDown size={16} />

              </button>

             {profileOpen && (
                    <div className="absolute right-0 top-12 w-48 bg-white/90 backdrop-blur-md shadow-xl rounded-2xl border border-slate-100 overflow-hidden animate-dropdown">

                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-800">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {user?.email || "user@email.com"}
                        </p>
                      </div>

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left flex items-center gap-3 text-sm text-red-500 hover:bg-red-50 transition-all duration-200 group"
                      >
                        <div className="p-1.5 rounded-lg bg-red-100 group-hover:bg-red-200 transition">
                          <LogOut size={14} />
                        </div>
                        <span className="font-medium">Logout</span>
                      </button>

                    </div>
                  )}

            </div>

          </div>

        </header>

        {/* CONTENT */}

        <main className="flex-1 overflow-y-auto p-6">

          <Outlet />

        </main>

      </div>

    </div>

  )

}

export default AdminDashboard