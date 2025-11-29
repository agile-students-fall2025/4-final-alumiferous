import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Messages.css';

// Constants
const API_BASE = 'http://localhost:3000/api';
const AVATAR_SIZE = 40;

// Helper avatar from Picsum
// const avatarUrl = (seed, size = AVATAR_SIZE) =>
//   `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}/${size}`;

// Format timestamp to HH:MM
const formatTime = (dateString) => {
  if (!dateString) return '';
  const dateObj = new Date(dateString);
  return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Normalize message data from API
const normalizeMessage = (item, userId) => ({
  id: item._id,
  chatId: String(item.chatId),
  content: item.content || '',
  timestamp: formatTime(item.sentAt || item.timestamp),
  is_me: item.senderId === userId,
});

const MessageItem = ({ sender_name, sender_photo, content, timestamp, is_me }) => {
  return (
    <div className={`message-item ${is_me ? 'mine' : 'theirs'}`}>
      {!is_me && <img className="avatar" src={sender_photo} alt={sender_name} />}
      <div className="bubble">
        <div className="content">{content}</div>
        {timestamp && <div className="meta">{timestamp}</div>}
      </div>
      {is_me && <img className="avatar" src={sender_photo} alt={sender_name} />}
    </div>
  );
};

const Messages = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState('');
  const [chatSenderName, setChatSenderName] = useState('');
  const [userId, setUserId] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize userId from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // Fetch chat and messages
  useEffect(() => {
    if (!id) {
      navigate('/chat', { replace: true });
      return;
    }

    if (!userId) return;

    let isMounted = true;

    const fetchChatInfo = async () => {
      try {
        const res = await fetch(`${API_BASE}/chats/${id}`);
        if (!res.ok) throw new Error('Failed to fetch chat');

        const chatData = await res.json();
        let name = 'Unknown';

        if (chatData?.userId && chatData?.friendId) {
          const isCurrentUserFirst = chatData.userId._id === userId;
          const otherUser = isCurrentUserFirst ? chatData.friendId : chatData.userId;
          name = otherUser?.username || otherUser?.email || 'Unknown';
        }

        if (isMounted) setChatSenderName(name);
        return name;
      } catch (err) {
        console.error('Failed to load chat info:', err);
        if (isMounted) setError('Failed to load chat info');
        return 'Unknown';
      }
    };

    const fetchMessages = async () => {
      try {
        const url = `${API_BASE}/messages?chat_id=${encodeURIComponent(id)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);

        const data = await res.json();
        const messagesArray = Array.isArray(data) ? data : [data];
        const normalized = messagesArray.map(item => normalizeMessage(item, userId));

        if (isMounted) setMessages(normalized);
      } catch (err) {
        console.error('Failed to load messages:', err);
        if (isMounted) setError('Failed to load messages');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const loadData = async () => {
      setLoading(true);
      await fetchChatInfo();
      await fetchMessages();
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, userId, navigate]);

  const onSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || isSending) return;

    setIsSending(true);
    try {
      const payload = {
        chatId: id,
        content: draft,
        senderId: userId,
        sentAt: new Date().toISOString(),
      };

      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to send message');

      const newMsg = await res.json();
      setMessages(prev => [...prev, {
        id: newMsg._id,
        chatId: newMsg.chatId,
        content: newMsg.content,
        timestamp: formatTime(newMsg.sentAt || newMsg.timestamp),
        is_me: true,
      }]);

      setDraft('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="messages-page">
      <div className="messages-header">
        <button className="back-btn" onClick={() => navigate('/chat')}>←</button>
        <h1 className="title">{chatSenderName}</h1>
        <div style={{ width: 32 }} />
      </div>

      <div className="messages-list">
        {loading && <div className="messages-empty">Loading messages…</div>}
        {!loading && error && <div className="messages-empty">{error}</div>}
        {!loading && !error && messages.length === 0 && (
          <div className="messages-empty">No messages yet</div>
        )}
        {!loading && !error && messages.map(m => (
          <MessageItem key={m.id} {...m} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="composer" onSubmit={onSend}>
        <input
          type="text"
          className="form-input"
          placeholder="Type a message…"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          disabled={isSending}
        />
        <button type="submit" aria-label="Send" disabled={isSending}>
          {isSending ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  );
};

export default Messages;