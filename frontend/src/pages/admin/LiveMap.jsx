import { useEffect, useState, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { serverUrl } from "../../main"

/* 🔥 FIX MARKER ICON */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

function RecenterMap({ lat, lng }) {
  const map = useMap()

  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 15, { animate: true })
    }
  }, [lat, lng])

  return null
}

function LiveMap() {

  const { userId } = useParams()
  const [location, setLocation] = useState(null)
  const [address, setAddress] = useState("Loading address...")
  const [satellite, setSatellite] = useState(false)
  const mapRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {

    const fetchLocation = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/location/${userId}`,
          { withCredentials: true }
        )

        if (res.data?.lat && res.data?.lng) {
          setLocation(res.data)

          try {
            const geoRes = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${res.data.lat}&lon=${res.data.lng}`
            )
            setLocation(res.data)
            setAddress(res.data.address || "Address not found")
          } catch {
            setAddress("Address not found")
          }
        }

      } catch (err) {
        console.log(err)
      }
    }

    fetchLocation()
    const interval = setInterval(fetchLocation, 10000)

    return () => clearInterval(interval)

  }, [userId])

  const goToCurrentLocation = () => {
    if (mapRef.current && location) {
      mapRef.current.setView([location.lat, location.lng], 15, {
        animate: true
      })
    }
  }

  if (!location) {
    return <div className="p-6 text-center">Loading map...</div>
  }

  return (
    <div className="p-5 space-y-5">
   <button
  onClick={() => navigate(-1)}
  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 
             px-5 py-2 rounded-lg text-white font-medium 
             shadow-md hover:shadow-lg 
             hover:scale-105 active:scale-95 
             transition-all duration-200"
>
  ← Back
</button>

      <h2 className="text-lg font-bold">Live Location</h2>

      <div className="relative">

        <MapContainer
          center={[location.lat, location.lng]}
          zoom={15}
          whenCreated={(map) => (mapRef.current = map)}
          style={{ height: "500px", width: "100%", borderRadius: "12px" }}
        >

          {satellite ? (
            <TileLayer
              attribution="Tiles © Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          ) : (
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}

          <Marker position={[location.lat, location.lng]}>
            <Popup>
              📍 {address}
            </Popup>
          </Marker>

          <RecenterMap lat={location.lat} lng={location.lng} />

        </MapContainer>


        {/* ✅ SATELLITE BUTTON FIXED */}
        <button
          onClick={() => setSatellite(!satellite)}
          className="absolute top-4 right-4 z-[1000] bg-white shadow-xl border border-gray-300 rounded-lg px-4 py-2 text-xs font-semibold hover:bg-gray-100 active:scale-95 transition-all"
        >
          {satellite ? "🗺️ Normal" : "🛰️ Satellite"}
        </button>

      </div>

      {/* TEXT DETAILS */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        
        <h3 className="text-sm font-semibold text-slate-700 mb-2">
          Current Location Details
        </h3>

        <div className="space-y-2 text-sm text-slate-600">

          <p>
            <span className="font-medium text-slate-800">📍 Address:</span><br />
            {address}
          </p>

          <p>
            <span className="font-medium text-slate-800">🕒 Last Updated:</span>{" "}
            {new Date(location.timestamp).toLocaleString()}
          </p>

        </div>

      </div>

    </div>
  )
}

export default LiveMap