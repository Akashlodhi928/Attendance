import { useEffect, useState } from "react"
import axios from "axios"
import { Search, Users, Mail } from "lucide-react"
import { toast } from "react-toastify"
import { serverUrl } from "../../main"

/* CACHE */
let cachedEmployees = null

function Employees() {

  const [users, setUsers] = useState(cachedEmployees || [])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(!cachedEmployees)

  const [currentUser, setCurrentUser] = useState(null)

  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  /* FETCH USERS */
  const fetchUsers = async () => {
    try {
      if (cachedEmployees) {
        setUsers(cachedEmployees)
        setLoading(false)
        return
      }

      const res = await axios.get(
        `${serverUrl}/api/user/all-user`,
        { withCredentials: true }
      )

      cachedEmployees = res.data.users
      setUsers(res.data.users)

    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  /* FETCH CURRENT USER */
  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/user/current-user`,
        { withCredentials: true }
      )
      setCurrentUser(res.data.user)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchCurrentUser()
  }, [])

  /* OPEN MODAL */
  const openDeleteModal = (user) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  /* DELETE USER */
  const confirmDelete = async () => {
    try {

      await axios.delete(
        `${serverUrl}/api/user/delete-user/${selectedUser._id}`,
        { withCredentials: true }
      )

      toast.success("Deleted")
      const updatedUsers = users.filter(u => u._id !== selectedUser._id)
      setUsers(updatedUsers)
      cachedEmployees = updatedUsers

      setShowModal(false)

    } catch (error) {
      console.log(error)
      toast.error(
      error?.response?.data?.message || "Something went wrong"
    )
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  )

  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  const colors = [
    "from-purple-500 to-indigo-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-pink-500 to-rose-500",
  ]

  const getColor = (name = "") =>
    colors[name.charCodeAt(0) % colors.length]

  return (
    <div className="min-h-full p-4 sm:p-6 bg-slate-50">

      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow">
            <Users className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Employees</h1>
            <p className="text-sm text-slate-500">{users.length} members</p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 sm:py-3 rounded-xl border bg-white shadow-sm focus:ring-2 focus:ring-indigo-200 outline-none"
          />
        </div>

        {/* USERS */}
        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map(user => (
              <div
                key={user._id}
                className="flex items-center justify-between bg-white p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition"
              >

                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover" />
                  ) : (
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${getColor(user.name)} flex items-center justify-center text-white font-bold`}>
                      {getInitials(user.name)}
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-slate-800 text-sm sm:text-base">{user.name}</p>
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                      <Mail size={12} />
                      {user.email}
                    </div>
                  </div>
                </div>

                {currentUser?.role === "admin" && (
                  <button
                    onClick={() => openDeleteModal(user)}
                    className="px-3 sm:px-4 py-1.5 rounded-lg bg-red-500 text-white text-xs sm:text-sm hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                )}

              </div>
            ))}
          </div>
        )}

      </div>

      {/* ✅ FIXED MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-sm bg-white rounded-2xl p-5 sm:p-6 shadow-xl animate-fadeIn">

            <h2 className="text-base sm:text-lg font-semibold text-slate-800">
              Delete User?
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedUser?.name}</span>?
            </p>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default Employees