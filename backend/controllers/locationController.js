import Location from "../model/Location.js";
import axios from "axios";

// ✅ SAVE LOCATION + ADDRESS
export const updateLocation = async (req, res) => {
  try {
    const { userId, lat, lng } = req.body;

    if (!userId || !lat || !lng) {
      return res.status(400).json({
        message: "userId, lat, lng required"
      });
    }

    let address = "Address not found";

    try {
      const geoRes = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: {
            format: "json",
            lat: lat,
            lon: lng
          },
          headers: {
            "User-Agent": "attendance-app"
          },
          timeout: 5000
        }
      );

      if (geoRes.data?.display_name) {
        address = geoRes.data.display_name;
      }

    } catch (err) {
      console.log("Geo Error:", err.message);
    }

    const location = await Location.create({
      user: userId,
      lat: Number(lat),
      lng: Number(lng),
      address
    });

    res.json({ success: true, location });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ GET LATEST LOCATION
export const getLatestLocation = async (req, res) => {
  try {
    const { userId } = req.params;

    const location = await Location.findOne({ user: userId })
      .sort({ timestamp: -1 });

    res.json(location);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};