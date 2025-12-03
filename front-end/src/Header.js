import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 w-full h-[65px] bg-white/80 dark:bg-[#121212]/80 backdrop-blur-[8px] border-b border-[#e0e0e0] dark:border-[#333] z-[100] flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-fantasy text-2xl font-bold text-[cornflowerblue] tracking-wide m-0 cursor-pointer" onClick={() => navigate("/Home")}>
          InstaSkill
        </h1>
      </div>
    </header>
  );
};

export default Header;
