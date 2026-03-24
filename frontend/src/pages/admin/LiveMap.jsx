import { useEffect, useState, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { serverUrl } from "../../main"

/* FIX MARKER ICON */
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

        if (res.data) {
          setLocation(res.data)
          setAddress(res.data.address || "Address not found")
        }

      } catch (err) {
        console.log("Fetch Error:", err.message)
      }
    }

    fetchLocation()
    const interval = setInterval(fetchLocation, 30000)

    return () => clearInterval(interval)

  }, [userId])

  if (!location) {
    return <div className="p-6 text-center">Loading map...</div>
  }

  return (
    <div className="p-5 space-y-5">

      <button
        onClick={() => navigate(-1)}
        className="bg-blue-500 px-4 py-2 text-white rounded"
      >
        ← Back
      </button>

      <h2 className="text-lg font-bold">Live Location</h2>

      <div className="relative">
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={15}
          whenCreated={(map) => (mapRef.current = map)}
          style={{ height: "500px", width: "100%" }}
        >

          {satellite ? (
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          ) : (
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          )}

          <Marker position={[location.lat, location.lng]}>
            <Popup>📍 {address}</Popup>
          </Marker>

          <RecenterMap lat={location.lat} lng={location.lng} />

        </MapContainer>

        <button
          onClick={() => setSatellite(!satellite)}
          className="absolute top-4 right-4 bg-white px-3 py-1 rounded shadow"
        >
          {satellite ? "Normal" : "Satellite"}
        </button>
      </div>

      <div className="bg-white border p-4 rounded shadow">
        <p><b>📍 Address:</b><br />{address}</p>
        <p><b>🕒 Last Updated:</b> {new Date(location.createdAt).toLocaleString()}</p>
      </div>

    </div>
  )
}

export default LiveMap