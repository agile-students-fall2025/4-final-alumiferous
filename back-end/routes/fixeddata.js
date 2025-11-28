import express from 'express';
import FixedData from '../models/FixedData.js';

const router = express.Router();

// GET /api/fixeddata
// Returns a single fixed-data document containing canonical generalNames and categories
router.get('/', async (req, res) => {
  try {
    const doc = await FixedData.findOne({}).lean();
    if (!doc) {
      return res.json({ generalNames: [], categories: [] });
    }
    return res.json({ generalNames: doc.generalNames || [], categories: doc.categories || [] });
  } catch (err) {
    console.error('Failed to fetch fixeddata:', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'Failed to fetch fixed data' });
  }
});

export default router;
