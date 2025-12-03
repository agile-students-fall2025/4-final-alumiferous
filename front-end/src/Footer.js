import React, { useState, useEffect } from "react";
import {
  HomeIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowUpTrayIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  BellIcon,
  FolderIcon
} from "@heroicons/react/24/outline";
import "./Footer.css";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: HomeIcon, route: "/home", name: "home" },
  { icon: UserIcon, route: "/profile", name: "profile" },
  { icon: Cog6ToothIcon, route: "/settings", name: "settings" },
  { icon: ChatBubbleOvalLeftEllipsisIcon, route: "/chat", name: "chat" },
  // { icon: ArrowUpTrayIcon, route: "/upload" },
  // {icon:  FolderIcon, route: "/saved"}
];

const Footer = () => {
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const loadUnreadChats = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        
        const response = await fetch(`/api/chats?userId=${userId}`);
        if (response.ok) {
          const chats = await response.json();
          // Count chats that have unread messages (unread > 0)
          const unreadChats = chats.filter(chat => chat.unread && chat.unread > 0);
          console.log('Unread chats count:', unreadChats.length);
          console.log('Chats with unread:', unreadChats);
          setUnreadChatsCount(unreadChats.length);
        }
      } catch (err) {
        console.error('Error loading unread chats:', err);
      }
    };
    
    loadUnreadChats();
    // Refresh count every 10 seconds for more responsive updates
    const interval = setInterval(loadUnreadChats, 10000);
    return () => clearInterval(interval);
  }, [location]); // Re-run when location changes

  return (
    <footer className="footer">
      <nav className="footer-nav">
        {navItems.map(({ icon: Icon, route, name }, index) => (
          <Link key={index} to={route} className="footer-item">
            <div className="footer-icon-wrapper">
              <Icon className="footer-icon" />
              {name === "chat" && unreadChatsCount > 0 && (
                <span className="footer-notification-badge">{unreadChatsCount}</span>
              )}
            </div>
          </Link>
        ))}
      </nav>
    </footer>
  );
};

export default Footer;
