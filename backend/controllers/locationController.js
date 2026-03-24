import Location from "../model/Location.js";

// Save user location (every 10 min)
export const updateLocation = async (req, res) => {
  try {
    const { userId, lat, lng } = req.body;

    const location = await Location.create({
      user: userId,
      lat,
      lng
    });

    res.json({ success: true, location });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get latest location
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