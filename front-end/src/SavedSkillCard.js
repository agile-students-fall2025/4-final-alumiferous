import React, { useState } from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const SavedSkillCard = ({ skill, onUnsave, onReport }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleUnsave = () => {
    onUnsave(skill.skillId);
    setIsMenuOpen(false);
  };

  const handleReport = () => {
    onReport();
    setIsMenuOpen(false);
  };

  return (
    <div className="relative">
      <div className="card overflow-hidden" data-height={skill.height}>
        <Link to={`/skills/${encodeURIComponent(skill.skillId)}`}>
          {skill.image ? (
            <img
              src={skill.image}
              alt={skill.name}
              className="w-full object-cover"
              style={{ height: `${skill.height}px` }}
            />
          ) : (
            <div className="w-full bg-gray-200 dark:bg-gray-700" style={{ height: `${skill.height}px` }} />
          )}
        </Link>

        <button
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <EllipsisHorizontalIcon className="w-5 h-5" />
        </button>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsMenuOpen(false)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-app p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{skill.name}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{skill.brief}</p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={handleUnsave}
                  className="btn w-full text-left"
                >
                  Unsave Skill
                </button>
              </li>
              <li>
                <button
                  onClick={handleReport}
                  className="btn w-full text-left"
                >
                  Report
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedSkillCard;