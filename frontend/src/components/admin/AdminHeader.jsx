import { useAuth } from "../../context/AuthContext"
import { Menu } from "lucide-react"

function AdminHeader({setSidebarOpen}) {

const {user} = useAuth()

return (

<header className="h-16 bg-white shadow flex items-center justify-between px-8">

<button
onClick={()=>setSidebarOpen(prev=>!prev)}
className="text-gray-600"
>
<Menu size={22}/>
</button>

<div className="flex items-center gap-3">

<div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
{user?.name?.charAt(0)}
</div>

<p className="font-semibold">{user?.name}</p>

</div>

</header>

)

}

export default AdminHeader