import express from 'express';
const router = express.Router();

// In-memory message store (replace with DB in production)
let messages = [];

// GET /api/messages?chat_id=...
router.get('/', (req, res) => {
  const { chat_id } = req.query;
  if (!chat_id) {
    return res.status(400).json({ success: false, message: 'chat_id is required' });
  }
  const chatMessages = messages.filter(m => m.chat_id === chat_id);
  res.json(chatMessages);
});

// POST /api/messages
router.post('/', (req, res) => {
  const { chat_id, sender_name, content } = req.body;
  if (!chat_id || !sender_name || !content) {
    return res.status(400).json({ success: false, message: 'chat_id, sender_name, and content are required' });
  }
  const newMsg = {
    id: Date.now().toString(),
    chat_id,
    sender_name,
    sender_photo: `https://picsum.photos/seed/${encodeURIComponent(sender_name)}/40/40`,
    content,
    timestamp: new Date().toISOString(),
    is_me: false // Set based on user authentication in production
  };
  messages.push(newMsg);
  res.status(201).json(newMsg);
});

export default router;
