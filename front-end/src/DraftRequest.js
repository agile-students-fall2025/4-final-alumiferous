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

  const skill = { id: skillId, name: skillName };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const requestData = {
        skillId: parseInt(skillId),
        skillName: skillName,
        ownerId: ownerIdParam ? parseInt(ownerIdParam) : 1,
        ownerName: ownerParam,
        requesterId: 1, // TODO: get from auth
        requesterName: "Guest User",
        message: aboutYou,
      };

      const apiUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send request");
      }

      await response.json();
      
      alert(`Request sent to ${ownerParam}!`);
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

