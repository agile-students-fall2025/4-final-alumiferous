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
    const chats = await Chats.find(query).populate('userId', 'username email photo').populate('friendId', 'username email photo');
    // For each chat, calculate lastMessage and unread from messages
    const Message = (await import('../models/Message.js')).default;
    const chatData = await Promise.all(chats.map(async chat => {
      // Find last message
      const lastMsg = await Message.findOne({ chatId: chat._id }).sort({ sentAt: -1 });
      // Count unread messages (messages not sent by userId AND not in readBy array)
      let unreadCount = 0;
      if (req.query.userId) {
        unreadCount = await Message.countDocuments({ 
          chatId: chat._id, 
          senderId: { $ne: req.query.userId },
          readBy: { $ne: req.query.userId } // Not marked as read by this user
        });
      }
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
  const { userId, friendId } = req.body;
  if (!userId || !friendId) {
    return res.status(400).json({ success: false, message: 'userId and friendId are required' });
  }
  try {
    const chat = new Chats({
      userId,
      friendId,
    });
    await chat.save();
    res.status(201).json(chat);
  } catch (err) {
    console.error('Error creating chat:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/chats/find-or-create - find existing chat or create new one
router.post('/find-or-create', async (req, res) => {
  const { userId, friendId } = req.body;
  
  if (!userId || !friendId) {
    return res.status(400).json({ success: false, message: 'userId and friendId are required' });
  }
  
  try {
    // Try to find existing chat between these two users (in either direction)
    let chat = await Chats.findOne({
      $or: [
        { userId: userId, friendId: friendId },
        { userId: friendId, friendId: userId }
      ]
    }).populate('userId', 'username email firstName lastName photo').populate('friendId', 'username email firstName lastName photo');
    
    // If chat doesn't exist, create a new one
    if (!chat) {
      chat = new Chats({
        userId,
        friendId,
      });
      await chat.save();
      
      // Populate the user fields after saving
      chat = await Chats.findById(chat._id)
        .populate('userId', 'username email firstName lastName photo')
        .populate('friendId', 'username email firstName lastName photo');
    }
    
    // Get last message and unread count
    const Message = (await import('../models/Message.js')).default;
    const lastMsg = await Message.findOne({ chatId: chat._id }).sort({ sentAt: -1 });
    let unreadCount = 0;
    if (userId) {
      unreadCount = await Message.countDocuments({ 
        chatId: chat._id, 
        senderId: { $ne: userId },
        readBy: { $ne: userId }
      });
    }
    
    const chatObj = {
      ...chat.toObject(),
      lastMessage: lastMsg ? lastMsg.content : '',
      lastMessageTime: lastMsg ? lastMsg.sentAt || lastMsg.timestamp : null,
      unread: unreadCount,
    };
    
    res.json(chatObj);
  } catch (err) {
    console.error('Error finding or creating chat:', err);
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
  const { lastMessage, unread } = req.body;
  try {
    const chat = await Chats.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    if (lastMessage !== undefined) chat.lastMessage = lastMessage;
    if (unread !== undefined) chat.unread = unread;
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
      .populate('userId', 'username email photo')
      .populate('friendId', 'username email photo');
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    // Find last message and unread count for this chat
    const Message = (await import('../models/Message.js')).default;
    const lastMsg = await Message.findOne({ chatId: chat._id }).sort({ sentAt: -1 });
    let unreadCount = 0;
    if (req.query.userId) {
      unreadCount = await Message.countDocuments({ 
        chatId: chat._id, 
        senderId: { $ne: req.query.userId },
        readBy: { $ne: req.query.userId } // Not marked as read
      });
    }
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

// POST /api/chats/:id/mark-read - mark all messages in a chat as read for a user
router.post('/:id/mark-read', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }
    
    const Message = (await import('../models/Message.js')).default;
    
    // Update all messages in this chat that were NOT sent by userId to mark them as read
    // We'll add a 'readBy' array field to messages to track who has read them
    const result = await Message.updateMany(
      { 
        chatId: req.params.id, 
        senderId: { $ne: userId },
        readBy: { $ne: userId } // Only update if not already marked as read by this user
      },
      { 
        $addToSet: { readBy: userId } // Add userId to readBy array
      }
    );
    
    res.json({ 
      success: true, 
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount 
    });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
