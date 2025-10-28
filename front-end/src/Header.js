import React from "react";
import { HomeIcon, UserIcon, Cog6ToothIcon, ArrowUpTrayIcon, ChatBubbleOvalLeftEllipsisIcon, BellIcon } from "@heroicons/react/24/outline";
import "./Header.css";
import { Link } from "react-router-dom";


const navItems = [
  { name: "Home", icon: HomeIcon, route: "/" },
  { name: "Profile", icon: UserIcon, route: "/profile" },
  { name: "Settings", icon: Cog6ToothIcon, route: "/settings" },
  { name: "Upload", icon: ArrowUpTrayIcon, route: "/upload" },
  { name: "Messages", icon: ChatBubbleOvalLeftEllipsisIcon, route: "/messages" },
  { name: "Requests", icon: BellIcon, route: "/requests" },
];

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        {/* App title or logo */}
        <h1 className="header-title" style={{fontFamily: 'fantasy'}}> InstaSkill</h1>

        {/* Navigation icons */}
        <nav className="nav-bar">
          {navItems.map(({ name, icon: Icon, route }) => (
            <Link to={route} key={name} className="nav-item">
              <div className="icon-wrapper">
                <Icon className="nav-icon" />
                <span className="icon-label">{name}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
