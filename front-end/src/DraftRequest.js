import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import "./DraftRequest.css";
import "./Messages.css";

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
    
    console.log('Current user ID:', userId, 'Username:', currentUsername);
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

      const apiUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
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
      
      nav(`/skills/${encodeURIComponent(skillId)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="draft-request-page">
      <header className="messages-header">
        <button 
          className="back-btn" 
          onClick={() => nav(`/skills/${encodeURIComponent(skillId)}`)}
          aria-label="Back"
        >
          ←
        </button>
      </header>
      
      <div className="draft-request-content">
        <form onSubmit={handleSubmit} className="draft-request-form">
          {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          
          <label className="form-label">
            To:
            <div className="skill-display-box">{ownerParam || "Skill owner"}</div>
          </label>

          <label className="form-label">
            Interested in skill:
            <div className="skill-display-box">{skill.name || "(unknown skill)"}</div>
          </label>

          <label className="form-label">
            Say something about yourself:
            <textarea
              className="form-input"
              rows={6}
              value={aboutYou}
              onChange={(e) => setAboutYou(e.target.value)}
              placeholder="Briefly introduce yourself and what you need…"
              required
              disabled={isSubmitting}
            />
          </label>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

