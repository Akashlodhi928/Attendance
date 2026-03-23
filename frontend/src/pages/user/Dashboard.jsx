import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Camera, MapPin, Clock, LogOut, CheckCircle2, RefreshCw, Loader2, Video, X } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import socket from "../../socket"
import { serverUrl } from "../../main"

/* ── tiny helper ── */
const Step = ({ num, label, done, active }) => (
  <div className={`flex items-center gap-2 text-xs font-semibold tracking-wide transition-all duration-300
    ${done ? "text-emerald-500" : active ? "text-blue-500" : "text-slate-400"}`}>
    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all duration-300
      ${done ? "bg-emerald-500 border-emerald-500 text-white" : active ? "border-blue-500 text-blue-500" : "border-slate-300 text-slate-400"}`}>
      {done ? "✓" : num}
    </span>
    {label}
  </div>
)

function Dashboard() {
  const { user } = useAuth()

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [image, setImage] = useState(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [location, setLocation] = useState(null)
  const [address, setAddress] = useState("")
  const [seconds, setSeconds] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [alreadyMarked, setAlreadyMarked] = useState(false)
  const [locLoading, setLocLoading] = useState(false)
  const [checkedOut, setCheckedOut] = useState(false)

  /* ── Fetch today attendance ── */
  useEffect(() => {
    if (!user?._id) return
    const fetchTodayAttendance = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/attendance/today/${user._id}`,
          { withCredentials: true }
        )
        const attendance = res.data.attendance
        if (!attendance) return
        setAlreadyMarked(true)
        setImage(attendance.image)
        if (attendance.location) setLocation(attendance.location)
        if (attendance.address) setAddress(attendance.address)
        if (!attendance.checkOutTime) {
          setTimerActive(true)
          const diff = Math.floor((new Date() - new Date(attendance.checkInTime)) / 1000)
          setSeconds(diff)
        }
      } catch (error) {
        console.log("Attendance fetch error", error)
      }
    }
    fetchTodayAttendance()
  }, [user])

  /* ── Timer ── */
  useEffect(() => {
    let interval
    if (timerActive) interval = setInterval(() => setSeconds(p => p + 1), 1000)
    return () => clearInterval(interval)
  }, [timerActive])

  const formatTime = () => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return { hrs: String(hrs).padStart(2, "0"), mins: String(mins).padStart(2, "0"), secs: String(secs).padStart(2, "0") }
  }

  /* ── Camera ── */
  const openCamera = async () => {
    if (alreadyMarked) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      setCameraOpen(true)
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream }, 200)
    } catch {
      alert("Camera permission denied")
    }
  }

  const captureImage = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d").drawImage(video, 0, 0)
    setImage(canvas.toDataURL("image/png"))
    streamRef.current.getTracks().forEach(t => t.stop())
    setCameraOpen(false)
  }

  const retakeImage = () => {
    setImage(null)
    openCamera()
  }

  /* ── Location ── */
 const addLocation = () => {
  if (alreadyMarked) return

  if (!navigator.geolocation) {
    alert("Geolocation not supported")
    return
  }

  setLocLoading(true)
  setAddress("Fetching address...") // 🔥 important

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude

      setLocation({ lat, lng })

      try {
      const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse`,
            {
              params: {
                format: "json",
                lat: lat,
                lon: lng
              },
              withCredentials: false // 🔥 YE ADD KAR
            }
          )

        if (res.data?.display_name) {
          setAddress(res.data.display_name)
        } else {
          setAddress("Address not available")
        }

      } catch (error) {
        console.log(error)
        setAddress("Error fetching address")
      } finally {
        setLocLoading(false)
      }
    },

    (error) => {
      alert("Location permission denied")
      setLocLoading(false)
      setAddress("")
    }
  )
}
 

  /* ── Check In ── */
  const markAttendance = async () => {
    if (!image || !location) return alert("Please capture image and add location")
    try {
      setLoading(true)
      await axios.post(
        `${serverUrl}/api/attendance/checkin`,
        { userId: user._id, image, lat: location.lat, lng: location.lng },
        { withCredentials: true }
      )
      socket.emit("attendanceMarked")
      setTimerActive(true)
      setAlreadyMarked(true)
    } catch (error) {
      alert(error.response?.data?.message || "Attendance failed")
    } finally {
      setLoading(false)
    }
  }

  /* ── Checkout ── */
  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true)
      await axios.post(
        `${serverUrl}/api/attendance/checkout`,
        { userId: user._id },
        { withCredentials: true }
      )
      setTimerActive(false)
      setCheckedOut(true)
      setImage(null)
      setLocation(null)
      setAddress("")
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      setCameraOpen(false)
    } catch (error) {
      console.log(error)
      alert("Checkout failed")
    } finally {
      setCheckoutLoading(false)
    }
  }

  const { hrs, mins, secs } = formatTime()
  const now = new Date()
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

 
/* ── LIVE LOCATION UPDATE (REAL 10 MINUTES) ── */
useEffect(() => {

  if (!alreadyMarked || checkedOut || !user?._id) return

  const sendLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {

      try {
        await axios.post(
          `${serverUrl}/api/location/update`,
          {
            userId: user._id,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          },
          { withCredentials: true }
        )
      } catch (err) {
        console.log("Location update error", err)
      }

    })
  }

  // first time
  sendLocation()

  // ✅ EVERY 10 MINUTES (REAL)
  const interval = setInterval(sendLocation, 600000)

  return () => clearInterval(interval)

}, [alreadyMarked, checkedOut, user])

  return (
    <div className="space-y-6 pb-8">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">Attendance Portal</p>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-none">
            Good {now.getHours() < 12 ? "Morning" : now.getHours() < 17 ? "Afternoon" : "Evening"},{" "}
            <span className="text-blue-600">{user?.name?.split(" ")[0] || "there"}</span> 
          </h2>
          <p className="text-xs text-slate-400 mt-1.5">{dateStr}</p>
        </div>

        {alreadyMarked && !checkedOut && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold px-3 py-2 rounded-xl">
            <CheckCircle2 size={14} />
            Checked In
          </div>
        )}
        {checkedOut && (
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold px-3 py-2 rounded-xl">
            <CheckCircle2 size={14} />
            Checked Out
          </div>
        )}
      </div>

      {/* ── Checkout success banner ── */}
      {checkedOut && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">You've successfully checked out!</p>
              <p className="text-xs text-emerald-100 mt-0.5">Your attendance for today has been recorded. See you tomorrow!</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Timer card (when active) ── */}
      {timerActive && !checkedOut && (
        <div className="bg-gradient-to-br from-[#0f1629] to-[#1a2540] rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-800/20 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Working Time</p>
              </div>
              <div className="flex items-baseline gap-1.5">
                {[hrs, mins, secs].map((val, i) => (
                  <span key={i} className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black tabular-nums tracking-tight">{val}</span>
                    <span className="text-slate-500 text-sm font-medium mr-1">{["h", "m", "s"][i]}</span>
                    {i < 2 && <span className="text-slate-600 text-3xl font-thin -mx-1">:</span>}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="flex items-center justify-center gap-2.5 bg-red-500 hover:bg-red-400 active:bg-red-600 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-red-900/30 disabled:opacity-60 disabled:cursor-not-allowed min-w-[140px]"
            >
              {checkoutLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Processing…</>
              ) : (
                <><LogOut size={16} /> Check Out</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Main attendance card ── */}
      {!checkedOut && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

          {/* Card header */}
          <div className="px-5 sm:px-7 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock size={16} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Mark Attendance</h3>
              <p className="text-xs text-slate-400">Complete both steps to check in</p>
            </div>
          </div>

          <div className="p-5 sm:p-7 space-y-6">

            {/* Progress steps */}
            {!alreadyMarked && (
              <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                <Step num="1" label="Capture Photo" done={!!image} active={!image} />
                <div className="flex-1 h-px bg-slate-200 hidden sm:block max-w-[60px]" />
                <Step num="2" label="Add Location" done={!!location} active={!!image && !location} />
                <div className="flex-1 h-px bg-slate-200 hidden sm:block max-w-[60px]" />
                <Step num="3" label="Check In" done={alreadyMarked} active={!!image && !!location} />
              </div>
            )}

            {/* ── CAMERA VIEW ── */}
            {cameraOpen && (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-sm shadow-lg">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-white/10 rounded-2xl pointer-events-none" />
                  {/* corner guides */}
                  {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos, i) => (
                    <div key={i} className={`absolute ${pos} w-6 h-6 border-white border-2 rounded-sm opacity-60`}
                      style={{ borderRight: i % 2 === 0 ? "none" : undefined, borderLeft: i % 2 === 1 ? "none" : undefined,
                               borderBottom: i < 2 ? "none" : undefined, borderTop: i >= 2 ? "none" : undefined }} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={captureImage}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-blue-200"
                  >
                    <Camera size={15} /> Capture
                  </button>
                  <button
                    onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); setCameraOpen(false) }}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all duration-200"
                  >
                    <X size={15} /> Cancel
                  </button>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* ── IMAGE + LOCATION ROW ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Image card */}
              <div className={`rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden
                ${image ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-slate-50/50"}`}>
                {image ? (
                  <div className="relative group">
                    <img src={image} alt="Captured" className="w-full max-h-48 object-contain bg-gray-200" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-xl">
                      {!alreadyMarked && (
                        <button
                          onClick={retakeImage}
                          className="flex items-center gap-2 bg-white text-slate-800 font-semibold text-xs px-4 py-2 rounded-lg"
                        >
                          <RefreshCw size={12} /> Retake
                        </button>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ✓ Captured
                    </div>
                  </div>
                ) : !cameraOpen ? (
                  <button
                    onClick={openCamera}
                    disabled={alreadyMarked}
                    className="w-full h-48 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <Video size={22} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">Open Camera</p>
                      <p className="text-xs text-slate-300 mt-0.5">Take a selfie to verify</p>
                    </div>
                  </button>
                ) : null}
              </div>

              {/* Location card */}
              <div className={`rounded-2xl border-2 border-dashed transition-all duration-300
                ${location ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-slate-50/50"}`}>
                {location ? (
                  <div className="p-4 h-48 flex flex-col justify-between">
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin size={14} className="text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-emerald-600 mb-1">Location Captured</p>
                       <p>
                          {locLoading ? "Fetching address..." : address || "No address yet"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-100 rounded-lg px-2.5 py-1.5 w-fit">
                      <span className="font-mono">{location.lat?.toFixed(4)}, {location.lng?.toFixed(4)}</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={addLocation}
                    disabled={alreadyMarked || locLoading}
                    className="w-full h-48 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                      {locLoading ? <Loader2 size={22} className="animate-spin" /> : <MapPin size={22} />}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">{locLoading ? "Detecting…" : "Add Location"}</p>
                      <p className="text-xs text-slate-300 mt-0.5">Enable GPS for verification</p>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* ── CHECK IN BUTTON ── */}
            {image && location && !timerActive && !alreadyMarked && (
              <button
                onClick={markAttendance}
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Marking Attendance…</>
                ) : (
                  <><CheckCircle2 size={16} /> Mark Attendance</>
                )}
              </button>
            )}

            {/* Already marked info */}
            {alreadyMarked && !timerActive && !checkedOut && (
              <div className="flex items-center gap-2.5 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Attendance already marked for today.</span>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}

export default Dashboard
