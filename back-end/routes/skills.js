// back-end/routes/skills.js
import express from "express";
// no external mock services — rely on MongoDB and in-memory cache
import multer from "multer";
import path from "path"; 
import SkillOffering from "../models/SkillOffering.js";
import Skill from "../models/Skill.js";
import User from "../models/User.js";

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

let skills = []; // in-memory fallback for POST when DB isn't enabled

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
let lastSuccessfulSkillsCache = null; // { items: [...], totalCount: number, ts: Date }

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const userId = req.query.userId || null; // optional: to compute saved status

  const dbEnabled = (process.env.USE_DB === 'true') || !!process.env.MONGODB_URI;

  // saved state is handled by the front-end via /api/users/:id/saved or /api/users/:id/saved/ids

  // Try DB first (when enabled)
  if (dbEnabled && SkillOffering && typeof SkillOffering.find === 'function') {
    try {
      const skip = (page - 1) * limit;
      const [docs, totalCount] = await Promise.all([
        SkillOffering.find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('skillId')
          .populate('userId')
          .lean(),
        SkillOffering.countDocuments(),
      ]);

      const items = docs.map((off) => {
        const skill = off.skillId || {};
        const user = off.userId || {};
        const detail = Array.isArray(off.description) ? off.description.join('\n') : off.detail || off.description || '';
        const brief = off.brief || (detail.length > 120 ? detail.slice(0, 117) + '...' : detail);
        const image = (Array.isArray(off.images) && off.images[0]) || off.image || user.photo || `https://via.placeholder.com/300x200?text=${encodeURIComponent(skill.name || off.offeringSlug || 'Skill')}`;
        const id = off._id ? String(off._id) : null;

        return {
          skillId: id,
          id,
          name: skill.name || off.offeringSlug || 'Unknown Skill',
          brief,
          detail,
          image,
          userId: user._id ? String(user._id) : null,
          username: user.username || off.username || 'demoUser',
          category: (skill.categories && skill.categories[0]) || skill.category || 'General',
          width: Math.floor(Math.random() * 80) + 150,
          height: Math.floor(Math.random() * 100) + 200,
          hidden: false,
        };
      });

      // cache successful fetch
      lastSuccessfulSkillsCache = { items, totalCount, ts: Date.now() };
      res.set('X-Total-Count', String(totalCount));
      return res.json(items);
    } catch (err) {
      console.error('DB fetch failed for skills:', err && err.message ? err.message : err);
      // fallthrough to fallback below
    }
  }

  // Fallback: return the last successful MongoDB fetch if available
  if (lastSuccessfulSkillsCache && Array.isArray(lastSuccessfulSkillsCache.items) && lastSuccessfulSkillsCache.items.length) {
    res.set('X-Total-Count', String(lastSuccessfulSkillsCache.totalCount || lastSuccessfulSkillsCache.items.length));
    return res.json(lastSuccessfulSkillsCache.items.slice((page - 1) * limit, page * limit));
  }

  return res.status(503).json({ error: 'Skills not available at this time' });
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