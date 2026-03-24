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

// ✅ FIXED: Reverse geocoding with multiple fallback strategies
export const getLatestLocation = async (req, res) => {
  try {
    const { userId } = req.params;

    const location = await Location.findOne({ user: userId }).sort({
      timestamp: -1,
    });

    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    const { lat, lng } = location;

    let address = null;

    // ─────────────────────────────────────────────
    // Strategy 1: Nominatim (OpenStreetMap)
    // ─────────────────────────────────────────────
    if (!address) {
      try {
        const geoRes = await axios.get(
          "https://nominatim.openstreetmap.org/reverse",
          {
            params: {
              format: "json",
              lat: lat,
              lon: lng,
              zoom: 18,
              addressdetails: 1,
            },
            headers: {
              "User-Agent": "AttendanceApp/1.0",
              "Accept-Language": "en",
            },
            timeout: 8000,
          }
        );

        console.log("✅ Nominatim response:", JSON.stringify(geoRes.data));

        if (geoRes.data?.display_name) {
          address = geoRes.data.display_name;
        }
      } catch (err) {
        console.log("❌ Nominatim failed:", err.message);
      }
    }

    // ─────────────────────────────────────────────
    // Strategy 2: BigDataCloud (no API key needed)
    // ─────────────────────────────────────────────
    if (!address) {
      try {
        const bdcRes = await axios.get(
          "https://api.bigdatacloud.net/data/reverse-geocode-client",
          {
            params: {
              latitude: lat,
              longitude: lng,
              localityLanguage: "en",
            },
            timeout: 8000,
          }
        );

        console.log("✅ BigDataCloud response:", JSON.stringify(bdcRes.data));

        const d = bdcRes.data;
        if (d?.locality || d?.city || d?.principalSubdivision) {
          address = [d.locality, d.city, d.principalSubdivision, d.countryName]
            .filter(Boolean)
            .join(", ");
        }
      } catch (err) {
        console.log("❌ BigDataCloud failed:", err.message);
      }
    }

    // ─────────────────────────────────────────────
    // Strategy 3: Coordinates fallback (always works)
    // ─────────────────────────────────────────────
    if (!address) {
      address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      console.log("⚠️ All geocoding failed, showing coordinates");
    }

    res.json({
      lat,
      lng,
      timestamp: location.timestamp,
      address,
    });
  } catch (err) {
    console.log("❌ getLatestLocation error:", err.message);
    res.status(500).json({ error: err.message });
  }
};