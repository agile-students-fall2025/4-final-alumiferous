import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// GET /api/chats
router.get('/', async (req, res) => {
  const { chat_id } = req.query;
  if (!chat_id) {
    try {
      const url = `${process.env.API_BASE_URL}/chats.json?key=${process.env.API_SECRET_KEY}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Mockaroo request failed: ${response.status}`);
      const data = await response.json();
      res.json(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error('Error fetching chats:', err);
      res.status(500).json({ success: false, message: err.message });
    }
    return;
  }
  try {
    const url = `${process.env.API_BASE_URL}/messages.json?chat_id=${encodeURIComponent(chat_id)}&key=${process.env.API_SECRET_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Mockaroo request failed: ${response.status}`);
    const data = await response.json();
    res.json(Array.isArray(data) ? data : [data]);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// POST can remain as local echo or you can mock it similarly
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
