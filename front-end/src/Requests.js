import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Requests.css";

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const url = `${process.env.REACT_APP_MOCKAROO_URL}?count=${process.env.REACT_APP_MOCKAROO_COUNT}&key=${process.env.REACT_APP_MOCKAROO_KEY}`;
        const res = await axios.get(url);
        console.log("Mockaroo data:", res.data);

        const mapped = res.data
          .slice(0, 10) 
          .map((user) => ({
            id: user.userId || user.id,
            name: user.username || `${user.first_name} ${user.last_name}`,
            offers: Array.isArray(user.skillsAcquired)
              ? user.skillsAcquired[Math.floor(Math.random() * user.skillsAcquired.length)] || "N/A"
              : user.skillsAcquired || user._allSkills || "N/A",
            wants: Array.isArray(user.skillsWanted)
              ? user.skillsWanted[Math.floor(Math.random() * user.skillsWanted.length)] || "N/A"
              : user.skillsWanted || "N/A",
            profile: user.profile_photo || "",
          }));

        setRequests(mapped);
      } catch (err) {
        console.error("Error fetching Mockaroo data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAccept = (id) => {
    const req = requests.find((r) => r.id === id);
    alert(`Accepted request from ${req.name}`);
    setRequests(requests.filter((r) => r.id !== id));
  };

  const handleDecline = (id) => {
    const req = requests.find((r) => r.id === id);
    alert(`Declined request from ${req.name}`);
    setRequests(requests.filter((r) => r.id !== id));
  };

  if (loading) return <p>Loading requests...</p>;

  return (
    <div className="requests-container">
      <h2 className="requests-title">Incoming Requests</h2>

      {requests.length === 0 ? (
        <p className="no-requests">No new requests 📭</p>
      ) : (
        requests.map((req) => (
          <div key={req.id} className="request-card">
            <div className="request-info">
              {req.profile && (
                <img
                  src={req.profile}
                  alt={req.name}
                  className="request-profile-photo"
                />
              )}
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
  );
}
