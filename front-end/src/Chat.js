//import needed modules
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellIcon,} from "@heroicons/react/24/outline";

//MAIN chat component
const Chat = props => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [chatList, setChatList] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Load chat list from backend API
    useEffect(() => {
        let isMounted = true
        const loadChats = async () => {
            try {
                setLoading(true)
                setError(null)
                // Get logged-in userId from localStorage
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    throw new Error('No userId found in localStorage. Please log in.');
                }
                console.log('Fetching chat list from backend for user:', userId);
                const res = await fetch(`http://localhost:3000/api/chats?userId=${userId}`);
                console.log('Response status:', res.status);
                if (!res.ok) throw new Error(`Request failed: ${res.status}`);
                const data = await res.json();
                // Normalize records to the shape used by the UI
                const normalized = (Array.isArray(data) ? data : [data]).map((item) => {
            
                    let name = 'Unknown';
                    let photo = '/images/avatar-default.png';
       
                    if (item.userId && item.friendId) {
                        // If logged-in user is userId, show friendId's name
                        if (item.userId._id === userId && typeof item.friendId === 'object') {
                            name = item.friendId.username || item.friendId.email || 'Unknown';
                            photo = item.friendId.photo || '/images/avatar-default.png';
                        } else if (item.friendId._id === userId && typeof item.userId === 'object') {
                            name = item.userId.username || item.userId.email || 'Unknown';
                            photo = item.userId.photo || '/images/avatar-default.png';
                        }
                    }
                    let time = '';
                    if (item.lastMessageTime) {
                        const dateObj = new Date(item.lastMessageTime);
                        time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }
                    return {
                        id: item._id,
                        name,
                        photo,
                        last_message: item.lastMessage || '',
                        timestamp: time,
                        unread: item.unread || 0,
                    };
                });
                if (isMounted) setChatList(normalized);
            } catch (err) {
                console.error('Failed to load chats:', err);
                const message = 'Failed to load conversations';
                if (isMounted) setError(message);
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
        <div className="flex flex-col items-stretch h-screen w-screen bg-white dark:bg-[#121212] box-border overflow-hidden m-0">
            {/* Header */}
            <div className="fixed top-[56px] left-0 right-0 z-10 flex items-center justify-between px-5 py-4 bg-white dark:bg-[#121212] border-b border-[#e0e0e0] dark:border-[#333] shadow-[0_2px_4px_rgba(0,0,0,0.05)] w-screen shrink-0">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white m-0 flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">Chat</h1>
                <div className="flex gap-3">
                    <button
                        className="bg-transparent border-none text-xl text-[#333] dark:text-white rounded-full p-1.5 mr-1.5 shadow-none outline-none transition-colors duration-200 flex items-center justify-center"
                        aria-label="Requests"
                        title="Requests"
                        onClick={() => navigate('/requests')}
                    >
                        <BellIcon className="w-6 h-6 block" aria-hidden="true" />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="fixed top-[calc(64px+62px)] left-0 right-0 z-[9] text-center py-4 px-0 bg-white dark:bg-[#121212] border-b border-[#e0e0e0] dark:border-[#333]">
                <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-[#121212] pt-[calc(64px+135px)] pb-[calc(200px+env(safe-area-inset-bottom))] -webkit-overflow-scrolling-touch">
                {loading && (
                    <div className="text-center py-12"><p className="text-[#888] dark:text-[#aaa]">Loading conversations…</p></div>
                )}
                {!loading && error && (
                    <div className="text-center py-12"><p className="text-[#888] dark:text-[#aaa]">{error}</p></div>
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
                        />
                    ))
                ) : (
                    !loading && !error && (
                        <div className="text-center py-12">
                            <p className="text-[#888] dark:text-[#aaa]">No conversations found</p>
                        </div>
                    )
                )}
            </div>
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
            <div className="w-full h-full flex items-center justify-center bg-[#6c757d] text-white text-base font-semibold rounded-full">
                {initial}
            </div>
        )
    }

    return (
        <img 
            src={photo} 
            alt={name} 
            onError={handleImageError}
            className="w-full h-full object-cover"
        />
    )
}

//chatitem component 
const ChatItem = ({ id, name, photo, last_message, timestamp, unread }) => {
    const navigate = useNavigate()
    const handleChatClick = () => {
        navigate(`/chat/${id}`)
    }

    return (
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#f0f0f0] dark:border-[#2c2c2c] cursor-pointer transition-colors hover:bg-[#f8f9fa] dark:hover:bg-[#1e1e1e] active:bg-[#e9ecef] dark:active:bg-[#2a2a2a]" onClick={handleChatClick}>
            <div className="relative shrink-0">
                <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
                    <ProfileImage photo={photo} name={name} />
                </div>
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-[15px] text-[#212529] dark:text-[#f1f1f1] truncate">{name}</span>
                    <span className="text-xs text-[#6c757d] dark:text-[#aaa] whitespace-nowrap ml-2">{timestamp}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-[#6c757d] dark:text-[#aaa] truncate flex-1">{last_message}</span>
                    {unread > 0 && (
                        <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-primary text-white text-xs font-semibold rounded-full ml-2">
                            {unread}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Chat