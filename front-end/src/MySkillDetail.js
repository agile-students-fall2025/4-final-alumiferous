import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

export default function MySkillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);

  useEffect(() => {
    // Get user skills from localStorage
    const userSkillsString = localStorage.getItem('userSkills');
    console.log('Looking for skill ID:', id, 'Type:', typeof id);
    console.log('LocalStorage userSkills:', userSkillsString);
    
    if (userSkillsString) {
      const userSkills = JSON.parse(userSkillsString);
      console.log('Parsed skills:', userSkills);
      
      // Find the skill by ID (could be skillId, id, or _id)
      const foundSkill = userSkills.find(
        s => {
          console.log('Checking skill:', s, 'IDs:', s.skillId, s.id, s._id);
          console.log('Comparison:', Number(s.skillId) === Number(id), Number(s.id) === Number(id));
          return Number(s.skillId) === Number(id) || 
                 Number(s.id) === Number(id) || 
                 Number(s._id) === Number(id);
        }
      );
      console.log('Found skill:', foundSkill);
      setSkill(foundSkill);
    }
  }, [id]);

  if (!skill) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Skill not found</h2>
          <button onClick={() => navigate('/profile')} className="btn">Back to Profile</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] pt-[65px] pb-20">
      <button className="fixed top-[69px] left-4 flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10" onClick={() => navigate('/profile')}>
        <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
      </button>
      
      <div className="pt-16 px-4 py-6 max-w-2xl mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{skill.name}</h1>
          
          <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary text-white mb-4">{skill.category || skill.field || 'Not specified'}</div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-700 dark:text-gray-300">{skill.description || skill.detail || skill.brief || 'No description provided'}</p>
            </div>
            
            {skill.videoUrl && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Video</h3>
                <div className="rounded-app overflow-hidden">
                  <video controls className="w-full">
                    <source src={skill.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
