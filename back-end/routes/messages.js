import express from 'express';
import Message from '../models/Message.js';

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
    const messages = await Message.find({ chatId: chat_id });
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// POST /api/messages
router.post('/', async (req, res) => {
  const { chatId, content, isMe, sentAt } = req.body;
  if (!chatId || !content) {
    return res.status(400).json({ success: false, message: 'chatId and content are required' });
  }
  try {
    const message = new Message({
      chatId,
      content,
      isMe: !!isMe,
      sentAt: sentAt || new Date(),
    });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
