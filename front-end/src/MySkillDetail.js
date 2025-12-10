import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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
      const apiUrl = process.env.REACT_APP_API_BASE_URL || "";
      
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
      <div className="min-h-screen bg-white dark:bg-[#121212] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Skill not found</h2>
          <button onClick={() => navigate('/profile')} className="py-2.5 px-6 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors">Back to Profile</button>
        </div>
      </div>
    );
  }

  // Parse categories (could be array or comma-separated string)
  let categories = [];
  const categoryData = skill.categories || skill.category;
  
  if (Array.isArray(categoryData)) {
    categories = categoryData.filter(Boolean);
  } else if (typeof categoryData === 'string' && categoryData.trim()) {
    categories = categoryData.split(',').map(c => c.trim()).filter(Boolean);
  }
  
  console.log('Skill data:', skill);
  console.log('Categories raw:', categoryData);
  console.log('Categories parsed:', categories);
  console.log('Images:', skill.images);
  console.log('Videos:', skill.videos);
  
  // Get images and videos arrays
  const images = skill.images || [];
  const videos = skill.videos || [];

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] pt-[65px] pb-20">
      <button className="fixed top-[69px] left-4 flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10" onClick={() => navigate('/profile')}>
        ←
      </button>
      
      <div className="pt-4 px-4 py-6 max-w-2xl mx-auto">
        <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-md p-6 border border-gray-200 dark:border-[#333]">
          {isEditing ? (
            <div>
              <label className="block mb-4">
                <strong className="block mb-2 text-gray-900 dark:text-white">Skill Name:</strong>
                <input
                  type="text"
                  value={editedSkill?.name || ''}
                  onChange={(e) => setEditedSkill({...editedSkill, name: e.target.value})}
                  className="w-full p-2 text-base border border-gray-300 dark:border-[#444] rounded bg-white dark:bg-[#2b2b2b] text-gray-900 dark:text-white focus:outline-none focus:border-gray-300 dark:focus:border-[#444]"
                />
              </label>
              <label className="block mb-4">
                <strong className="block mb-2 text-gray-900 dark:text-white">Brief Description:</strong>
                <textarea
                  value={editedSkill?.brief || ''}
                  onChange={(e) => setEditedSkill({...editedSkill, brief: e.target.value})}
                  rows={3}
                  className="w-full p-2 text-base border border-gray-300 dark:border-[#444] rounded bg-white dark:bg-[#2b2b2b] text-gray-900 dark:text-white focus:outline-none focus:border-gray-300 dark:focus:border-[#444]"
                />
              </label>
              <label className="block mb-4">
                <strong className="block mb-2 text-gray-900 dark:text-white">Detailed Description:</strong>
                <textarea
                  value={editedSkill?.detail || ''}
                  onChange={(e) => setEditedSkill({...editedSkill, detail: e.target.value})}
                  rows={6}
                  className="w-full p-2 text-base border border-gray-300 dark:border-[#444] rounded bg-white dark:bg-[#2b2b2b] text-gray-900 dark:text-white focus:outline-none focus:border-gray-300 dark:focus:border-[#444]"
                />
              </label>
              <label className="block mb-4">
                <strong className="block mb-2 text-gray-900 dark:text-white">Categories:</strong>
                <div ref={catsRef} className="relative">
                  <button
                    type="button"
                    className="w-full p-2 text-base text-left bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#444] rounded cursor-pointer text-gray-900 dark:text-white focus:outline-none focus:border-gray-300 dark:focus:border-[#444]"
                    onClick={() => setCatsOpen((s) => !s)}
                  >
                    {editedSkill?.categories?.length === 0 || !editedSkill?.categories
                      ? 'Select categories...'
                      : editedSkill.categories.join(', ')}
                  </button>

                  {catsOpen && (
                    <div className="absolute z-40 bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#444] max-h-[220px] overflow-y-auto w-full mt-1.5 p-2 rounded shadow-lg">
                      {availableCategories && availableCategories.length ? availableCategories.map((cat, index) => (
                        <label key={index} className="flex items-center gap-2 py-1.5 px-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333] rounded">
                          <input
                            type="checkbox"
                            checked={editedSkill?.categories?.includes(cat) || false}
                            onChange={() => {
                              const currentCats = editedSkill?.categories || [];
                              if (currentCats.includes(cat)) {
                                setEditedSkill({...editedSkill, categories: currentCats.filter(c => c !== cat)});
                              } else {
                                setEditedSkill({...editedSkill, categories: [...currentCats, cat]});
                              }
                            }}
                          />
                          <span className="text-gray-900 dark:text-white">{cat}</span>
                        </label>
                      )) : (
                        <div className="p-2 text-gray-500">No categories available</div>
                      )}
                    </div>
                  )}
                </div>
              </label>
              
              {/* Existing Images */}
              <div className="mb-4">
                <strong className="block mb-2 text-gray-900 dark:text-white">Current Images:</strong>
                <div className="flex flex-wrap gap-2.5">
                  {editedSkill?.images && editedSkill.images.length > 0 ? (
                    editedSkill.images
                      .filter(img => !removedImages.includes(img))
                      .map((img, idx) => (
                        <div key={idx} className="relative w-[100px] h-[100px]">
                          <img 
                            src={img} 
                            alt={`Current ${idx}`} 
                            className="w-full h-full object-cover rounded-lg border-2 border-gray-300 dark:border-[#444]"
                          />
                          <button
                            type="button"
                            onClick={() => setRemovedImages([...removedImages, img])}
                            className="absolute -top-2 -right-2 bg-red-600 text-white border-none rounded-full w-7 h-7 cursor-pointer text-lg font-bold flex items-center justify-center shadow-md hover:bg-red-700"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))
                  ) : (
                    <small className="text-gray-500 italic">No images yet</small>
                  )}
                </div>
              </div>

            {/* Add New Images */}
            <label className="block mb-4">
              <strong className="block mb-2 text-gray-900 dark:text-white">Add New Images:</strong>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setNewImages([...newImages, ...Array.from(e.target.files)])}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-blue-700 cursor-pointer"
              />
              {newImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newImages.map((file, idx) => (
                    <div key={idx} className="relative w-24 h-24">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`New ${idx}`} 
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setNewImages(newImages.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 bg-red-600 text-white border-none rounded-full w-6 h-6 cursor-pointer text-base font-bold flex items-center justify-center shadow hover:bg-red-700"
                        title="Remove from upload"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </label>              {/* Existing Videos */}
              <div className="mb-4">
                <strong className="block mb-2 text-gray-900 dark:text-white">Current Videos:</strong>
                <div className="flex flex-wrap gap-2.5">
                  {editedSkill?.videos && editedSkill.videos.length > 0 ? (
                    editedSkill.videos
                      .filter(vid => !removedVideos.includes(vid))
                      .map((vid, idx) => (
                        <div key={idx} className="relative w-[160px] h-[100px]">
                          <video 
                            src={vid} 
                            className="w-full h-full object-cover rounded-lg border-2 border-gray-300 dark:border-[#444]"
                            muted
                          />
                          <button
                            type="button"
                            onClick={() => setRemovedVideos([...removedVideos, vid])}
                            className="absolute -top-2 -right-2 bg-red-600 text-white border-none rounded-full w-7 h-7 cursor-pointer text-lg font-bold flex items-center justify-center shadow-md hover:bg-red-700"
                            title="Remove video"
                          >
                            ×
                          </button>
                        </div>
                      ))
                  ) : (
                    <small className="text-gray-500 italic">No videos yet</small>
                  )}
                </div>
              </div>

            {/* Add New Videos */}
            <label className="block mb-4">
              <strong className="block mb-2 text-gray-900 dark:text-white">Add New Videos:</strong>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => setNewVideos([...newVideos, ...Array.from(e.target.files)])}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-blue-700 cursor-pointer"
              />
              {newVideos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newVideos.map((file, idx) => (
                    <div key={idx} className="relative w-40 h-24">
                      <video 
                        src={URL.createObjectURL(file)} 
                        className="w-full h-full object-cover rounded-lg"
                        controls
                        muted
                      />
                      <button
                        type="button"
                        onClick={() => setNewVideos(newVideos.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 bg-red-600 text-white border-none rounded-full w-6 h-6 cursor-pointer text-base font-bold flex items-center justify-center shadow hover:bg-red-700"
                        title="Remove from upload"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </label>              {/* Action Buttons */}
              <div className="flex gap-2.5 justify-center mt-5">
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="py-2.5 px-6 text-base bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="py-2.5 px-6 text-base bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">{skill.name}</h1>
              
              {/* All Categories */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                  {categories.map((cat, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full text-sm font-medium bg-primary text-white">{cat}</span>
                  ))}
                </div>
              )}
          
              <div className="space-y-4">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300">{skill.detail || skill.description || skill.brief || 'No description provided'}</p>
                </div>
                
                {/* Images Gallery */}
                {images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Images</h3>
                    <div className="flex flex-col gap-3">
                      {images.map((img, idx) => (
                        <img key={idx} src={img} alt={`${skill.name} ${idx + 1}`} className="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-[#444]" />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Videos Gallery */}
                {videos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Videos</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {videos.map((vid, idx) => (
                        <div key={idx} className="rounded-lg overflow-hidden border border-gray-200 dark:border-[#444]">
                          <video controls className="w-full">
                            <source src={vid} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Fallback single videoUrl */}
                {!videos.length && skill.videoUrl && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Video</h3>
                    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-[#444]">
                      <video controls className="w-full">
                        <source src={skill.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Edit Button */}
              <div className="text-center mt-5">
                <button
                  onClick={() => setIsEditing(true)}
                  className="py-2.5 px-6 text-base bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors"
                >
                  Edit Skill
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
