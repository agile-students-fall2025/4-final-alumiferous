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
import "./Footer.css";
import { Link } from "react-router-dom";

const navItems = [
  { icon: HomeIcon, route: "/home" },
  { icon: UserIcon, route: "/profile" },
  { icon: ArrowUpTrayIcon, route: "/upload" },
  { icon: ChatBubbleOvalLeftEllipsisIcon, route: "/chat" },
  { icon: Cog6ToothIcon, route: "/settings" },
];

const Footer = () => {
  return (
    <footer className="footer">
      <nav className="footer-nav">
        {navItems.map(({ icon: Icon, route }, index) => (
          <Link key={index} to={route} className="footer-item">
            <Icon className="footer-icon" />
          </Link>
        ))}
      </nav>
    </footer>
  );
};

export default Footer;
