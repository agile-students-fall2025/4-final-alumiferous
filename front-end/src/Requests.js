import React, { useEffect, useState } from "react";
import "./Requests.css";

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to randomly pick one element from an array
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

        // Get logged-in user id from localStorage (set in Login.js)
        const storedUserId = localStorage.getItem("userId");

        if (!storedUserId) {
          if (isMounted) {
            setError("Please log in to view your incoming requests.");
            setLoading(false);
          }
          return;
        }

        const res = await fetch(
          `/api/requests/mock-incoming?userId=${storedUserId}`
        );
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const data = await res.json();

        const normalized = (Array.isArray(data) ? data : [data]).map(
          (req, i) => ({
            id: req.requestId ?? req.id ?? i,
            // person who wants to learn from me
            name: req.requesterName || "Unknown learner",
            // what they OFFER (their own skills)
            offers: pickOne(req.skillsAcquired || req._allSkills),
            // what they WANT to learn – same as before
            wants:
              pickOne(req.skillsWanted) ||
              req.skillName ||
              "N/A",
          })
        );

        if (isMounted) setRequests(normalized);
      } catch (err) {
        console.error("Failed to load requests:", err);
        if (isMounted) setError("Failed to load requests.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateRequestStatus = async (id, status) => {
    try {
      // Call backend PATCH to update the request status
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        console.error("Failed to update request status:", res.status);
        alert("Failed to update request status on server.");
        return;
      }

      const updated = await res.json();
      console.log("Updated request on server:", updated);

      // Remove the request from the UI list since it's no longer pending
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error updating request status:", err);
      alert("Error updating request status. Check console for details.");
    }
  };

  const handleAccept = (id) => {
    updateRequestStatus(id, "accepted");
  };

  const handleDecline = (id) => {
    updateRequestStatus(id, "declined");
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
