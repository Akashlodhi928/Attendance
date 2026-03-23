import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  UserCircle,
  CalendarCheck,
  LogOut,
  ChevronDown,
  Menu,
  X,
  MessagesSquare,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // mobile: always starts CLOSED
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [collapsed, setCollapsed] = useState(false); // desktop only

  const profileRef = useRef(null);

  /* ── SCREEN SIZE DETECT ── */
  useEffect(() => {
    const checkSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // On desktop → sidebar always visible; on mobile → always starts closed
      if (!mobile) setIsSidebarOpen(false); // reset mobile state when going desktop
    };
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  /* ── CLOSE PROFILE DROPDOWN ON OUTSIDE CLICK ── */
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ── CLOSE SIDEBAR ON ROUTE CHANGE (MOBILE) ── */
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  /* ── PREVENT BODY SCROLL WHEN MOBILE SIDEBAR IS OPEN ── */
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, isSidebarOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { name: "Dashboard",  path: "/user-dashboard",              icon: LayoutDashboard },
    { name: "Attendance", path: "/user-dashboard/attendance",   icon: CalendarCheck },
    { name: "My Account", path: "/user-dashboard/account",      icon: UserCircle },
    { name: "Chat",       path: "/user-dashboard/chat",         icon: MessagesSquare, },
  ];

  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  // ── sidebar width logic
  const desktopWidth  = collapsed ? "w-[72px]" : "w-64";
  const currentPageName = navItems.find((item) => isActive(item.path))?.name || "Dashboard";

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">

      {/* ══════════════════════════════
          MOBILE OVERLAY (behind sidebar)
      ══════════════════════════════ */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ══════════════════════════════
          SIDEBAR
      ══════════════════════════════ */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800
          border-r border-slate-700/50
          transition-all duration-300 ease-in-out
          ${isMobile
            ? `w-72 ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`
            : `${desktopWidth} translate-x-0 relative`
          }
        `}
      >

        {/* ── LOGO ROW ── */}
        <div className={`flex items-center border-b border-slate-700/50 h-16 px-4 shrink-0 ${collapsed && !isMobile ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-3 min-w-0">
           
            {(!collapsed || isMobile) && (
              <span className="text-white font-bold text-base tracking-tight truncate">UserPanel</span>
            )}
          </div>

          {/* Close X on mobile */}
          {isMobile ? (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              <X size={18} />
            </button>
          ) : (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          )}
        </div>

        {/* ── USER CARD ── */}
        {(!collapsed || isMobile) && (
          <div className="mx-3 mt-4 mb-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ring-blue-500/30">
                {user?.avatar
                  ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : getInitials(user?.name)
                }
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* collapsed avatar */}
        {collapsed && !isMobile && (
          <div className="flex justify-center mt-4 mb-2 shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-blue-500/30">
              {user?.avatar
                ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                : getInitials(user?.name)
              }
            </div>
          </div>
        )}

        {/* ── NAV ITEMS ── */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150 relative group
                  ${collapsed && !isMobile ? "justify-center" : ""}
                  ${active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                  }
                `}
                title={collapsed && !isMobile ? item.name : undefined}
              >
                <div className="relative shrink-0">
                  <Icon size={18} />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>

                {(!collapsed || isMobile) && (
                  <span className="truncate">{item.name}</span>
                )}

                {/* active indicator bar */}
                {active && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-white/40" />
                )}

                {/* tooltip for collapsed desktop */}
                {collapsed && !isMobile && (
                  <span className="absolute left-full ml-3 px-2 py-1 bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── LOGOUT ── */}
        <div className={`p-3 border-t border-slate-700/50 shrink-0 ${collapsed && !isMobile ? "flex justify-center" : ""}`}>
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-all
              ${collapsed && !isMobile ? "justify-center w-10" : "w-full"}
            `}
            title={collapsed && !isMobile ? "Logout" : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {(!collapsed || isMobile) && "Logout"}
          </button>
        </div>

      </aside>

      {/* ══════════════════════════════
          MAIN AREA
      ══════════════════════════════ */}
      <div className={`
        flex flex-col flex-1 overflow-hidden
        transition-all duration-300
       
      `}>

        {/* ── TOPBAR ── */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-10">

          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <Menu size={20} />
              </button>
            )}

            <div>
              <h1 className="font-semibold text-slate-800 text-base leading-tight">{currentPageName}</h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">

            {/* PROFILE DROPDOWN */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {user?.avatar
                    ? <img src={user.avatar} alt="profile" className="w-full h-full object-cover" />
                    : getInitials(user?.name)
                  }
                </div>
                <span className="hidden md:block text-sm font-medium text-slate-700">
                  {user?.name?.split(" ")[0]}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* DROPDOWN MENU */}
              {isProfileOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[9999]"
                  style={{ animation: "dropIn 0.15s ease both" }}>
                  {/* User info */}
                  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {user?.avatar
                        ? <img src={user.avatar} alt="profile" className="w-full h-full object-cover" />
                        : getInitials(user?.name)
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5">
                    <Link
                      to="/user-dashboard/account"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <UserCircle size={15} className="text-slate-400" />
                      My Account
                    </Link>
                  </div>

                  <div className="p-1.5 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 w-full transition-colors"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100">
          <Outlet />
        </main>

      </div>

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  );
}

export default UserDashboard;