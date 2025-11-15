import express from 'express';
const router = express.Router();

// In-memory chat store (replace with DB in production)
let chats = [];

// GET /api/chats - get all chats for a user (optionally by user_id)
router.get('/', (req, res) => {
  const { user_id } = req.query;
  // For demo, return all chats; filter by user_id if provided
  const result = user_id ? chats.filter(c => c.user_id === user_id) : chats;
  res.json(result);
});

// POST /api/chats - create a new chat
router.post('/', (req, res) => {
  const { user_id, chat_name } = req.body;
  if (!user_id || !chat_name) {
    return res.status(400).json({ success: false, message: 'user_id and chat_name are required' });
  }
  const newChat = {
    id: Date.now().toString(),
    user_id,
    chat_name,
    created_at: new Date().toISOString(),
  };
  chats.push(newChat);
  res.status(201).json(newChat);
});

// DELETE /api/chats/:id - delete a chat
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = chats.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Chat not found' });
  }
  chats.splice(index, 1);
  res.json({ success: true, message: 'Chat deleted' });
});

// PUT /api/chats/:id - update a chat
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { chat_name } = req.body;
  const chat = chats.find(c => c.id === id);
  if (!chat) {
    return res.status(404).json({ success: false, message: 'Chat not found' });
  }
  if (chat_name) chat.chat_name = chat_name;
  res.json(chat);
});

export default router;
