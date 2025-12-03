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
  const { chatId, content, senderId, sentAt } = req.body;
  if (!chatId || !content || !senderId) {
    return res.status(400).json({ success: false, message: 'chatId, content, and senderId are required' });
  }
  try {
    const message = new Message({
      chatId,
      content,
      senderId,
      sentAt: sentAt || new Date(),
      readBy: [], // Initialize empty readBy array
    });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/messages/mark-read - mark messages as read
router.put('/mark-read', async (req, res) => {
  const { chatId, userId } = req.body;
  if (!chatId || !userId) {
    return res.status(400).json({ success: false, message: 'chatId and userId are required' });
  }
  try {
    // Add userId to readBy array for all messages in this chat that were NOT sent by userId
    const result = await Message.updateMany(
      { chatId, senderId: { $ne: userId }, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
