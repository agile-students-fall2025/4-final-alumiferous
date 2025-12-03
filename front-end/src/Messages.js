import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

// Constants
const API_BASE = 'http://localhost:3000/api';



// Format timestamp to HH:MM
const formatTime = (dateString) => {
  if (!dateString) return '';
  const dateObj = new Date(dateString);
  return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Normalize message data from API
const normalizeMessage = (item, userId, chatData = null) => ({
  id: item._id,
  chatId: String(item.chatId),
  content: item.content || '',
  timestamp: formatTime(item.sentAt || item.timestamp),
  is_me: item.senderId === userId,
  sender_name: item.senderName || 'User',
  sender_photo: item.senderPhoto || (chatData ? getSenderPhoto(item.senderId, chatData, userId) : '/images/avatar-default.png'),
});

// Helper to get sender photo from chat data
const getSenderPhoto = (senderId, chatData, currentUserId) => {
  if (!chatData?.userId || !chatData?.friendId) return '/images/avatar-default.png';
  
  const isCurrentUserFirst = chatData.userId._id === currentUserId;
  const currentUserData = isCurrentUserFirst ? chatData.userId : chatData.friendId;
  const otherUserData = isCurrentUserFirst ? chatData.friendId : chatData.userId;
  
  // If sender is current user, use current user's photo, otherwise use other user's photo
  const senderData = senderId === currentUserId ? currentUserData : otherUserData;
  return senderData?.profilePhoto || '/images/avatar-default.png';
};

const MessageItem = ({ sender_name, sender_photo, content, timestamp, is_me }) => {
  return (
    <div className={`flex gap-2 mb-4 ${is_me ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`max-w-[70%] ${is_me ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-[#2b2b2b] text-gray-900 dark:text-white'} rounded-2xl px-4 py-2`}>
        <div className="text-base">{content}</div>
        {timestamp && <div className="text-xs opacity-70 mt-1">{timestamp}</div>}
      </div>
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
  const [chatData, setChatData] = useState(null);

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

  // Mark messages as read
  const markMessagesAsRead = async () => {
    try {
      if (!id || !userId) return;
      
      await fetch(`${API_BASE}/chats/${id}/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      console.log('Messages marked as read');
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };

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
        
        // Mark messages as read when chat is opened
        markMessagesAsRead();
        
        return name;
      } catch (err) {
        console.error('Failed to load chat info:', err);
        if (isMounted) setError('Failed to load chat info');
        return null;
      }
    };

    const fetchMessages = async (chatData) => {
      try {
        const url = `${API_BASE}/messages?chat_id=${encodeURIComponent(id)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);

        const data = await res.json();
        const messagesArray = Array.isArray(data) ? data : [data];
        const normalized = messagesArray.map(item => normalizeMessage(item, userId, chatData));

        if (isMounted) setMessages(normalized);
      } catch (err) {
        console.error('Failed to load messages:', err);
        if (isMounted) setError('Failed to load messages');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const markMessagesAsRead = async () => {
      try {
        await fetch(`${API_BASE}/messages/mark-read`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId: id, userId }),
        });
      } catch (err) {
        console.error('Failed to mark messages as read:', err);
      }
    };

    const loadData = async () => {
      setLoading(true);
      const chatData = await fetchChatInfo();
      await fetchMessages(chatData);
      await markMessagesAsRead();
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
      
      // Get current user's photo for the new message
      const currentUserPhoto = chatData && chatData.userId && chatData.friendId
        ? (chatData.userId._id === userId ? chatData.userId.profilePhoto : chatData.friendId.profilePhoto)
        : '/images/avatar-default.png';
      
      setMessages(prev => [...prev, {
        id: newMsg._id,
        chatId: newMsg.chatId,
        content: newMsg.content,
        timestamp: formatTime(newMsg.sentAt || newMsg.timestamp),
        is_me: true,
        sender_name: 'You',
        sender_photo: currentUserPhoto || '/images/avatar-default.png',
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
    <div className="flex flex-col h-screen bg-white dark:bg-[#121212]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#333] bg-white dark:bg-[#121212]">
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => navigate('/chat')}>
          <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{chatSenderName}</h1>
        <div style={{ width: 32 }} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && <div className="text-center text-gray-500 dark:text-gray-400 py-8">Loading messages…</div>}
        {!loading && error && <div className="text-center text-danger py-8">{error}</div>}
        {!loading && !error && messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">No messages yet</div>
        )}
        {!loading && !error && messages.map(m => (
          <MessageItem key={m.id} {...m} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 dark:border-[#333] bg-white dark:bg-[#121212]" onSubmit={onSend}>
        <input
          type="text"
          className="form-input"
          placeholder="Type a message…"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          disabled={isSending}
        />
        <button type="submit" aria-label="Send" disabled={isSending} className="text-2xl text-primary hover:text-blue-700 dark:hover:text-blue-400 transition-colors disabled:opacity-50">
          {isSending ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  );
};

export default Messages;