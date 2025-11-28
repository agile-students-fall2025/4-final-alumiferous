// back-end/routes/skills.js
import express from "express";
// no external mock services — rely on MongoDB and in-memory cache
import multer from "multer";
import path from "path"; 
import SkillOffering from "../models/SkillOffering.js";
import Skill from "../models/Skill.js";
import User from "../models/User.js";

const router = express.Router();

// ===== MULTER CONFIG FOR MULTIPLE IMAGES & VIDEOS =====
// We use a single diskStorage but choose destination based on the incoming fieldname
// so `images` will go to `public/uploads/images` and `videos` to `public/uploads/videos`.
const mediaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // route uploads to specific folders based on field name
    if (file.fieldname && file.fieldname.toLowerCase().includes('video')) {
      return cb(null, 'public/uploads/videos');
    }
    if (file.fieldname && file.fieldname.toLowerCase().includes('image')) {
      return cb(null, 'public/uploads/images');
    }
    // fallback
    return cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    // keep original name but prefix with timestamp to avoid collisions
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

// Basic file filter that accepts common image/video types. We allow both images and videos
// because the front-end may upload either under the `images` or `videos` field.
const mediaUpload = multer({
  storage: mediaStorage,
  fileFilter: (req, file, cb) => {
    const mime = file.mimetype || '';
    const ext = path.extname(file.originalname).toLowerCase();

    const isVideo = mime.startsWith('video/') || ['.mp4', '.mov', '.webm', '.ogg', '.mkv'].includes(ext);
    const isImage = mime.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);

    if (isVideo || isImage) {
      console.log('Accepting upload:', file.fieldname, file.originalname, 'mimetype:', mime, 'ext:', ext);
      return cb(null, true);
    }

    console.log('Rejecting upload:', file.originalname, 'mimetype:', mime, 'ext:', ext);
    return cb(new Error('Only image and video files are allowed'));
  },
});

let skills = []; // in-memory fallback for POST when DB isn't enabled

// Helper to attach computed fields, saved and hidden options
function addComputedFields(skill) {
  return {
    ...skill,
    width: Math.floor(Math.random() * 80) + 150,
    height: Math.floor(Math.random() * 100) + 200,
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

  const dbEnabled = (process.env.USE_DB === 'true') || !!process.env.MONGODB_URI;

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
// POST /api/skills
// Accepts multiple `images` and `videos` (either uploaded files or arrays of URLs in the body)
// and persists a normalized Skill + SkillOffering when DB is enabled. Falls back to in-memory
// `skills` array when DB is not enabled.
router.post(
  '/',
  // accept multiple files under `images` and `videos` keys
  mediaUpload.fields([
    { name: 'images', maxCount: 12 },
    { name: 'videos', maxCount: 6 },
  ]),
  async (req, res) => {
    // Extract posted fields
    const {
      name,
      category,
      brief,
      detail,
      description,
      userId,
      username,
      offeringSlug,
    } = req.body;

    // Basic validation
    if (!name || !category) {
      return res.status(400).json({ error: 'name and category are required' });
    }

    // Normalize textual fields
    const finalDetail = detail || description || brief || '';
    const finalBrief = brief || (finalDetail.length > 120 ? finalDetail.slice(0, 117) + '...' : finalDetail);

    // Build arrays of image and video URLs from uploaded files (req.files) OR from body arrays/strings
    let imageUrls = [];
    let videoUrls = [];

    // Files uploaded via multipart/form-data will be in req.files
    if (req.files) {
      if (Array.isArray(req.files.images)) {
        imageUrls = req.files.images.map((f) => `/static/uploads/images/${f.filename}`);
      }
      if (Array.isArray(req.files.videos)) {
        videoUrls = req.files.videos.map((f) => `/static/uploads/videos/${f.filename}`);
      }
    }

    // If client provided images/videos as JSON arrays or comma-separated strings in the body,
    // accept those as fallback (useful when client uploads to cloud storage and sends URLs).
    if ((!imageUrls || imageUrls.length === 0) && req.body.images) {
      if (Array.isArray(req.body.images)) imageUrls = req.body.images;
      else if (typeof req.body.images === 'string') imageUrls = req.body.images.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if ((!videoUrls || videoUrls.length === 0) && req.body.videos) {
      if (Array.isArray(req.body.videos)) videoUrls = req.body.videos;
      else if (typeof req.body.videos === 'string') videoUrls = req.body.videos.split(',').map((s) => s.trim()).filter(Boolean);
    }

    // Ensure at least an empty array is stored (avoid undefined)
    imageUrls = imageUrls || [];
    videoUrls = videoUrls || [];

    const dbEnabled = (process.env.USE_DB === 'true') || !!process.env.MONGODB_URI;

    // If DB is enabled, persist normalized documents: Skill (master) and SkillOffering (offer)
    if (dbEnabled && Skill && SkillOffering) {
      try {
        // Find or create the Skill master document by name. We store the category in `categories`.
        let skillDoc = await Skill.findOne({ name: name }).exec();
        if (!skillDoc) {
          skillDoc = await Skill.create({ name: name, categories: [category] });
        }

        // Resolve the userId. If none provided or user not found, fall back to a demo user.
        let userObj = null;
        if (userId) {
          try {
            userObj = await User.findById(userId).exec();
          } catch (err) {
            userObj = null;
          }
        }
        if (!userObj) {
          userObj = await User.findOne({ username: username || 'demoUser' }).exec();
          if (!userObj) {
            // minimal demo user creation so SkillOffering.userId can be satisfied
            userObj = await User.create({ username: username || 'demoUser' });
          }
        }

        // Create the SkillOffering that references the Skill and User
        const offering = new SkillOffering({
          skillId: skillDoc._id,
          userId: userObj._id,
          offeringSlug: offeringSlug || (name.toLowerCase().replace(/\s+/g, '-')),
          description: finalDetail,
          images: imageUrls,
          videos: videoUrls,
        });

        await offering.save();

        // Map to the flat front-end payload shape (same as GET mapping). Keep `image` as first thumbnail
        const responseItem = addComputedFields({
          skillId: String(offering._id),
          id: String(offering._id),
          name: skillDoc.name,
          brief: finalBrief,
          detail: finalDetail,
          image: imageUrls.length ? imageUrls[0] : (userObj.photo || `https://via.placeholder.com/300x200?text=${encodeURIComponent(skillDoc.name)}`),
          images: imageUrls,
          videos: videoUrls,
          userId: String(userObj._id),
          username: userObj.username || username || 'demoUser',
          category: (skillDoc.categories && skillDoc.categories[0]) || category,
        });

        // Update lastSuccessfulSkillsCache to include this new item at the front (so fallback is more useful)
        try {
          if (!lastSuccessfulSkillsCache) lastSuccessfulSkillsCache = { items: [], totalCount: 0, ts: Date.now() };
          lastSuccessfulSkillsCache.items.unshift(responseItem);
          lastSuccessfulSkillsCache.totalCount = (lastSuccessfulSkillsCache.totalCount || 0) + 1;
          lastSuccessfulSkillsCache.ts = Date.now();
        } catch (e) {
          console.warn('Failed to update in-memory skills cache:', e && e.message ? e.message : e);
        }

        return res.status(201).json(responseItem);
      } catch (err) {
        console.error('Error saving skill offering to DB:', err && err.message ? err.message : err);
        // fallthrough to in-memory fallback below
      }
    }

    // Fallback (DB disabled or failed): keep previous in-memory behavior but include images/videos arrays
    const newSkillId = skills.length ? (skills[skills.length - 1].skillId + 1) : 1;
    const newSkill = addComputedFields({
      skillId: newSkillId,
      id: newSkillId,
      name,
      brief: finalBrief,
      detail: finalDetail,
      description: finalDetail,
      image: imageUrls.length ? imageUrls[0] : (`https://via.placeholder.com/300x200?text=${encodeURIComponent(name)}`),
      images: imageUrls,
      videos: videoUrls,
      userId: userId ?? 1,
      username: username || 'demoUser',
      category,
    });

    skills.push(newSkill);
    return res.status(201).json(newSkill);
  }
);


export default router;