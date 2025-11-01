//import needed modules
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Chat.css'

//MAIN chat component
const Chat = props => {
    const [searchTerm, setSearchTerm] = useState('')
    const [chatList, setChatList] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Helper to generate stable Picsum avatar URLs per user
    const avatarUrl = (seed, size = 50) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}/${size}`

    // Load chat list from Mockaroo mock API
    useEffect(() => {
        let isMounted = true
        const loadChats = async () => {
            try {
                setLoading(true)
                setError(null)
                const apiKey = process.env.REACT_APP_MOCKAROO_KEY
                if (!apiKey) {
                    throw new Error('Missing REACT_APP_MOCKAROO_KEY env var')
                }
                const res = await fetch('https://my.api.mockaroo.com/chats.json', {
                    headers: {
                        'X-API-Key': apiKey,
                    }
                })
                if (!res.ok) throw new Error(`Request failed: ${res.status}`)
                const data = await res.json()
              
                // Normalize records to the shape used by the UI
                const normalized = (Array.isArray(data) ? data : [data]).map((item) => {
                    const name = item.name
                    return {
                        id: item.id ,
                        name,
                        photo: avatarUrl(name),
                        last_message: item.last_message,
                        timestamp: item.timestamp,
                        unread: item.unread ,
                        online: item.online,
                    }
                })
                
                if (isMounted) setChatList(normalized)
            } 
            catch (err) {
                console.error('Failed to load chats:', err)
                const message = String(err).includes('REACT_APP_MOCKAROO_KEY')
                    ? 'Missing API key. Create a .env with REACT_APP_MOCKAROO_KEY=your_key and restart the dev server.'
                    : 'Failed to load conversations'
                if (isMounted) setError(message)
            } 
            finally {
                if (isMounted) setLoading(false)
            }
        }
        loadChats()
        return () => { isMounted = false }
    }, [])

    // Filter chats based on search term
    const filteredChats = chatList.filter(chat =>
        chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.last_message.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="chat-page">
            {/* Header */}
            <div className="chat-header">
                <h1 className="chat-title">Chat</h1>
                <div className="header-actions">
                    <button className="settings-btn">⚙️</button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Chat List */}
            <div className="chat-list">
                {loading && (
                    <div className="no-results"><p>Loading conversations…</p></div>
                )}
                {!loading && error && (
                    <div className="no-results"><p>{error}</p></div>
                )}
                {!loading && !error && filteredChats.length > 0 ? (
                    filteredChats.map(chat => (
                        <ChatItem
                            key={chat.id}
                            id={chat.id}
                            name={chat.name}
                            photo={chat.photo}
                            last_message={chat.last_message}
                            timestamp={chat.timestamp}
                            unread={chat.unread}
                            online={chat.online}
                        />
                    ))
                ) : (
                    !loading && !error && (
                        <div className="no-results">
                            <p>No conversations found</p>
                        </div>
                    )
                )}
            </div>

            {/* Floating Action Button for New Chat */}
            <button className="fab">
                <span>💬</span>
            </button>
        </div>
    )
}

//profile image component with fallback
const ProfileImage = ({ photo, name }) => {
    const [imageError, setImageError] = useState(false)
    const initial = name && name.length > 0 ? name[0].toUpperCase() : '?'

    const handleImageError = () => {
        setImageError(true)
    }

    if (imageError) {
        return (
            <div className="profile-fallback">
                {initial}
            </div>
        )
    }

    return (
        <img 
            src={photo} 
            alt={name} 
            onError={handleImageError}
        />
    )
}

//chatitem component 
const ChatItem = ({ id, name, photo, last_message, timestamp, unread, online }) => {
    const navigate = useNavigate()
    const handleChatClick = () => {
        navigate(`/chat/${id}`)
    }

    return (
        <div className="chat-item" onClick={handleChatClick}>
            <div className="profile-section">
                <div className="profile-picture">
                    <ProfileImage photo={photo} name={name} />
                    {online && <div className="online-indicator"></div>}
                </div>
            </div>
            
            <div className="chat-content">
                <div className="chat-header-row">
                    <span className="contact-name">{name}</span>
                    <span className="message-time">{timestamp}</span>
                </div>
                <div className="message-preview">
                    <span className="last-message">{last_message}</span>
                    {unread > 0 && (
                        <div className="unread-badge">
                            {unread}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Chat