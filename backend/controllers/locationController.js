import Location from "../model/Location.js";
import axios from "axios";

// Save user location (every 10 min)
export const updateLocation = async (req, res) => {
  try {
    const { userId, lat, lng } = req.body;

    const location = await Location.create({
      user: userId,
      lat,
      lng,
    });

    res.json({ success: true, location });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ FIXED: Get latest location + resolve address on the SERVER (avoids browser CORS issues)
export const getLatestLocation = async (req, res) => {
  try {
    const { userId } = req.params;

    const location = await Location.findOne({ user: userId }).sort({
      timestamp: -1,
    });

    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    // ✅ Resolve address on server side (Node.js has no CORS issue with Nominatim)
    let address = "Address not found";
    try {
      const geoRes = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: {
            format: "json",
            lat: location.lat,
            lon: location.lng,
          },
          headers: {
            // ✅ Required — Nominatim blocks requests without a proper User-Agent
            "User-Agent": "attendance-system/1.0 (your@email.com)",
          },
          timeout: 7000,
        }
      );

      if (geoRes.data?.display_name) {
        address = geoRes.data.display_name;
      }
    } catch (geoErr) {
      console.log("Geo reverse error:", geoErr.message);
    }

    // ✅ Return a clean plain object (not raw mongoose doc)
    res.json({
      lat: location.lat,
      lng: location.lng,
      timestamp: location.timestamp, // ✅ This ensures "Last Updated" shows correctly
      address,                        // ✅ Address resolved server-side
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};