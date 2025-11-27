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
        let isMounted = true

        const loadMessages = async () => {
            try {
                if (!id) {
                    navigate('/chat', { replace: true })
                    return
                }
                setLoading(true)
                setError(null)

                console.log('Fetching messages from backend for chat:', id)
                const url = `http://localhost:3000/api/messages?chat_id=${encodeURIComponent(id)}`
                const res = await fetch(url)
                console.log('Response status:', res.status)
                if (!res.ok) throw new Error(`Request failed: ${res.status}`)
                const data = await res.json()

                const array = Array.isArray(data) ? data : [data]
                const normalized = array.map((item) => {
                    // item.userId is an object if populated, or string if not
                    const sender = item.userId?.username || item.userId?.email 
                    const content = item.content || ''
                    let ts = item.sentAt || item.timestamp || ''
                    if (ts) {
                        const dateObj = new Date(ts)
                        ts = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                    const me = item.isMe || false
                    return {
                        id: item._id,
                        chatId: item.chatId ?? id,
                        sender_name: sender,
                        sender_photo: avatarUrl(sender),
                        content,
                        timestamp: ts,
                        is_me: !!me,
                    }
                })

                if (isMounted) {
                    setMessages(normalized);
                    // Always get the other user's userId (not me)
                    let otherUserId = null;
                    if (otherUserId) {
                        fetch(`http://localhost:4000/api/users/${otherUserId}`)
                            .then(res => res.json())
                            .then(user => {
                                setChatSenderName(user.username || user.email );
                            })
                            .catch(() => setChatSenderName('Unknown'));
                    } else {
                        setChatSenderName('Unknown');
                    }
                }
            } catch (err) {
                console.error('Failed to load messages:', err)
                if (isMounted) setError('Failed to load messages')
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        loadMessages()
        return () => {
            isMounted = false
        }
    }, [id, navigate])

    const onSend = async (e) => {
        e.preventDefault()
        if (!draft.trim()) return
        try {
            const now = new Date()
            const payload = {
                chatId: id,
                userId: userId,
                content: draft,
                isMe: true,
                sentAt: now.toISOString(),
            }
            console.log({ chatId: id, userId: userId, content: draft });
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
                sender_name: chatSenderName || 'You',
                sender_photo: avatarUrl(chatSenderName || 'You'),
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