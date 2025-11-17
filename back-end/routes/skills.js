// back-end/routes/skills.js
import express from "express";
import axios from "axios";
import multer from "multer";
import path from "path"; 

const router = express.Router();

// ===== MULTER CONFIG WITH VIDEO VALIDATION =====
const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/videos");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const videoUpload = multer({
  storage: videoStorage,
  fileFilter: (req, file, cb) => {
    const mime = file.mimetype || "";
    const ext = path.extname(file.originalname).toLowerCase();

    const isVideoMime = mime.startsWith("video/");
    const isVideoExt = [".mp4", ".mov", ".webm", ".ogg", ".mkv"].includes(ext);

    if (isVideoMime || isVideoExt) {
      console.log("Accepting upload:", file.originalname, "mimetype:", mime, "ext:", ext);
      return cb(null, true);
    }

    console.log("Rejecting upload:", file.originalname, "mimetype:", mime, "ext:", ext);
    return cb(new Error("Only video files are allowed"));
  },
});


// In-memory "database" for now.
// Later you can replace this with your Mockaroo data or real DB.
let skills = [];

// back-up data incase fetching fails
const backupSkills = [
  {
    skillId: 1,
    name: "Public Speaking",
    brief: "Confident presentations and speeches.",
    detail:
      "Deliver powerful speeches and communicate ideas effectively through audience-centered presentations and storytelling.",
    image: "https://via.placeholder.com/300x200?text=Public+Speaking",
    userId: 1,
    username: "jsmith",
    category: "Public Relations",
  },
  {
    skillId: 2,
    name: "Python",
    brief: "Programming and data analysis using Python.",
    detail:
      "Learn to write efficient scripts, analyze data, and build software using Python's extensive libraries.",
    image: "https://via.placeholder.com/300x200?text=Python",
    userId: 2,
    username: "amorgan",
    category: "Technology",
  },
  {
    skillId: 3,
    name: "Graphic Design",
    brief: "Creating visuals with Adobe Illustrator.",
    detail:
      "Explore typography, layout, and color to produce creative designs using modern digital tools.",
    image: "https://via.placeholder.com/300x200?text=Graphic+Design",
    userId: 3,
    username: "tnguyen",
    category: "Arts",
  },
  {
    skillId: 4,
    name: "Video Editing",
    brief: "Editing videos in Premiere Pro and Final Cut.",
    detail:
      "Master cutting, color grading, and transitions to create professional-level video projects.",
    image: "https://via.placeholder.com/300x200?text=Video+Editing",
    userId: 4,
    username: "rpatel",
    category: "Technology",
  },
  {
    skillId: 5,
    name: "Spanish",
    brief: "Conversational and written fluency.",
    detail:
      "Improve your Spanish speaking and comprehension for travel, business, or cultural enrichment.",
    image: "https://via.placeholder.com/300x200?text=Spanish",
    userId: 5,
    username: "mgomez",
    category: "Arts",
  },
  {
    skillId: 6,
    name: "Photography",
    brief: "Portrait and landscape photography.",
    detail:
      "Learn to capture stunning photos using natural light, composition, and post-processing techniques.",
    image: "https://via.placeholder.com/300x200?text=Photography",
    userId: 6,
    username: "lcooper",
    category: "Sports",
  },
  {
    skillId: 7,
    name: "Web Development",
    brief: "Building with HTML, CSS, JavaScript.",
    detail:
      "Design and code responsive websites using front-end technologies and frameworks.",
    image: "https://via.placeholder.com/300x200?text=Web+Dev",
    userId: 7,
    username: "dchung",
    category: "Technology",
  },
];

// Helper to attach computed fields, saved and hidden options
function addComputedFields(skill) {
  return {
    ...skill,
    width: Math.floor(Math.random() * 80) + 150,
    height: Math.floor(Math.random() * 100) + 200,
    saved: false,
    hidden: false,
  };
}

/**
 * GET /api/skills
 * Fetches skills from Mockaroo once, stores it in memory for caching
 */
router.get("/", async (req, res) => {
  try {
    if (skills.length > 0) {
      // Return cached in-memory skills
      return res.json(skills);
    }

    const apiKey = process.env.API_SECRET_KEY;
    if (!apiKey) {
      console.error("Missing API_SECRET_KEY env variable, using backup skills");
      skills = backupSkills.map(addComputedFields);
      return res.json(skills);
    }

    console.log("Fetching skills from Mockaroo...");

    const response = await axios.get(
      `https://my.api.mockaroo.com/skills.json?key=${apiKey}`
    );

    skills = response.data.map(addComputedFields);
    return res.json(skills);
  } catch (error) {
    console.error("Mockaroo API failed:", error.message);
    skills = backupSkills.map(addComputedFields);
    return res.json(skills);
  }
});

/**
 * POST /api/skills
 * Creates a new skill that matches the Mockaroo schema:
 * skillId, name, brief, detail, image, userId, username, category
 *
 * (User story #110 + #111 – posting a skill with optional image URL)
 */
router.post("/", videoUpload.single("video"), (req, res) => {
  const {
    name,
    category,
    brief,
    detail,
    description,
    image,
    userId,
    username,
  } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: "name and category are required" });
  }

  const newSkillId = skills.length ? skills[skills.length - 1].skillId + 1 : 1;

  const finalDetail = detail || description || brief || "";
  const finalBrief =
    brief ||
    (finalDetail.length > 120
      ? finalDetail.slice(0, 117) + "..."
      : finalDetail);

  // If video was uploaded, assign its server URL
  const videoUrl = req.file
    ? `/static/uploads/videos/${req.file.filename}`
    : null;

  const newSkill = addComputedFields({
    skillId: newSkillId,
    id: newSkillId,
    name,
    brief: finalBrief,
    detail: finalDetail,
    description: finalDetail,
    image:
      image ||
      `https://via.placeholder.com/300x200?text=${encodeURIComponent(name)}`,
    videoUrl: videoUrl, // ⭐ NEW VIDEO SUPPORT
    userId: userId ?? 1,
    username: username || "demoUser",
    category,
  });

  skills.push(newSkill);

  return res.status(201).json(newSkill);
});


export default router;
