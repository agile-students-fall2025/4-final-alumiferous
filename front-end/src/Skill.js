import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { SkillsContext } from "./SkillsContext";

const Skill = ({ skillId, name, brief, image, ImgHeight }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const { handleSaveSkill, handleHideSkill } = useContext(SkillsContext);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleSave = () => {
    setIsMenuOpen(false);
    handleSaveSkill(skillId)
      .then(() => showNotification('Skill Saved', 'success'))
      .catch(() => showNotification('Failed to save skill', 'error'));
  };

  const handleHide = () => {
    handleHideSkill(skillId);
    setIsMenuOpen(false);
    showNotification('Skill Hidden', 'success');
  };

  const handleReport = () => {
    setIsMenuOpen(false);
    showNotification('Issue Reported', 'info');
  };

  return (
    <div className="inline-block w-full mb-4 break-inside-avoid rounded-xl overflow-hidden bg-transparent">
      <div className="relative w-full overflow-hidden rounded-xl min-h-[180px]">
        <Link to={`/skills/${encodeURIComponent(skillId)}`}>
          {image ? (
            <img src={image} alt={name} className="w-full block rounded-xl object-cover transition-transform duration-300 min-h-[180px]" />
          ) : (
            // If no image is provided by the backend, render nothing (per product decision)
            <div className="w-full block rounded-xl object-cover min-h-[180px]" />
          )}
        </Link>
      </div>

      {/* Title and menu placed underneath the image */}
      <div className="flex items-center justify-between gap-2 pt-2 px-1.5">
        <div className="text-xs font-semibold text-[#222] dark:text-[#f1f1f1] leading-tight overflow-hidden line-clamp-2">
          {name}
        </div>
        <button 
          className="bg-white/95 dark:bg-[#2b2b2b]/95 border-none rounded-lg p-1.5 cursor-pointer shadow-[0_2px_6px_rgba(0,0,0,0.12)] inline-flex items-center justify-center transition-all duration-150 hover:scale-105" 
          onClick={(e) => { e.stopPropagation(); toggleMenu(e); }} 
          aria-label="Options"
        >
          <EllipsisHorizontalIcon className="w-5 h-5 text-[#333] dark:text-[#ccc]" />
        </button>
      </div>

      {/* Pop-up menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center animate-[fadeIn_0.25s_ease_forwards] z-50" onClick={() => setIsMenuOpen(false)}>
          <div className="bg-white dark:bg-[#2b2b2b] rounded-xl p-6 w-[85%] max-w-[360px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] animate-[slideUp_0.25s_ease_forwards] text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="dark:text-white mb-2">{name}</h3>
            <p className="dark:text-[#ccc] mb-4">{brief}</p>
            <div className="flex flex-col gap-2">
              <button className="btn btn-primary w-full" onClick={handleSave}>Save Skill</button>
              <button className="btn w-full" onClick={handleHide}>Hide</button>
            </div>
          </div>
        </div>
      )}

      {/* Notification toast */}
      {notification.show && (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#6495ED] text-white py-3 px-6 rounded-lg font-medium text-sm shadow-[0_4px_12px_rgba(0,0,0,0.2)] z-[100] animate-[slideUpFade_0.3s_ease_forwards,fadeOut_0.3s_ease_2.7s_forwards]`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default Skill;
