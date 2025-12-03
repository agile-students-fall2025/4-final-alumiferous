import React from "react";
import {
  HomeIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowUpTrayIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  BellIcon,
  FolderIcon
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const navItems = [
  { icon: HomeIcon, route: "/home" },
  { icon: UserIcon, route: "/profile" },
  { icon: Cog6ToothIcon, route: "/settings" },
  { icon: ChatBubbleOvalLeftEllipsisIcon, route: "/chat" },
  // { icon: ArrowUpTrayIcon, route: "/upload" },
  // {icon:  FolderIcon, route: "/saved"}
];

const Footer = () => {
  return (
    <footer className="fixed bottom-0 w-full h-[65px] bg-white dark:bg-[#121212] border-t border-[#ddd] dark:border-[#333] shadow-[0_-2px_6px_rgba(0,0,0,0.08)] z-[100] flex justify-center items-center">
      <nav className="flex justify-around items-center w-full max-w-[500px]">
        {navItems.map(({ icon: Icon, route }, index) => (
          <Link key={index} to={route} className="no-underline text-[#444] dark:text-[#ccc] flex justify-center items-center flex-col transition-all duration-200 active:scale-90">
            <Icon className="w-[26px] h-[26px] text-[#666] dark:text-[#aaa] transition-colors duration-200 active:text-[#007bff]" />
          </Link>
        ))}
      </nav>
    </footer>
  );
};

export default Footer;
