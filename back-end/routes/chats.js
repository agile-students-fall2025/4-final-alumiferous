import express from 'express';
import Chats from '../models/Chat.js';

const router = express.Router();

// GET /api/chats - get all chats
router.get('/', async (req, res) => {
  try {
    // Get logged-in userId from query string
    const { userId } = req.query;
    let query = {};
    if (userId) {
      query = { $or: [ { userId }, { friendId: userId } ] };
    }
    const chats = await Chats.find(query).populate('userId', 'username email').populate('friendId', 'username email');
    // For each chat, calculate lastMessage and unread from messages
    const Message = (await import('../models/Message.js')).default;
    const chatData = await Promise.all(chats.map(async chat => {
      // Find last message
      const lastMsg = await Message.findOne({ chatId: chat._id }).sort({ sentAt: -1 });
      // Count unread messages
      const unreadCount = await Message.countDocuments({ chatId: chat._id, isMe: false });
      return {
        ...chat.toObject(),
        lastMessage: lastMsg ? lastMsg.content : '',
        lastMessageTime: lastMsg ? lastMsg.sentAt || lastMsg.timestamp : null,
        unread: unreadCount,
      };
    }));
    res.json(chatData);
  } catch (err) {
    console.error('Error fetching chats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/chats - create a new chat
router.post('/', async (req, res) => {
  const { userId, friendId, online } = req.body;
  if (!userId || !friendId) {
    return res.status(400).json({ success: false, message: 'userId and friendId are required' });
  }
  try {
    const chat = new Chats({
      userId,
      friendId,
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

// GET /api/chats/:id - get a single chat by ID
router.get('/:id', async (req, res) => {
  try {
    const chat = await Chats.findById(req.params.id)
      .populate('userId', 'username email')
      .populate('friendId', 'username email');
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    // Find last message and unread count for this chat
    const Message = (await import('../models/Message.js')).default;
    const lastMsg = await Message.findOne({ chatId: chat._id }).sort({ sentAt: -1 });
    const unreadCount = await Message.countDocuments({ chatId: chat._id, isMe: false });
    const chatObj = {
      ...chat.toObject(),
      lastMessage: lastMsg ? lastMsg.content : '',
      lastMessageTime: lastMsg ? lastMsg.sentAt || lastMsg.timestamp : null,
      unread: unreadCount,
    };
    res.json(chatObj);
  } catch (err) {
    console.error('Error fetching chat:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
