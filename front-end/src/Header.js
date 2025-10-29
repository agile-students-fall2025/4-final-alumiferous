import React from "react";
import { HomeIcon, UserIcon, Cog6ToothIcon, ArrowUpTrayIcon, ChatBubbleOvalLeftEllipsisIcon, BellIcon } from "@heroicons/react/24/outline";
import "./Header.css";

const navItems = [
  { name: "Home", icon: HomeIcon },
  { name: "Profile", icon: UserIcon },
  { name: "Settings", icon: Cog6ToothIcon },
  { name: "Upload", icon: ArrowUpTrayIcon },
  { name: "Messages", icon: ChatBubbleOvalLeftEllipsisIcon },
  { name: "Requests", icon: BellIcon },
];

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        {/* App title or logo */}
        <h1 className="header-title" style={{fontFamily: 'fantasy'}}> InstaSkill</h1>

        {/* Navigation icons */}
        <nav className="nav-bar">
          {navItems.map(({ name, icon: Icon }) => (
            <div className="nav-item" key={name}>
              <div className="icon-wrapper">
                <Icon className="nav-icon" />
                <span className="icon-label">{name}</span>
              </div>
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
