import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import mongoose from "mongoose";
import User from "../models/User.js";
import cloudinaryProfile from "../config/cloudinaryProfile.js";
dotenv.config();

const router = express.Router();

// MULTER CONFIG FOR PROFILE PHOTOS
const imageUpload = multer({
  storage: multer.memoryStorage(), // keep in memory for Cloudinary
  fileFilter: (req, file, cb) => {
    const mime = file.mimetype || "";
    const ext = path.extname(file.originalname).toLowerCase();
    const isImageMime = mime.startsWith("image/");
    const isImageExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
    if (isImageMime && isImageExt) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  },
});

// GET profile for a specific user (from users collection)
router.get("/:id", async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.params.id);
    const user = await User.findById(userObjectId).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const profileData = {
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      avatarURL: user.photo,
      skillsOffered: user.offeredSkills || [],
      skillsWanted: user.neededSkills || [],
    };

    res.json(profileData);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch profile." });
  }
});

// UPDATE profile for a specific user (writes into users collection)
router.put("/:id", imageUpload.single("profilePhoto"), async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.params.id);

    const update = {
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      bio: req.body.bio,
    };

    if (req.file) {
      // Upload profile photo to Cloudinary
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
        "base64"
      )}`;
      const result = await cloudinaryProfile.uploader.upload(dataUri, {
        folder: "instaskill/avatars",
        resource_type: "image",
      });
      update.photo = result.secure_url; // store Cloudinary URL
    }

    if (req.body.skillsOffered) {
      update.offeredSkills = JSON.parse(req.body.skillsOffered || "[]");
    }
    if (req.body.skillsWanted) {
      update.neededSkills = JSON.parse(req.body.skillsWanted || "[]");
    }

    const user = await User.findByIdAndUpdate(userObjectId, update, {
      new: true,
      runValidators: true,
    }).exec();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const profileData = {
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      avatarURL: user.photo,
      skillsOffered: user.offeredSkills || [],
      skillsWanted: user.neededSkills || [],
    };

    res.json({ success: true, profile: profileData });
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(400).json({ error: "Failed to process profile update" });
  }
});

export default router;


