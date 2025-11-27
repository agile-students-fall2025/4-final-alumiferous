import express from 'express';
import Chats from '../models/Chat.js';

const router = express.Router();

// GET /api/chats - get all chats
router.get('/', async (req, res) => {
  try {
    const chats = await Chats.find().populate('userId', 'username email');
    res.json(chats);
  } catch (err) {
    console.error('Error fetching chats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/chats - create a new chat
router.post('/', async (req, res) => {
  const { userId, lastMessage, unread, online } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId is required' });
  }
  try {
    const chat = new Chats({
      userId,
      lastMessage: lastMessage || '',
      unread: unread || 0,
      online: online || false,
    });
    await chat.save();
    res.status(201).json(chat);
  } catch (err) {
    console.error('Error creating chat:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/chats/:id - delete a chat
router.delete('/:id', async (req, res) => {
  try {
    const result = await Chats.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    res.json({ success: true, message: 'Chat deleted' });
  } catch (err) {
    console.error('Error deleting chat:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/chats/:id - update a chat
router.put('/:id', async (req, res) => {
  const { lastMessage, unread, online } = req.body;
  try {
    const chat = await Chats.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    if (lastMessage !== undefined) chat.lastMessage = lastMessage;
    if (unread !== undefined) chat.unread = unread;
    if (online !== undefined) chat.online = online;
    await chat.save();
    res.json(chat);
  } catch (err) {
    console.error('Error updating chat:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
