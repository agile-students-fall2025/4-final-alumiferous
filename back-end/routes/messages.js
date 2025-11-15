
import express from 'express';
import fetch from 'node-fetch'; //for mockaroo
const router = express.Router();


// GET /api/messages?chat_id=...
router.get('/', async (req, res) => {
  console.log('Received GET /api/messages request with chat_id:', req.query.chat_id);
  const { chat_id } = req.query;
  if (!chat_id) {
    console.log('GET /api/messages missing chat_id');
    return res.status(400).json({ success: false, message: 'chat_id is required' });
  }
  try {
    const url = `${process.env.API_BASE_URL}/messages.json?chat_id=${encodeURIComponent(chat_id)}&key=${process.env.API_SECRET_KEY}`;
    console.log('Fetching messages from Mockaroo:', url);
    const response = await fetch(url);
    console.log('Mockaroo response status:', response.status);
    if (!response.ok) throw new Error(`Mockaroo request failed: ${response.status}`);
    const data = await response.json();
    console.log('Received messages data from Mockaroo:', data);
    res.json(Array.isArray(data) ? data : [data]);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// POST can remain as local echo or you can mock it similarly
router.post('/', (req, res) => {
  console.log('Received POST /api/messages request with body:', req.body);
  const { chat_id, sender_name, content } = req.body;
  if (!chat_id || !sender_name || !content) {
    console.log('POST /api/messages missing required fields');
    return res.status(400).json({ success: false, message: 'chat_id, sender_name, and content are required' });
  }
  const newMsg = {
    id: Date.now().toString(),
    chat_id,
    sender_name,
    sender_photo: `https://picsum.photos/seed/${encodeURIComponent(sender_name)}/40/40`,
    content,
    timestamp: new Date().toISOString(),
    is_me: false
  };
  console.log('Created new message:', newMsg);
  res.status(201).json(newMsg);
});

export default router;
