import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './Messages.css'

// Helper avatar from Picsum
const avatarUrl = (seed, size = 40) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}/${size}`


const Messages = () => {
    const { id } = useParams() // chat id
    const navigate = useNavigate()

    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [draft, setDraft] = useState('')
    const [chatSenderName, setChatSenderName] = useState('')
    const [userId, setUserId] = useState('')
      

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) setUserId(storedUserId);
    }, []);

    useEffect(() => {
        let isMounted = true;
        const fetchChatInfo = async () => {
            try {
                if (!id) {
                    navigate('/chat', { replace: true });
                    return;
                }
                setLoading(true);
                setError(null);
                const chatRes = await fetch(`http://localhost:3000/api/chats/${id}`);
                let chatData = null;
                let name = '';
                if (chatRes.ok) {
                    chatData = await chatRes.json();
                    // console.log('Fetched chatData:', chatData); // Debug log
                    if (chatData.userId && chatData.friendId) {
                        if (chatData.userId._id === userId && typeof chatData.friendId === 'object') {
                            name = chatData.friendId.username || chatData.friendId.email || 'Unknown';
                        } else if (chatData.friendId._id === userId && typeof chatData.userId === 'object') {
                            name = chatData.userId.username || chatData.userId.email || 'Unknown';
                        }
                    }
                }
                setChatSenderName(name);
                return name;
            } catch (err) {
                console.error('Failed to load chat info:', err);
                if (isMounted) setError('Failed to load chat info');
                return 'Unknown';
            }
        };

        const fetchMessages = async (senderName) => {
            try {
                console.log('Fetching messages from backend for chat:', id);
                const url = `http://localhost:3000/api/messages?chat_id=${encodeURIComponent(id)}`;
                const res = await fetch(url);
                console.log('Response status:', res.status);
                if (!res.ok) throw new Error(`Request failed: ${res.status}`);
                const data = await res.json();
                const array = Array.isArray(data) ? data : [data];
                const normalized = array.map((item) => {
                    const content = item.content || '';
                    let ts = item.sentAt || item.timestamp || '';
                    if (ts) {
                        const dateObj = new Date(ts);
                        ts = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }
                    // let senderNameFinal = senderName;
                    // if (!item.isMe && item.sender && (item.sender.username || item.sender.email)) {
                    //     senderNameFinal = item.sender.username || item.sender.email;
                    // }
                    // if (!senderNameFinal) senderNameFinal = 'Unknown';
                    return {
                        id: item._id,
                        chatId: String(item.chatId) || String(id),
                        // sender_name: item.isMe ? 'You' : senderNameFinal,
                        // sender_photo: avatarUrl(item.isMe ? 'You' : senderNameFinal),
                        content,
                        timestamp: ts,
                        is_me: !!item.isMe,
                    };
                });
                if (isMounted) {
                    setMessages(normalized);
                }
            } catch (err) {
                console.error('Failed to load messages:', err);
                if (isMounted) setError('Failed to load messages');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        (async () => {
            const senderName = await fetchChatInfo();
            await fetchMessages(senderName);
        })();

        return () => {
            isMounted = false;
        };
    }, [id, navigate, userId]);

    const onSend = async (e) => {
        e.preventDefault()
        if (!draft.trim()) return
        try {
            const now = new Date()
            const payload = {
                chatId: id,
                content: draft,
                isMe: true,
                sentAt: now.toISOString(),
            }
            console.log({ chatId: id, content: draft });
            const res = await fetch('http://localhost:3000/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (!res.ok) throw new Error('Failed to send message')
            const newMsg = await res.json()
            // Format timestamp to show only time (HH:MM)
            let ts = newMsg.sentAt || newMsg.timestamp || '';
            if (ts) {
                const dateObj = new Date(ts);
                ts = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            setMessages(prev => [...prev, {
                id: newMsg._id,
                chatId: newMsg.chatId,
                sender_name: 'You',
                sender_photo: avatarUrl('You'),
                content: newMsg.content,
                timestamp: ts,
                is_me: true,
            }])
            setDraft('')
        } catch (err) {
            setError('Failed to send message')
        }
    }


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
            </div>

            <form className="composer" onSubmit={onSend}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Type a message…"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                />
                <button type="submit" aria-label="Send">➤</button>
            </form>
        </div>
    )
}

const MessageItem = ({ sender_name, sender_photo, content, timestamp, is_me }) => {
    return (
        <div className={`message-item ${is_me ? 'mine' : 'theirs'}`}>
            {!is_me && (
                <img className="avatar" src={sender_photo} alt={sender_name} />
            )}
            <div className="bubble">
                <div className="content">{content}</div>
                <div className="meta">{timestamp}</div>
            </div>
        </div>
    )
}

export default Messages