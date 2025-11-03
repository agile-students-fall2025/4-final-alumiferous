import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import "./DraftRequest.css";
import "./Messages.css"; // reuse messages-style header

export default function DraftRequest() {
  // Read ?skillId=...&skillName=...&owner=... from the URL
  const [params] = useSearchParams();
  const nav = useNavigate();

  // Get values from query string
  const skillId = params.get("skillId") || "";
  const skillName = params.get("skillName") || "";
  const ownerParam = params.get("owner") || "";

  // Local UI state
  const [aboutYou, setAboutYou] = useState("");

  // Skill object for display (just name for now)
  const skill = { id: skillId, name: skillName };

  // "Send" the request (mock): log to console, show alert, then route back to the skill page
  function handleSubmit(e) {
    e.preventDefault();
    console.log("REQUEST:", { to: ownerParam, skillId, aboutYou });
    alert("Request sent (mock).");
    // After "sending", return to the same skill's description page
    nav(`/skills/${encodeURIComponent(skillId)}`);
  }

  // Page layout: a simple centered card-style form
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

        {/* Simple form with three fields:
            - To:      (pre-filled with the skill owner; editable)
            - Skill:   (read-only pill showing which skill this request is for)
            - About you: (text area for the message body)
        */}
        <form onSubmit={handleSubmit} className="draft-request-form">
          <label className="form-label">
            To:
            <div className="skill-display-box">{ownerParam || "Skill owner"}</div>
          </label>

          <label className="form-label">
            Interested in skill:
            {/* Read-only display so users are sure which skill they're contacting about */}
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
            />
          </label>

          {/* Mock submit */}
          <button type="submit" className="btn btn-primary">Send Request</button>
        </form>
      </div>
    </div>
  );
}

