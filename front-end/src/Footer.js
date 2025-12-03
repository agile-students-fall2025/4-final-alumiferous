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
    <footer className="fixed bottom-0 w-full h-[65px] bg-white dark:bg-[#121212] border-t border-[#ddd] dark:border-[#333] shadow-[0_-2px_6px_rgba(0,0,0,0.08)] z-[100] flex justify-center items-center">
      <nav className="flex justify-around items-center w-full max-w-[500px]">
        {navItems.map(({ icon: Icon, route, name }, index) => (
          <Link key={index} to={route} className="no-underline text-[#444] dark:text-[#ccc] flex justify-center items-center flex-col transition-all duration-200 active:scale-90">
            <div className="relative">
              <Icon className="w-[26px] h-[26px] text-[#666] dark:text-[#aaa] transition-colors duration-200 active:text-[#007bff]" />
              {name === "chat" && unreadChatsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadChatsCount}
                </span>
              )}
            </div>
          </Link>
        ))}
      </nav>
    </footer>
  );
};

export default Footer;
