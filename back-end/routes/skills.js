// back-end/routes/skills.js
import express from "express";
// no external mock services — rely on MongoDB and in-memory cache
import multer from "multer";
import path from "path"; 
import cloudinary from '../config/cloudinary.js';
import SkillOffering from "../models/SkillOffering.js";
import Skill from "../models/Skill.js";
import User from "../models/User.js";
import jwt from 'jsonwebtoken';

const router = express.Router();

// Helper: create a URL-friendly slug from a name
function makeSlug(name) {
  if (!name) return `skill-${Date.now()}`;
  return name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ===== MULTER CONFIG FOR MULTIPLE IMAGES & VIDEOS =====
// We use a single diskStorage but choose destination based on the incoming fieldname
// so `images` will go to `public/uploads/images` and `videos` to `public/uploads/videos`.
// Cloudinary is configured centrally in `back-end/config/cloudinary.js` which
// reads env vars (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).
// Import that configured instance instead of calling `cloudinary.config()` here.
// Use memory storage so we can upload incoming files directly to Cloudinary
const memoryStorage = multer.memoryStorage();

// Basic file filter that accepts common image/video types. We allow both images and videos
// because the front-end may upload either under the `images` or `videos` field.
const mediaUpload = multer({
  storage: memoryStorage,
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

// Helper to upload a buffer to Cloudinary. We convert the buffer to a data URI
// and call cloudinary.uploader.upload which supports both images and videos.
async function uploadBufferToCloudinary(file, resourceType = 'image') {
  // Convert buffer to data URI: data:<mimetype>;base64,<base64data>
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const options = {
    folder: 'instaskill/users',
    resource_type: resourceType,
    use_filename: true,
    unique_filename: false,
  };

  // cloudinary.uploader.upload returns a promise
  const result = await cloudinary.uploader.upload(dataUri, options);
  return result.secure_url;
}

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
 */
let lastSuccessfulSkillsCache = null; // { items: [...], totalCount: number, ts: Date }

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const { search, category } = req.query;

  // Try DB first
  if (SkillOffering && typeof SkillOffering.find === 'function') {
    try {
      const skip = (page - 1) * limit;
      
      // Build MongoDB query based on search and category filters
      let query = {};
      
      if (search && search.trim()) {
        // Search in offering name AND categories
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { categories: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (category && category.trim()) {
        // Filter by category (case-insensitive)
        query.categories = { $regex: `^${category}$`, $options: 'i' };
      }
      
      const [docs, totalCount] = await Promise.all([
        SkillOffering.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('skillId')
          .populate('userId')
          .lean(),
        SkillOffering.countDocuments(query),
      ]);

      const items = docs.map((off) => {
        const skill = off.skillId || {};
        const user = off.userId || {};
        const detail = Array.isArray(off.description) ? off.description.join('\n') : off.detail || off.description || '';
        const brief = off.brief || (detail.length > 120 ? detail.slice(0, 117) + '...' : detail);

        // normalize arrays: ensure `images` and `videos` are arrays (for older docs with single `image`)
        const images = Array.isArray(off.images) ? off.images : (off.images ? [off.images] : []);
        const videos = Array.isArray(off.videos) ? off.videos : (off.videos ? [off.videos] : []);

        // keep legacy `image` as the first thumbnail for compatibility
        const image = (images.length && images[0]) || off.image || user.photo || `https://via.placeholder.com/300x200?text=${encodeURIComponent(skill.name || off.offeringSlug || 'Skill')}`;
        const id = off._id ? String(off._id) : null;

        // Build username from available user data
        const username = user.username || 
                        (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}`.trim() : null) ||
                        user.firstName || 
                        user.email?.split('@')[0] || 
                        'Anonymous';

        return {
          skillId: id,
          id,
          // Prefer offering title if available, otherwise fall back to canonical skill name
          name: off.name || skill.name || off.offeringSlug || 'Unknown Skill',
          // include canonical/general skill for grouping if needed
          generalSkill: skill.name || null,
          brief,
          detail,
          image,
          images,
          videos,
          userId: user._id ? String(user._id) : null,
          username: username,
          category: (off.categories && off.categories[0]) || (skill.categories && skill.categories[0]) || skill.category || 'General',
          categories: off.categories || skill.categories || (skill.category ? [skill.category] : ['General']),
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

// GET /api/skills/:id  -> get a single skill by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const off = await SkillOffering.findById(id)
      .populate('skillId')
      .populate('userId')
      .lean()
      .exec();
      
    if (!off) {
      return res.status(404).json({ error: "Skill not found" });
    }
    
    // Use the same normalization logic as the GET list endpoint
    const skill = off.skillId || {};
    const user = off.userId || {};
    const detail = Array.isArray(off.description) ? off.description.join('\n') : off.detail || off.description || '';
    const brief = off.brief || (detail.length > 120 ? detail.slice(0, 117) + '...' : detail);

    // normalize arrays: ensure `images` and `videos` are arrays
    const images = Array.isArray(off.images) ? off.images : (off.images ? [off.images] : []);
    const videos = Array.isArray(off.videos) ? off.videos : (off.videos ? [off.videos] : []);

    // keep legacy `image` as the first thumbnail for compatibility
    const image = (images.length && images[0]) || off.image || user.photo || `https://via.placeholder.com/300x200?text=${encodeURIComponent(skill.name || off.offeringSlug || 'Skill')}`;

    // Build username from available user data
    const username = user.username || 
                    (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}`.trim() : null) ||
                    user.firstName || 
                    user.email?.split('@')[0] || 
                    'Anonymous';

    const normalizedSkill = {
      skillId: String(off._id),
      id: String(off._id),
      _id: String(off._id),
      name: off.name || skill.name || off.offeringSlug || 'Unknown Skill',
      generalSkill: skill.name || null,
      brief,
      detail,
      description: detail,
      image,
      images,
      videos,
      userId: user._id ? String(user._id) : null,
      username: username,
      category: (off.categories && off.categories[0]) || (skill.categories && skill.categories[0]) || skill.category || 'General',
      categories: off.categories || skill.categories || (skill.category ? [skill.category] : ['General']),
    };
    
    res.json(normalizedSkill);
  } catch (err) {
    console.error("Error fetching skill by ID:", err);
    res.status(500).json({ error: "Failed to fetch skill" });
  }
});

// DELETE /api/skills/:id  -> delete a single skill
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SkillOffering.findByIdAndDelete(id).exec();
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting skill:", err);
    res.status(500).json({ success: false, message: "Failed to delete skill" });
  }
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
    // Support both the new contract and older fields for backward-compatibility.
    // `generalSkill` -> the canonical skill name used to find/create a `Skill` document
    // `skillName` -> the offering title typed by the user (stored on SkillOffering.name)
    const {
      generalSkill,
      skillName,
      categories,
      name, // legacy: previously `name` was used as the general skill
      category, // legacy single category
      brief,
      detail,
      description,
      userId,
      username,
      offeringSlug,
    } = req.body;

    // Basic validation
    // Validate incoming payload: require a general skill (selected option) and an offering title
    const general = (generalSkill || name || '').trim();
    const offeringTitle = (skillName || name || '').trim();
    if (!general || !offeringTitle) {
      return res.status(400).json({ error: 'generalSkill (selected) and skillName (title) are required' });
    }

    // Normalize textual fields
    const finalDetail = detail || description || brief || '';
    const finalBrief = brief || (finalDetail.length > 120 ? finalDetail.slice(0, 117) + '...' : finalDetail);

    // Build arrays of image and video URLs from uploaded files (req.files) OR from body arrays/strings
    let imageUrls = [];
    let videoUrls = [];

    // Files uploaded via multipart/form-data will be in req.files (memory buffers).
    // Upload them to Cloudinary and collect the returned secure URLs. If Cloudinary
    // uploads fail for any file, we continue and let fallback body-provided URLs be used.
    if (req.files) {
      try {
        if (Array.isArray(req.files.images) && req.files.images.length) {
          // upload each image buffer to Cloudinary as `image` resource
          imageUrls = await Promise.all(
            req.files.images.map(async (f) => await uploadBufferToCloudinary(f, 'image'))
          );
        }
        if (Array.isArray(req.files.videos) && req.files.videos.length) {
          // upload each video buffer to Cloudinary as `video` resource
          videoUrls = await Promise.all(
            req.files.videos.map(async (f) => await uploadBufferToCloudinary(f, 'video'))
          );
        }
      } catch (uploadErr) {
        console.warn('Cloudinary upload failed:', uploadErr && uploadErr.message ? uploadErr.message : uploadErr);
        // allow fallback to body-provided URLs below
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

    // If DB is available, persist normalized documents: Skill (master) and SkillOffering (offer)
    if (Skill && SkillOffering) {
      try {
        // Resolve (find or create) the canonical Skill document using the selected `generalSkill`.
        const generalSlug = makeSlug(general);
        let skillDoc = await Skill.findOne({ slug: generalSlug }).exec();
        if (!skillDoc) {
          // ensure slug uniqueness
          let slug = generalSlug;
          const exists = await Skill.findOne({ slug }).exec();
          if (exists) slug = `${generalSlug}-${Date.now()}`;
          // Create the Skill using the general skill name. We won't try to infer categories here;
          // the offering will carry its `categories` array.
          skillDoc = await Skill.create({ name: general, slug, categories: Array.isArray(categories) ? categories : (categories ? String(categories).split(',').map(s => s.trim()).filter(Boolean) : []) });
        }

        // Resolve the user from the JWT in Authorization header. Do not create demo users.
        // The front-end must include a valid JWT in `Authorization: jwt <token>` or `Authorization: Bearer <token>`.
        let userObj = null;
        try {
          const auth = (req.headers && req.headers.authorization) ? req.headers.authorization : null;
          if (!auth) {
            return res.status(401).json({ error: 'Authentication required to create a skill offering' });
          }

          // support schemes like "jwt <token>" or "Bearer <token>"
          const token = auth.split(' ')[1] || auth;
          const payload = jwt.verify(token, process.env.JWT_SECRET);
          if (!payload || !payload.id) {
            return res.status(401).json({ error: 'Invalid authentication token' });
          }
          userObj = await User.findById(payload.id).exec();
          if (!userObj) {
            return res.status(401).json({ error: 'Authenticated user not found' });
          }
        } catch (authErr) {
          console.error('Auth error when resolving user for POST /api/skills:', authErr && authErr.message ? authErr.message : authErr);
          return res.status(401).json({ error: 'Authentication failed' });
        }

        // Parse categories for the offering (may be an array or a comma-separated string)
        let offeringCategories = [];
        if (Array.isArray(categories) && categories.length) offeringCategories = categories;
        else if (typeof categories === 'string' && categories.length) offeringCategories = categories.split(',').map(s => s.trim()).filter(Boolean);
        else if (category) offeringCategories = [category];

        // Create the SkillOffering that references the Skill and User. Use the front-end typed title
        // as `name` (offering title). Keep offeringSlug derived from the offering title if not provided.
        const offering = new SkillOffering({
          name: offeringTitle,
          skillId: skillDoc._id,
          userId: userObj._id,
          offeringSlug: offeringSlug || offeringTitle.toLowerCase().replace(/\s+/g, '-'),
          description: finalDetail,
          images: imageUrls,
          videos: videoUrls,
          categories: offeringCategories,
        });

        await offering.save();

        // Add offering id to user's offeredSkills and persist
        try {
          userObj.offeredSkills = userObj.offeredSkills || [];
          userObj.offeredSkills.push(offering._id);
          await userObj.save();
        } catch (userSaveErr) {
          console.warn('Failed to append offering to user.offeredSkills:', userSaveErr && userSaveErr.message ? userSaveErr.message : userSaveErr);
        }

        // Map to the flat front-end payload shape (same as GET mapping). Keep `image` as first thumbnail
        const responseItem = addComputedFields({
          skillId: String(offering._id),
          id: String(offering._id),
          // show the offering title as primary name for the UI
          name: offering.name,
          // include the canonical/general skill name for grouping
          generalSkill: skillDoc.name,
          brief: finalBrief,
          detail: finalDetail,
          image: imageUrls.length ? imageUrls[0] : (userObj.photo || `https://via.placeholder.com/300x200?text=${encodeURIComponent(skillDoc.name)}`),
          images: imageUrls,
          videos: videoUrls,
          userId: String(userObj._id),
          username: userObj.username || null,
          category: (offering.categories && offering.categories[0]) || (skillDoc.categories && skillDoc.categories[0]) || category,
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

// ===== UPDATE SKILL =====
router.put('/:skillId', mediaUpload.fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 5 }]), async (req, res) => {
  try {
    const { skillId } = req.params;
    const { name, brief, detail, categories, removedImages, removedVideos } = req.body;

    console.log('PUT /api/skills/:skillId received:', { skillId, name, brief, detail, categories, removedImages, removedVideos });

    // Find skill in MongoDB - handle both ObjectId and numeric skillId
    let skillOffering;
    
    // Check if it's a MongoDB ObjectId (24 hex characters)
    if (skillId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Searching by MongoDB _id:', skillId);
      skillOffering = await SkillOffering.findById(skillId);
    } else {
      // Otherwise treat it as numeric skillId
      console.log('Searching by numeric skillId:', parseInt(skillId));
      skillOffering = await SkillOffering.findOne({ skillId: parseInt(skillId) });
    }
    
    if (!skillOffering) {
      console.log('Skill not found for skillId:', skillId);
      return res.status(404).json({ error: 'Skill not found' });
    }

    console.log('Found skill offering:', skillOffering._id);

    // Update text fields
    if (name !== undefined) skillOffering.name = name;
    if (brief !== undefined) skillOffering.brief = brief;
    if (detail !== undefined) skillOffering.detail = detail;
    
    // Handle categories - can be comma-separated string or array
    if (categories !== undefined) {
      if (typeof categories === 'string') {
        skillOffering.categories = categories.split(',').map(c => c.trim()).filter(c => c);
      } else if (Array.isArray(categories)) {
        skillOffering.categories = categories;
      }
    }

    // Handle removed images
    if (removedImages) {
      const toRemove = typeof removedImages === 'string' 
        ? removedImages.split(',').map(url => url.trim()).filter(url => url)
        : (Array.isArray(removedImages) ? removedImages : []);
      
      if (toRemove.length > 0) {
        console.log('Removing images:', toRemove);
        console.log('Before removal - skillOffering.images:', skillOffering.images);
        skillOffering.images = (skillOffering.images || []).filter(img => !toRemove.includes(img));
        console.log('After removal - skillOffering.images:', skillOffering.images);
      }
    }

    // Handle removed videos
    if (removedVideos) {
      const toRemove = typeof removedVideos === 'string'
        ? removedVideos.split(',').map(url => url.trim()).filter(url => url)
        : (Array.isArray(removedVideos) ? removedVideos : []);
      
      if (toRemove.length > 0) {
        console.log('Removing videos:', toRemove);
        console.log('Before removal - skillOffering.videos:', skillOffering.videos);
        skillOffering.videos = (skillOffering.videos || []).filter(vid => !toRemove.includes(vid));
        console.log('After removal - skillOffering.videos:', skillOffering.videos);
      }
    }

    // Handle new image uploads
    if (req.files && req.files.images) {
      const imageUrls = [];
      for (const file of req.files.images) {
        try {
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'skills/images', resource_type: 'image' },
              (error, result) => error ? reject(error) : resolve(result)
            );
            uploadStream.end(file.buffer);
          });
          imageUrls.push(result.secure_url);
        } catch (err) {
          console.error('Error uploading image to Cloudinary:', err);
        }
      }
      // Append new images to existing ones
      skillOffering.images = [...(skillOffering.images || []), ...imageUrls];
    }

    // Handle new video uploads
    if (req.files && req.files.videos) {
      const videoUrls = [];
      for (const file of req.files.videos) {
        try {
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'skills/videos', resource_type: 'video' },
              (error, result) => error ? reject(error) : resolve(result)
            );
            uploadStream.end(file.buffer);
          });
          videoUrls.push(result.secure_url);
        } catch (err) {
          console.error('Error uploading video to Cloudinary:', err);
        }
      }
      // Append new videos to existing ones
      skillOffering.videos = [...(skillOffering.videos || []), ...videoUrls];
    }

    await skillOffering.save();
    console.log('Skill offering saved successfully');

    // Also update the Skill model if it exists
    const updateResult = await Skill.updateMany(
      { offeringSlug: skillOffering.offeringSlug },
      {
        $set: {
          name: skillOffering.name,
          brief: skillOffering.brief,
          detail: skillOffering.detail,
          categories: skillOffering.categories,
          images: skillOffering.images,
          videos: skillOffering.videos
        }
      }
    );
    console.log('Skill model update result:', updateResult);

    res.json({ message: 'Skill updated successfully', skill: skillOffering });
  } catch (error) {
    console.error('Error updating skill:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to update skill', details: error.message });
  }
});



export default router;