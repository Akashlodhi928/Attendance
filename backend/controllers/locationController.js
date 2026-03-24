import Location from "../model/Location.js";

// Save user location (every 10 min)
export const updateLocation = async (req, res) => {
  try {
    const { userId, lat, lng } = req.body

    if (!userId || !lat || !lng) {
      return res.status(400).json({
        message: "userId, lat, lng required"
      })
    }

    const location = await Location.create({
      user: userId,
      lat: Number(lat),
      lng: Number(lng)
    })

    res.json({ success: true, location })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}


// Get latest location
export const getLatestLocation = async (req, res) => {
  try {
    const { userId } = req.params

    const location = await Location.findOne({ user: userId })
      .sort({ createdAt: -1 })

    if (!location) {
      return res.json(null)
    }

    res.json(location)

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}