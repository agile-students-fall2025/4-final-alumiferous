import express from "express";
import dotenv from "dotenv";
//import axios from "axios";
import multer from "multer";
import path from "path";
import Profile from "../models/Profile.js";
import mongoose from "mongoose";

dotenv.config();

const router = express.Router();

//MULTER CONFIG FOR PROFILE PHOTOS
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/profile-photos");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const uniqueName = base + "-" + Date.now() + ext;
    cb(null, uniqueName);
  }
});
const imageUpload = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    const mime = file.mimetype || "";
    const ext = path.extname(file.originalname).toLowerCase();
    const isImageMime = mime.startsWith("image/");
    const isImageExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
    if (isImageMime && isImageExt) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.params.id);
    const profile = await Profile.findOne({ userId: userObjectId });
    if (profile) return res.json(profile);
    res.status(404).json({ error: "Profile not found" });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Failed to fetch profile." });
  }
});

// GET all profiles
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find();
    res.json(profiles);
  } catch (err) {
    console.error("Error fetching all profiles:", err);
    res.status(500).json({ error: "Failed to fetch profiles." });
  }
});

// PUT: Update profile by userId with photo upload
router.put("/:id", imageUpload.single("profilePhoto"), async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.params.id);
    // Build the profile update object
    const update = {
      username: req.body.username,
      bio: req.body.bio || req.body.about, // either source
      skillsOffered: JSON.parse(req.body.skillsOffered || req.body.skillsAcquired || "[]"),
      skillsWanted: JSON.parse(req.body.skillsWanted || "[]"),
    };
    if (req.file) {
      update.avatarUrl = `/uploads/profile-photos/${req.file.filename}`;
    } else if (req.body.avatarUrl) {
      update.avatarUrl = req.body.avatarUrl;
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: userObjectId },
      update,
      { new: true, runValidators: true }
    );
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json({ success: true, profile });
  } catch (err) {
    console.error("Error updating profile with photo:", err);
    res.status(400).json({ error: "Failed to process profile update" });
  }
});

// POST: Create profile
router.post("/", imageUpload.single("profilePhoto"), async (req, res) => {
  try {
    const data = {
      userId: new mongoose.Types.ObjectId(req.body.userId),
      username: req.body.username,
      bio: req.body.bio,
      skillsOffered: JSON.parse(req.body.skillsOffered || req.body.skillsAcquired || "[]"),
      skillsWanted: JSON.parse(req.body.skillsWanted || "[]"),
      avatarUrl: req.file ? `/uploads/profile-photos/${req.file.filename}` : req.body.avatarUrl,
    };
    const newProfile = new Profile(data);
    await newProfile.save();
    res.status(201).json({ success: true, profile: newProfile });
  } catch (err) {
    console.error("Error creating profile:", err);
    res.status(400).json({ error: "Failed to create profile" });
  }
});

export default router;
