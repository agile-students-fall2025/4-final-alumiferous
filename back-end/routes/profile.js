import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import multer from "multer";
import path from "path";

dotenv.config();

const router = express.Router();

// ==== MULTER CONFIG FOR PROFILE PHOTOS ====
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

// GET all users from Mockaroo (unchanged)
router.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      `https://my.api.mockaroo.com/users.json?key=${process.env.API_SECRET_KEY}`
    );
    const users = Array.isArray(response.data) ? response.data : [response.data];
    res.json(users);
  } catch (err) {
    console.error("Error fetching all users from Mockaroo:", err);
    res.status(500).json({ error: "Failed to fetch users from Mockaroo." });
  }
});

// GET user profile by id from Mockaroo (unchanged)
router.get("/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `https://my.api.mockaroo.com/users.json?key=${process.env.API_SECRET_KEY}`
    );
    const users = Array.isArray(response.data) ? response.data : [response.data];
    const user = users.find(u => u.userId === Number(req.params.id));
    if (user) return res.json(user);
    res.status(404).json({ error: "User not found" });
  } 
  catch (err) {
    console.error("Error fetching from Mockaroo:", err);
    res.status(500).json({ error: "Failed to fetch from Mockaroo." });
  }
});

// PUT update profile by id WITH PHOTO UPLOAD support (FormData)
router.put("/:id", imageUpload.single("profilePhoto"), (req, res) => {
  try {
    const profile = {
      userId: req.body.userId,
      username: req.body.username,
      about: req.body.about,
      skillsAcquired: JSON.parse(req.body.skillsAcquired),
      skillsWanted: JSON.parse(req.body.skillsWanted),
    };

    if (req.file) {
      profile.profilePhoto = `/uploads/profile-photos/${req.file.filename}`;
    } else if (req.body.profilePhoto) {
      profile.profilePhoto = req.body.profilePhoto;
    }

    // Save logic here if using DB/local file. For now, just echo back.
    res.json({ success: true, user: profile });
  } catch (err) {
    console.error("Error updating profile with photo:", err);
    res.status(400).json({ error: "Failed to process profile update" });
  }
});

export default router;


