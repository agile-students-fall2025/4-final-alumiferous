//import needed modules
import React, { useState } from 'react'
import './Chat.css'

//MAIN chat component
const Chat = props => {
    const [searchTerm, setSearchTerm] = useState('')

    // chat list container - mock data
    const chatList = [
        {
            id: 1,
            name: "Sarah Johnson",
            photo: "/images/nonexistent-avatar.jpg",
            last_message: "Hey! Are you free for the Python tutoring session tomorrow?",
            timestamp: "2:30 PM",
            unread: 2,
            online: true
        },
        {
            id: 2,
            name: "Mike Chen",
            photo: "/images/avatar-default.png", 
            last_message: "Thanks for the JavaScript help! The project is working now 🎉",
            timestamp: "1:15 PM",
            unread: 0,
            online: false
        },
        {
            id: 3,
            name: "Emma Wilson",
            photo: "/images/avatar-default.png",
            last_message: "Can you teach me React hooks? I'm struggling with useEffect",
            timestamp: "11:45 AM",
            unread: 1,
            online: true
        },
        {
            id: 4,
            name: "Alex Rodriguez",
            photo: "/images/missing-image.png",
            last_message: "Perfect! See you at the study session",
            timestamp: "Yesterday",
            unread: 0,
            online: false
        }
    ]

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
                {filteredChats.length > 0 ? (
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
                    <div className="no-results">
                        <p>No conversations found</p>
                    </div>
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
    const handleChatClick = () => {
        console.log(`Opening chat with ${name}`)
        // Example: navigate(`/chat/${id}`)
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