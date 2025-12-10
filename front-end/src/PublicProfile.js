import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Could not load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleSkillClick = (skillId) => {
    navigate(`/skills/${skillId}`);
  };

  const handleBack = () => {
    // Check if we came from a specific page via location state
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      // Default to home to avoid loops
      navigate('/home');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-[#121212] pt-20 pb-24">
        <div className="text-center py-20 text-gray-700 dark:text-gray-300">
          Loading profile...
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-white dark:bg-[#121212] pt-20 pb-24">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="text-center py-10">
            <p className="text-red-600 dark:text-red-400 mb-6">
              {error || 'Profile not found'}
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/home')}
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  const displayName = profile.username || 
    `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 
    'User';

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212] pt-20 pb-24">
      {/* Header */}
      <div className="fixed top-[56px] left-0 right-0 z-10 flex items-center justify-between px-5 py-4 bg-white dark:bg-[#121212] border-b border-[#e0e0e0] dark:border-[#333] shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white m-0 flex-1 min-w-0 text-center">
          User Profile
        </h1>
        <div className="w-16"></div> {/* Spacer for centering */}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 mt-[72px]">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-8 mb-6 text-white">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              {profile.photo ? (
                <img 
                  src={profile.photo} 
                  alt={displayName}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-white/30 border-4 border-white shadow-lg flex items-center justify-center text-5xl font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-bold mb-3">{displayName}</h2>
              {profile.bio && (
                <p className="text-white/95 mb-4 leading-relaxed">
                  {profile.bio}
                </p>
              )}
              <div className="flex gap-6 justify-center sm:justify-start">
                <div className="text-sm">
                  <span className="text-2xl font-bold block">{profile.skillCount || 0}</span>
                  <span className="text-white/90">Skills</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Skills
          </h3>
          
          {profile.skills && profile.skills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.skills.map((skill) => (
                <div 
                  key={skill.skillId} 
                  className="bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 hover:border-blue-500 dark:hover:border-blue-400"
                  onClick={() => handleSkillClick(skill.skillId)}
                >
                  {skill.image && (
                    <div className="w-full h-44 overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img 
                        src={skill.image} 
                        alt={skill.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                      {skill.name}
                    </h4>
                    {skill.brief && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {skill.brief}
                      </p>
                    )}
                    {skill.categories && skill.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {skill.categories.slice(0, 3).map((cat, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-[#2b2b2b] rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">
                This user hasn't shared any skills yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default PublicProfile;
