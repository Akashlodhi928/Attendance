import { useEffect, useState, useRef } from "react"
import axios from "axios"
import socket from "../../socket"
import { useAuth } from "../../context/AuthContext"
import { MessageSquare, Send, Search } from "lucide-react"
import { serverUrl } from "../../main"

const avatarColors = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
]

const getColor = (name = "") =>
  avatarColors[name.charCodeAt(0) % avatarColors.length]

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

function Avatar({ user, size = "md" }) {
  const sizeClass = size === "lg" ? "w-10 h-10 text-sm" : "w-9 h-9 text-xs"
  const radiusClass = size === "lg" ? "rounded-2xl" : "rounded-xl"

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`${sizeClass} ${radiusClass} object-cover ring-2 ring-white shadow-sm shrink-0`}
      />
    )
  }
  return (
    <div
      className={`${sizeClass} ${radiusClass} bg-gradient-to-br ${getColor(user?.name)} flex items-center justify-center text-white font-bold shadow-sm shrink-0`}
    >
      {getInitials(user?.name)}
    </div>
  )
}

function Chat() {
  const { user } = useAuth()

  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [unread, setUnread] = useState({})
  const [search, setSearch] = useState("")
  const [showSidebar, setShowSidebar] = useState(true)

  const bottomRef = useRef(null)

  /* 🔥 SOCKET REGISTER */
  useEffect(() => {
    if (user?._id) socket.emit("register", user._id)
  }, [user])

  /* 🔥 GET USERS */
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get(`${serverUrl}/api/user/all-user`, {
        withCredentials: true,
      })
      const allUsers = res.data.users || res.data
      setUsers(allUsers.filter((u) => u._id !== user._id))
    }
    if (user?._id) fetchUsers()
  }, [user])

  /* 🔥 GET UNREAD COUNTS */
  const fetchUnread = async () => {
    const res = await axios.get(
      `${serverUrl}/api/messages/unread/${user._id}`
    )
    const obj = {}
    res.data.forEach((i) => (obj[i._id] = i.count))
    setUnread(obj)
  }

  useEffect(() => {
    if (user?._id) fetchUnread()
  }, [user])

  /* 🔥 LOAD CHAT + MARK SEEN */
  useEffect(() => {
    if (!selectedUser) return
    const fetchMessages = async () => {
      const res = await axios.get(
        `${serverUrl}/api/messages/${user._id}/${selectedUser._id}`
      )
      setMessages(res.data)
      await axios.post(`${serverUrl}/api/messages/seen`, {
        senderId: selectedUser._id,
        receiverId: user._id,
      })
      fetchUnread()
    }
    fetchMessages()
  }, [selectedUser])

  /* 🔥 SOCKET */
  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      if (
        msg.sender === selectedUser?._id ||
        msg.receiver === selectedUser?._id
      ) {
        setMessages((prev) => [...prev, msg])
      }
    })
    socket.on("newMessageNotification", ({ senderId }) => {
      if (selectedUser?._id !== senderId) {
        setUnread((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }))
      }
    })
    return () => {
      socket.off("receiveMessage")
      socket.off("newMessageNotification")
    }
  }, [selectedUser])

  /* 🔥 AUTO SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  /* 🔥 SEND */
  const sendMessage = async () => {
    if (!text.trim() || !selectedUser) return
    const msg = { sender: user._id, receiver: selectedUser._id, text }
    await axios.post(`${serverUrl}/api/messages/send`, msg)
    socket.emit("sendMessage", msg)
    setMessages((prev) => [...prev, msg])
    setText("")
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleSelectUser = (u) => {
    setSelectedUser(u)
    setShowSidebar(false)
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="h-full flex bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

      {/* ── SIDEBAR ── */}
      <div
        className={`
          ${showSidebar ? "flex" : "hidden"} md:flex
          w-full md:w-72 lg:w-80 flex-col
          border-r border-slate-100 bg-white shrink-0
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
              <MessageSquare size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 tracking-tight">Messages</h1>
              <p className="text-xs text-slate-400">{users.length} employees</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employees…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-1">
                <MessageSquare size={20} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-500 font-medium">No employees found</p>
              {search && <p className="text-xs text-slate-400">Try a different name</p>}
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isActive = selectedUser?._id === u._id
              return (
                <div
                  key={u._id}
                  onClick={() => handleSelectUser(u)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150 group
                    ${isActive
                      ? "bg-indigo-50 border-r-2 border-indigo-500"
                      : "hover:bg-slate-50"
                    }`}
                >
                  <Avatar user={u} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate transition-colors
                      ${isActive ? "text-indigo-700" : "text-slate-800 group-hover:text-indigo-600"}`}>
                      {u.name}
                    </p>
                    {u.email && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{u.email}</p>
                    )}
                  </div>

                  {/* Unread badge */}
                  {unread[u._id] > 0 && (
                    <span className="bg-indigo-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shrink-0">
                      {unread[u._id]}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── CHAT AREA ── */}
      <div className={`flex-1 flex flex-col min-w-0 ${!showSidebar ? "flex" : "hidden md:flex"}`}>

        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
              <MessageSquare size={28} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-700">No conversation selected</p>
              <p className="text-sm text-slate-400 mt-1">Pick an employee from the list to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white shrink-0">
              {/* Back button on mobile */}
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-100 transition-colors mr-1"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 3L5 8l5 5" />
                </svg>
              </button>

              <Avatar user={selectedUser} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{selectedUser.name}</p>
                {selectedUser.email && (
                  <p className="text-xs text-slate-400 truncate">{selectedUser.email}</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-slate-50/40">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                  <p className="text-sm text-slate-400">No messages yet</p>
                  <p className="text-xs text-slate-300">Say hi to {selectedUser.name}!</p>
                </div>
              )}

              {messages.map((m, i) => {
                const isMine = m.sender === user._id
                return (
                  <div key={i} className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                    {!isMine && (
                      <div className="shrink-0 mb-0.5">
                        <Avatar user={selectedUser} size="sm" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] px-3.5 py-2.5 text-sm leading-relaxed break-words
                        ${isMine
                          ? "bg-indigo-500 text-white rounded-2xl rounded-br-sm shadow-sm shadow-indigo-100"
                          : "bg-white text-slate-800 rounded-2xl rounded-bl-sm border border-slate-100 shadow-sm"
                        }`}
                    >
                      {m.text}
                    </div>
                    {isMine && (
                      <div className="shrink-0 mb-0.5">
                        <Avatar user={user} size="sm" />
                      </div>
                    )}
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100 bg-white flex gap-2 items-center shrink-0">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${selectedUser.name}…`}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
              />
              <button
                onClick={sendMessage}
                disabled={!text.trim()}
                className="w-10 h-10 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95 shrink-0"
              >
                <Send size={15} className="text-white" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Chat