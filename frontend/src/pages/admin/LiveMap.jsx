import { useEffect, useState, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { serverUrl } from "../../main"

/* ── Fix default Leaflet marker icons ── */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

/* ── Auto-recenter map when location updates ── */
function RecenterMap({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 15, { animate: true })
  }, [lat, lng])
  return null
}

function LiveMap() {
  const { userId } = useParams()
  const navigate   = useNavigate()
  const mapRef     = useRef(null)

  const [location,  setLocation]  = useState(null)
  const [satellite, setSatellite] = useState(false)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  /* ── Fetch location every 10s ── */
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/location/${userId}`,
          { withCredentials: true }
        )
        if (res.data?.lat && res.data?.lng) {
          setLocation(res.data)
          setError(null)
        } else {
          setError("Location data not available")
        }
      } catch (err) {
        console.log("LiveMap fetch error:", err)
        setError("Failed to fetch location")
      } finally {
        setLoading(false)
      }
    }

    fetchLocation()
    const interval = setInterval(fetchLocation, 10000)
    return () => clearInterval(interval)
  }, [userId])

  /* ── Loading screen ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-11 h-11 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin" />
        <p className="text-sm text-slate-500">Fetching live location…</p>
      </div>
    )
  }

  /* ── Error screen ── */
  if (error || !location) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-transform border-none cursor-pointer"
        >
          ← Back
        </button>
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-2xl">
            📍
          </div>
          <p className="text-base font-bold text-slate-800 m-0">Location Not Found</p>
          <p className="text-sm text-slate-400 m-0">
            {error || "No location data available for this user"}
          </p>
        </div>
      </div>
    )
  }

  /* ── Format last updated time ── */
  const lastUpdated = location.timestamp
    ? new Date(location.timestamp).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      })
    : "N/A"

  /* ── Main render ── */
  return (
    <div className="flex flex-col gap-5 px-4 pt-5 pb-10">

      {/* ── Back button ── */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-transform border-none cursor-pointer w-fit"
      >
        ← Back
      </button>

      {/* ── Title row ── */}
      <div className="flex items-center gap-3">
        {/* Icon */}
       

        {/* Text */}
        <div>
          <h2 className="m-0 text-lg font-extrabold text-slate-800 leading-tight">
            User Location
          </h2>
         
        </div>

        {/* Live badge */}
        <div className="ml-auto flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          <span className="text-[11px] font-bold text-green-600">Live</span>
        </div>
      </div>

      {/* ── Map ── */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-black/10">
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={15}
          ref={mapRef}
          style={{ height: "420px", width: "100%" }}
        >
          {satellite ? (
            <TileLayer
              attribution="Tiles © Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          ) : (
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}

          <Marker position={[location.lat, location.lng]}>
            <Popup>
              <div className="text-xs leading-relaxed">
                <strong>📍 Location</strong><br />
                {location.address}
              </div>
            </Popup>
          </Marker>

          <RecenterMap lat={location.lat} lng={location.lng} />
        </MapContainer>

        {/* Satellite toggle */}
        <button
          onClick={() => setSatellite(!satellite)}
          className="absolute top-3 right-3 z-[1000] bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold cursor-pointer shadow-lg hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-1.5"
        >
          {satellite ? "🗺️ Normal" : "🛰️ Satellite"}
        </button>
      </div>

      {/* ── Location details card ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          Current Location Details
        </div>

        {/* Address row */}
        <div className="flex gap-3 items-start px-4 py-3.5 border-b border-slate-50">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-sm flex-shrink-0">
            📍
          </div>
          <div className="min-w-0">
            <p className="m-0 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Address
            </p>
            <p className="mt-1 m-0 text-[13px] text-slate-800 leading-relaxed">
              {/* ✅ address from server — Nominatim or BigDataCloud */}
              {location.address}
            </p>
          </div>
        </div>

        {/* Coordinates row */}
        <div className="flex gap-3 items-center px-4 py-3.5 border-b border-slate-50">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm flex-shrink-0">
            🌐
          </div>
          <div>
            <p className="m-0 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Coordinates
            </p>
            <p className="mt-1 m-0 text-[13px] text-slate-800 font-mono">
              {Number(location.lat).toFixed(6)}, {Number(location.lng).toFixed(6)}
            </p>
          </div>
        </div>

        {/* Last updated row */}
        <div className="flex gap-3 items-center px-4 py-3.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-sm flex-shrink-0">
            🕒
          </div>
          <div>
            <p className="m-0 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Last Updated
            </p>
            <p className="mt-1 m-0 text-[13px] text-slate-800">
              {/* ✅ timestamp from server, formatted correctly */}
              {lastUpdated}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default LiveMap