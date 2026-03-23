  import { Link,useLocation } from "react-router-dom"
  import {
    LayoutDashboard,
    Users,
    CalendarCheck
  } from "lucide-react"

  function AdminSidebar({sidebarOpen}) {

  const location = useLocation()

  const menu = [

  {
  name:"Dashboard",
  path:"/admin-dashboard",
  icon:<LayoutDashboard size={20}/>
  },

  {
  name:"Attendance",
  path:"/admin-dashboard/attendance",
  icon:<CalendarCheck size={20}/>
  },

  {
  name:"Employees",
  path:"/admin-dashboard/employees",
  icon:<Users size={20}/>
  }

  ]

  return (

  <aside className={`${sidebarOpen?"w-64":"w-20"} bg-slate-900 text-white transition`}>

  <div className="p-6 font-bold text-lg">
  Admin Panel
  </div>

  <nav className="px-3 space-y-2">

  {menu.map(item=>(

  <Link
  key={item.name}
  to={item.path}
  className={`flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800
  ${location.pathname===item.path?"bg-blue-600":""}`}
  >

  {item.icon}

  <span className={`${sidebarOpen?"block":"hidden"}`}>
  {item.name}
  </span>

  </Link>

  ))}

  </nav>

  </aside>

  )

  }

  export default AdminSidebar