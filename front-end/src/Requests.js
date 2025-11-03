import React, { useState } from "react";
import "./Requests.css";

export default function Requests() {
  const [requests, setRequests] = useState([
    { id: 1, name: "Ethan Smith", offers: "Graphic Design", wants: "UI/UX Design" },
    { id: 2, name: "Olivia Johnson", offers: "Video Editing", wants: "Photography" },
    { id: 3, name: "Jacob Williams", offers: "Web Development", wants: "Marketing Strategy" },
  ]);

  const handleAccept = (id) => {
    alert(`Accepted request from ${requests.find(r => r.id === id).name}`);
    setRequests(requests.filter((r) => r.id !== id));
  };

  const handleDecline = (id) => {
    alert(`Declined request from ${requests.find(r => r.id === id).name}`);
    setRequests(requests.filter((r) => r.id !== id));
  };

  return (
    <div className="requests-page">
      <header className="requests-header">
        <h2>Incoming Requests</h2>
      </header>

      <div className="requests-content">
        {requests.length === 0 ? (
          <p className="no-requests">No new requests 📭</p>
        ) : (
          requests.map((req) => (
          <div key={req.id} className="request-card">
            <div className="request-info">
              <span className="request-name">{req.name}</span>
              <span className="request-skill">
                <strong>Offers:</strong> {req.offers}
              </span>
              <span className="request-skill">
                <strong>Wants:</strong> {req.wants}
              </span>
            </div>

            <div className="request-buttons">
              <button className="accept-btn" onClick={() => handleAccept(req.id)}>
                Accept
              </button>
              <button className="decline-btn" onClick={() => handleDecline(req.id)}>
                Decline
              </button>
            </div>
          </div>
        ))
      )}
      </div>
    </div>
  );
}
