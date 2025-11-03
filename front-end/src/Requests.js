import React, { useEffect, useState } from "react";
import "./Requests.css";

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pickOne = (arr) =>
    Array.isArray(arr) && arr.length > 0
      ? arr[Math.floor(Math.random() * arr.length)]
      : "N/A";

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiKey = process.env.REACT_APP_MOCKAROO_KEY;
        if (!apiKey) throw new Error("Missing REACT_APP_MOCKAROO_KEY env var");

        const res = await fetch(
          "https://api.mockaroo.com/api/27165660?count=1000",
          {
            headers: { "X-API-Key": apiKey },
          }
        );
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const data = await res.json();
        const normalized = (Array.isArray(data) ? data : [data])
          .slice(0, 10)
          .map((user, i) => ({
            id: user.userId || user.id || i,
            name: user.username || `${user.first_name} ${user.last_name}`,
            offers: pickOne(user.skillsAcquired || user._allSkills),
            wants: pickOne(user.skillsWanted),
          }));

        if (isMounted) setRequests(normalized);
      } catch (err) {
        console.error("Failed to load requests:", err);
        setError("Failed to load requests.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => (isMounted = false);
  }, []);

  const handleAccept = (id) => {
    const req = requests.find((r) => r.id === id);
    alert(`Accepted request from ${req.name}`);
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDecline = (id) => {
    const req = requests.find((r) => r.id === id);
    alert(`Declined request from ${req.name}`);
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading) return <p className="no-requests">Loading requests…</p>;
  if (error) return <p className="no-requests">{error}</p>;

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
              <button
                className="accept-btn"
                onClick={() => handleAccept(req.id)}
              >
                Accept
              </button>
              <button
                className="decline-btn"
                onClick={() => handleDecline(req.id)}
              >
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
