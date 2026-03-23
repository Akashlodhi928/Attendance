import cloudinary from "../config/cloudinary.js";
import User from "../model/auth.model.js";

export const currentUser = async (req, res) => {
  try {

    /* =====================
        ADMIN USER
    ===================== */

    if (req.user.role === "admin") {
      return res.status(200).json({
        success: true,
        user: {
          _id: "admin",
          name: "Admin",
          email: process.env.ADMIN_EMAIL,
          role: "admin"
        }
      });
    }


    /* =====================
        NORMAL USER
    ===================== */

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in currentUser controller",
      error: error.message
    });
  }
};

export const updateAvatar = async (req, res) => {

  try {

    const { userId, image } = req.body

    if (!userId || !image) {
      return res.status(400).json({
        message: "UserId and image required"
      })
    }

    const upload = await cloudinary.uploader.upload(image, {
      folder: "profile"
    })

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: upload.secure_url },
      { new: true }
    )

    res.json({
      message: "Profile image updated",
      user
    })

  } catch (error) {

    console.log("UPLOAD ERROR:", error)

    res.status(500).json({
      error: error.message
    })

  }

}

export const getAllUsers = async (req, res) => {

  try {

    const users = await User.find()
      .select("-password -resetOtp")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      users
    })

  } catch (error) {

    console.log("Get Users Error:", error)

    res.status(500).json({
      success: false,
      message: "Server error"
    })

  }

}

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};