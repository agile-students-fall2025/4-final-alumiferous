import React from "react";
import { HomeIcon, UserIcon, Cog6ToothIcon, ArrowUpTrayIcon, ChatBubbleOvalLeftEllipsisIcon, BellIcon } from "@heroicons/react/24/outline";
import "./Header.css";
import { Link } from "react-router-dom";



//array of navigation icons
const navItems = [
  { name: "Home", icon: HomeIcon, route: "/home" },
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
        <h1 className="header-title"> InstaSkill</h1>

        {/* Navigation icons */}
        <nav className="nav-bar">
          {navItems.map(({ name, icon: Icon }) => (
            <IconComponent 
              key={name}
              name = {name}
              icon={Icon}
            />
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;

 // a separate component for icons
const IconComponent = ({name, icon:Icon}) => {
  const path = `/${name.toLowerCase()}`; //convert name of the icon to lower case as the path

  //returns an icon component with clickable link
  return(
    <Link to = {path} className="nav-item">
      <div className="icon-wrapper">
        <Icon className="nav-icon" />
        <span className="icon-lable">{name}</span>
      </div>
    </Link>
  )
}
