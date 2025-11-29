import express from "express";
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinary.js';
import User from '../models/User.js';
import Skill from '../models/Skill.js';

const router = express.Router();

// multer memory storage for single profile photo upload
const memoryStorage = multer.memoryStorage();
const upload = multer({
  storage: memoryStorage,
  fileFilter: (req, file, cb) => {
    const mime = file.mimetype || '';
    const ext = path.extname(file.originalname || '').toLowerCase();
    const isImage = mime.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    if (isImage) return cb(null, true);
    return cb(new Error('Only image files are allowed for profile photo'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper: create a slug
function makeSlug(name) {
  if (!name) return `skill-${Date.now()}`;
  return name.toString().trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

// Helper: upload buffer to Cloudinary
async function uploadBufferToCloudinary(file, resourceType = 'image') {
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const options = {
    folder: 'instaskill/users',
    resource_type: resourceType,
    use_filename: true,
    unique_filename: false,
  };
  const result = await cloudinary.uploader.upload(dataUri, options);
  return result.secure_url;
}

/**
 * POST /api/onboarding
 * Authenticated endpoint that updates the signed-in user's profile fields:
 * - username (must be unique)
 * - neededSkills (array of general skill names -> resolves/creates Skill docs)
 * - bio
 * - photo (multipart file) uploaded to Cloudinary
 */
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    // Authenticate
    const auth = (req.headers && req.headers.authorization) ? req.headers.authorization : null;
    if (!auth) return res.status(401).json({ error: 'Authentication required' });
    const token = auth.split(' ')[1] || auth;
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await User.findById(payload.id).exec();
    if (!user) return res.status(401).json({ error: 'Authenticated user not found' });

    // Parse fields (support multiple naming conventions)
    const username = (req.body.username || req.body.userName || req.body.displayName || '').trim();
    const bio = req.body.bio || req.body.about || '';
    let needed = req.body.neededSkills || req.body.skillsWanted || req.body.skillsNeeded || req.body.skills;
    // needed may be JSON string, CSV string, or array
    if (typeof needed === 'string') {
      // try JSON parse
      try { needed = JSON.parse(needed); } catch (e) {
        // fall back to CSV
        needed = needed.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    if (!Array.isArray(needed)) needed = [];

    // Validate and set username uniqueness (allow keeping the same username)
    if (username) {
      // Enforce minimum length
      if (String(username).trim().length < 4) {
        return res.status(400).json({ error: 'Username must be at least 4 characters' });
      }
      // Case-insensitive exact match for username uniqueness
      const esc = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`^${esc}$`, 'i');
      const existing = await User.findOne({ username: re }).exec();
      if (existing && String(existing._id) !== String(user._id)) {
        return res.status(409).json({ error: 'Username already taken' });
      }
      user.username = username;
    }

    // Resolve needed skills (Option A: create missing Skill documents)
    const skillIds = [];
    for (const name of needed) {
      const nm = (name || '').toString().trim();
      if (!nm) continue;
      const slug = makeSlug(nm);
      let skill = await Skill.findOne({ slug }).exec();
      if (!skill) {
        // create new Skill document
        let uniqueSlug = slug;
        const exists = await Skill.findOne({ slug: uniqueSlug }).exec();
        if (exists) uniqueSlug = `${slug}-${Date.now()}`;
        skill = await Skill.create({ name: nm, slug: uniqueSlug });
      }
      skillIds.push(skill._id);
    }
    user.neededSkills = skillIds;

    // Photo upload
    if (req.file) {
      try {
        const url = await uploadBufferToCloudinary(req.file, 'image');
        user.photo = url;
      } catch (uploadErr) {
        console.warn('Photo upload failed:', uploadErr && uploadErr.message ? uploadErr.message : uploadErr);
        // don't block onboarding for a failed upload; return a warning in response
      }
    }

    // Bio
    if (bio) user.bio = bio;

    await user.save();

    // Return safe user object (no password)
    const safe = {
      _id: user._id,
      email: user.email,
      username: user.username,
      photo: user.photo,
      bio: user.bio,
      neededSkills: user.neededSkills,
      offeredSkills: user.offeredSkills,
      savedSkills: user.savedSkills,
    };

    return res.json({ user: safe });
  } catch (err) {
    console.error('Onboarding error:', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'Onboarding failed' });
  }
});

export default router;

