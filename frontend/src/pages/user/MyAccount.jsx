import { useState } from "react"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import { User, Mail, Shield, LogOut, Camera, Loader2, CheckCircle2 } from "lucide-react"
import { serverUrl } from "../../main"

function MyAccount() {
  const { user, logout, setUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = async () => {
      try {
        setLoading(true)
        const res = await axios.post(
          `${serverUrl}/api/user/update-avatar`,
          { userId: user._id, image: reader.result },
          { withCredentials: true }
        )
        setUser(res.data.user)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } catch {
        alert("Image upload failed")
      } finally {
        setLoading(false)
      }
    }
  }

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 group ">
      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:border-blue-200 transition-colors flex-shrink-0">
        <Icon size={16} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-700 truncate capitalize">{value}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-[80vh] flex items-center justify-center  sm:p-6">
      <div className="w-full max-w-sm sm:max-w-md">

        {/* Success toast */}
        {success && (
          <div className="mb-4 flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-3 rounded-2xl shadow-sm">
            <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
            Profile photo updated successfully!
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">

          {/* Top banner */}
          <div className="h-24 sm:h-28 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          </div>

          <div className="px-6 sm:px-8 pb-7">

            {/* Avatar */}
            <div className="flex flex-col items-center -mt-14 mb-5">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-white shadow-xl shadow-slate-300/50 bg-white">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl sm:text-4xl font-black">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>

                {/* Camera overlay */}
                <label className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer">
                  {loading
                    ? <Loader2 size={22} className="text-white animate-spin" />
                    : <Camera size={22} className="text-white" />
                  }
                  <input type="file" accept="image/*" hidden onChange={handleImageUpload} disabled={loading} />
                </label>

                {/* Online dot */}
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full shadow-sm" />
              </div>

              {/* Name & role badge */}
              <div className="mt-3 text-center">
                <h2 className="text-lg sm:text-xl font-black text-slate-800 leading-none">{user?.name}</h2>
                
              </div>

              {/* Upload button */}
              <label className={`mt-4 flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all duration-200 cursor-pointer
                ${loading
                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                }`}>
                {loading
                  ? <><Loader2 size={13} className="animate-spin" /> Uploading…</>
                  : <><Camera size={13} /> Change Photo</>
                }
                <input type="file" accept="image/*" hidden onChange={handleImageUpload} disabled={loading} />
              </label>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Info</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Info rows */}
            <div className="space-y-2.5">
              <InfoRow icon={User} label="Full Name" value={user?.name || "—"} />
              <InfoRow icon={Mail} label="Email Address" value={user?.email || "—"} />
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="mt-6 w-full flex items-center justify-center gap-2.5 bg-red-50 hover:bg-red-500 border border-red-200 hover:border-red-500 text-red-500 hover:text-white font-bold text-sm py-3.5 rounded-2xl transition-all duration-200 group"
            >
              <LogOut size={16} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
              Log Out
            </button>

          </div>
        </div>

       
      </div>
    </div>
  )
}

export default MyAccount