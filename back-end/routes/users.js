import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import SkillOffering from '../models/SkillOffering.js';

const router = express.Router();

// GET /api/users/check-username?username=foo
// Returns { available: true } when the username is not present in the DB.
router.get('/check-username', async (req, res) => {
  const useDb = (process.env.USE_DB === 'true') || !!process.env.MONGODB_URI;
  const username = (req.query.username || '').toString().trim();
  if (!username) return res.status(400).json({ error: 'username query parameter is required' });

  if (!useDb) {
    // When DB is disabled for development, optimistically return available=true
    return res.json({ available: true });
  }

  try {
    // case-insensitive exact match
    const esc = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`^${esc}$`, 'i');
    const excludeId = req.query.excludeId;
    const q = { username: re };
    if (excludeId) q._id = { $ne: excludeId };
    const existing = await User.findOne(q).lean().exec();
    return res.json({ available: !existing });
  } catch (err) {
    console.error('Error checking username availability:', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'failed to check username' });
  }
});

// GET /api/users/:id/saved - return populated saved skills for a user
router.get('/:id/saved', async (req, res) => {
  const useDb = process.env.USE_DB === 'true';
  const userId = req.params.id;

  if (!useDb) {
    // DB disabled — return empty list so tests/dev without DB don't fail
    return res.json([]);
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ error: 'invalid user id' });

    const user = await User.findById(userId).populate({ path: 'savedSkills', populate: { path: 'skillId userId' } }).lean();
    if (!user) return res.status(404).json({ error: 'user not found' });

    const items = (user.savedSkills || []).map(off => {
      const skill = off.skillId || {};
      const owner = off.userId || {};
      const detail = Array.isArray(off.description) ? off.description.join('\n') : off.detail || off.description || '';
      const brief = off.brief || (detail.length > 120 ? detail.slice(0,117) + '...' : detail);
      const image = (Array.isArray(off.images) && off.images[0]) || off.image || owner.photo || `https://via.placeholder.com/300x200?text=${encodeURIComponent(skill.name || off.offeringSlug || 'Skill')}`;
      const id = off._id ? String(off._id) : null;

      return {
        skillId: id,
        id,
        name: skill.name || off.offeringSlug || 'Unknown Skill',
        brief,
        detail,
        image,
        userId: owner._id ? String(owner._id) : null,
        username: owner.username || off.username || 'demoUser',
        category: (skill.categories && skill.categories[0]) || skill.category || 'General',
        width: Math.floor(Math.random() * 80) + 150,
        height: Math.floor(Math.random() * 100) + 200,
        hidden: false,
      };
    });

    return res.json(items);
  } catch (err) {
    console.error('Error fetching user saved skills:', err);
    res.status(500).json({ error: 'failed to load saved skills' });
  }
});

// GET /api/users/:id/saved/ids - return array of saved offering ids (compact)
router.get('/:id/saved/ids', async (req, res) => {
  const useDb = process.env.USE_DB === 'true';
  const userId = req.params.id;

  if (!useDb) {
    return res.json([]);
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ error: 'invalid user id' });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: 'user not found' });

    const ids = (user.savedSkills || []).map(s => String(s));
    return res.json(ids);
  } catch (err) {
    console.error('Error fetching saved ids:', err);
    return res.status(500).json({ error: 'failed to load saved ids' });
  }
});

// POST /api/users/:id/saved - add a saved skill offering id to user
router.post('/:id/saved', async (req, res) => {
  const useDb = process.env.USE_DB === 'true';
  if (!useDb) {
    // DB disabled — respond with safe fallback
    return res.status(200).json({ success: false, savedSkills: [] });
  }

  try {
    const userId = req.params.id;
    const { skillId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(skillId)) return res.status(400).json({ error: 'invalid id' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'user not found' });

    const exists = user.savedSkills && user.savedSkills.some(s => String(s) === String(skillId));
    if (!exists) {
      user.savedSkills = user.savedSkills || [];
      user.savedSkills.push(skillId);
      await user.save();
    }

    return res.status(200).json({ success: true, savedSkills: user.savedSkills });
  } catch (err) {
    console.error('Error adding saved skill:', err);
    res.status(500).json({ error: 'failed to add saved skill' });
  }
});

// DELETE /api/users/:id/saved/:skillId - remove saved skill
router.delete('/:id/saved/:skillId', async (req, res) => {
  const useDb = process.env.USE_DB === 'true';
  if (!useDb) {
    // DB disabled — safe fallback
    return res.status(200).json({ success: false, savedSkills: [] });
  }

  try {
    const userId = req.params.id;
    const skillId = req.params.skillId;
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(skillId)) return res.status(400).json({ error: 'invalid id' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'user not found' });

    user.savedSkills = (user.savedSkills || []).filter(s => String(s) !== String(skillId));
    await user.save();

    return res.status(200).json({ success: true, savedSkills: user.savedSkills });
  } catch (err) {
    console.error('Error removing saved skill:', err);
    res.status(500).json({ error: 'failed to remove saved skill' });
  }
});

export default router;
