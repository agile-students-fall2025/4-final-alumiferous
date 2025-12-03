import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

export default function MySkillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSkill, setEditedSkill] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newVideos, setNewVideos] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [removedVideos, setRemovedVideos] = useState([]);
  const [catsOpen, setCatsOpen] = useState(false);
  const catsRef = React.useRef(null);

  // Fetch available categories
  useEffect(() => {
    (async function fetchCategories(){
      try {
        const res = await fetch('/api/fixeddata');
        if (res.ok) {
          const body = await res.json();
          const c = Array.isArray(body.categories) ? body.categories : [];
          if (c.length) setAvailableCategories(c.sort());
        }
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
    })();

    // Click-away handler for categories dropdown
    function onDocClick(e){
      if (catsRef.current && !catsRef.current.contains(e.target)) {
        setCatsOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => { document.removeEventListener('click', onDocClick); };
  }, []);

  // Initialize edited skill when entering edit mode
  useEffect(() => {
    if (isEditing && skill) {
      // Deduplicate images and videos arrays
      const uniqueImages = skill.images ? [...new Set(skill.images)] : [];
      const uniqueVideos = skill.videos ? [...new Set(skill.videos)] : [];
      
      setEditedSkill({
        name: skill.name || '',
        brief: skill.brief || '',
        detail: skill.detail || skill.description || '',
        categories: skill.categories || [],
        images: uniqueImages,
        videos: uniqueVideos
      });
    }
  }, [isEditing, skill]);

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
          const skillIdStr = String(s.skillId || s.id || s._id || '');
          const paramIdStr = String(id);
          console.log('Checking skill:', s.name, 'skillId:', skillIdStr, 'vs param:', paramIdStr);
          return skillIdStr === paramIdStr;
        }
      );
      console.log('Found skill:', foundSkill);
      
      if (foundSkill) {
        setSkill(foundSkill);
        return;
      }
    }
    
    // If not found in localStorage, try fetching from API
    console.log('Skill not in localStorage, fetching from API...');
    fetch(`/api/skills/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Skill not found');
        return res.json();
      })
      .then(data => {
        console.log('Fetched skill from API:', data);
        setSkill(data);
      })
      .catch(err => {
        console.error('Error fetching skill:', err);
        setSkill(null);
      });
  }, [id]);

  // Handle save skill edits
  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const apiUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
      
      console.log('Saving skill with ID:', id);
      console.log('Edited skill data:', editedSkill);
      
      // Use FormData to support file uploads
      const formData = new FormData();
      formData.append('name', editedSkill.name);
      formData.append('brief', editedSkill.brief);
      formData.append('detail', editedSkill.detail);
      if (editedSkill.categories && editedSkill.categories.length) {
        formData.append('categories', editedSkill.categories.join(','));
      }
      
      // Append new image files
      if (newImages && newImages.length) {
        newImages.forEach(file => formData.append('images', file));
      }
      
      // Append new video files
      if (newVideos && newVideos.length) {
        newVideos.forEach(file => formData.append('videos', file));
      }
      
      // Send list of removed media URLs
      if (removedImages.length > 0) {
        formData.append('removedImages', removedImages.join(','));
      }
      if (removedVideos.length > 0) {
        formData.append('removedVideos', removedVideos.join(','));
      }

      console.log('Sending PUT request to:', `${apiUrl}/api/skills/${id}`);
      
      const response = await fetch(`${apiUrl}/api/skills/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Update failed:', response.status, errorData);
        throw new Error(errorData.error || `Failed to update skill (${response.status})`);
      }

      const responseData = await response.json();
      console.log('Update successful! Response data:', responseData);

      // Clear caches to force fresh data on reload
      localStorage.removeItem('skills');
      localStorage.removeItem('userSkills');
      
      // Reload the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating skill:', error);
      alert(`Failed to update skill: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedSkill(null);
    setNewImages([]);
    setNewVideos([]);
    setRemovedImages([]);
    setRemovedVideos([]);
    setCatsOpen(false);
  };

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

  // Parse categories (could be array or comma-separated string)
  let categories = [];
  if (Array.isArray(skill.categories)) {
    categories = skill.categories.filter(Boolean);
  } else if (typeof skill.categories === 'string' && skill.categories.trim()) {
    categories = skill.categories.split(',').map(c => c.trim()).filter(Boolean);
  }
  
  console.log('Skill data:', skill);
  console.log('Categories raw:', skill.categories);
  console.log('Categories parsed:', categories);
  console.log('Images:', skill.images);
  console.log('Videos:', skill.videos);
  
  // Get images and videos arrays
  const images = skill.images || [];
  const videos = skill.videos || [];

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
