import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

export default function DraftRequest() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  const skillId = params.get("skillId") || "";
  const skillName = params.get("skillName") || "";
  const ownerParam = params.get("owner") || "";
  const ownerIdParam = params.get("ownerId") || null;

  const [aboutYou, setAboutYou] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(null);

  // Get logged-in user from localStorage
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    let username = localStorage.getItem('username');
    const userString = localStorage.getItem('user');
    
    setCurrentUser(userId);
    
    // Try to get username from various sources
    if (username && username !== 'undefined' && username !== 'null') {
      setCurrentUsername(username);
    } else if (userString && userString !== 'undefined' && userString !== 'null') {
      try {
        const parsedUser = JSON.parse(userString);
        // Build username from available data
        if (parsedUser.username && parsedUser.username !== 'undefined') {
          setCurrentUsername(parsedUser.username);
        } else if (parsedUser.firstName || parsedUser.lastName) {
          const fullName = `${parsedUser.firstName || ''} ${parsedUser.lastName || ''}`.trim();
          setCurrentUsername(fullName || 'User');
        } else if (parsedUser.email) {
          // Use part of email as fallback
          setCurrentUsername(parsedUser.email.split('@')[0]);
        } else {
          setCurrentUsername('User');
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        setCurrentUsername('User');
      }
    } else {
      setCurrentUsername('User');
    }
  }, []);

  const skill = { id: skillId, name: skillName };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Check if user is logged in
    if (!currentUser) {
      setError("Please log in to send a request");
      setIsSubmitting(false);
      setTimeout(() => nav('/login'), 2000);
      return;
    }

    // Check if user is trying to request their own skill
    if (currentUser === ownerIdParam) {
      setError("You cannot request your own skill");
      setIsSubmitting(false);
      return;
    }

    try {
      const requestData = {
        skillId: skillId,
        skillName: skillName,
        ownerId: ownerIdParam,
        ownerName: ownerParam,
        requesterId: currentUser,
        requesterName: currentUsername || "User",
        message: aboutYou,
      };

      console.log('Sending request:', requestData);

      const apiUrl = process.env.REACT_APP_API_BASE_URL || "";
      const response = await fetch(`${apiUrl}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          // Duplicate request error
          setError("You have already sent a request for this skill.");
          setTimeout(() => {
            nav(`/skills/${encodeURIComponent(skillId)}`);
          }, 2000);
          return;
        }
        throw new Error(errorData.error || "Failed to send request");
      }

      await response.json();
      
      // Trigger custom event to notify SkillDescription
      window.dispatchEvent(new CustomEvent('requestSent', { detail: { skillId } }));
      
      nav(`/skills/${encodeURIComponent(skillId)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] pt-[65px]">
      <header className="fixed top-[65px] left-0 right-0 z-10 flex items-center gap-4 px-4 py-3 border-b border-gray-200 dark:border-[#333] bg-white dark:bg-[#121212]">
        <button 
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={() => nav(`/skills/${encodeURIComponent(skillId)}`)}
          aria-label="Back"
        >
          <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="draft-request-title">Send Request</h1>
      </header>
      
      <div className="px-4 py-6 pt-[72px] pb-20 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-danger bg-red-50 dark:bg-red-900/20 p-3 rounded-app">{error}</div>}
          
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To:</span>
            <div className="form-input bg-gray-50 dark:bg-gray-800 cursor-default">{ownerParam || "Skill owner"}</div>
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interested in skill:</span>
            <div className="form-input bg-gray-50 dark:bg-gray-800 cursor-default">{skill.name || "(unknown skill)"}</div>
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Say something about yourself:</span>
            <textarea
              className="form-input dark:!text-white dark:!bg-[#2b2b2b] dark:placeholder-gray-400"
              rows={6}
              value={aboutYou}
              onChange={(e) => setAboutYou(e.target.value)}
              placeholder="Briefly introduce yourself and what you need…"
              required
              disabled={isSubmitting}
            />
          </label>

          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

