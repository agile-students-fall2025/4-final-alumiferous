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
                const normalized = array.map((item, idx) => {
                    const sender = item.sender_name || 'Unknown'
                    const content = item.content || ''
                    const ts = item.timestamp || ''
                    const me = item.is_me || false
                    return {
                        id: item.id,
                        chat_id: item.chat_id ?? id,
                        sender_name: sender,
                        sender_photo: avatarUrl(sender),
                        content,
                        timestamp: ts,
                        is_me: !!me,
                    }
                })

                if (isMounted) setMessages(normalized)
            } catch (err) {
                console.error('Failed to load messages:', err)
                const message = String(err).includes('REACT_APP_MOCKAROO_KEY')
                    ? 'Missing API key. Create a .env with REACT_APP_MOCKAROO_KEY=your_key and restart the dev server.'
                    : 'Failed to load messages'
                if (isMounted) setError(message)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        loadMessages()
        return () => {
            isMounted = false
        }
    }, [id, navigate])

    const onSend = (e) => {
        e.preventDefault()
        if (!draft.trim()) return
        // Local echo only (no backend)
        const now = new Date()
        const hh = String(now.getHours()).padStart(2, '0')
        const mm = String(now.getMinutes()).padStart(2, '0')
        const displayNow = `${hh}:${mm}`
        const newMsg = {
            id: `local-${Date.now()}`,
            chat_id: id,
            sender_name: 'You',
            sender_photo: avatarUrl('You'),
            content: draft,
            timestamp: displayNow,
            is_me: true,
        }
        setMessages(prev => [...prev, newMsg])
        setDraft('')
    }


    return (
        <div className="messages-page">
            <div className="messages-header">
                <button className="back-btn" onClick={() => navigate('/chat')}>←</button>
                <h1 className="title">{}</h1>
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