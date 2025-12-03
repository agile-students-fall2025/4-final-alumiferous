import React, { useEffect, useState } from "react";
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

export default function Requests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        console.log('Received requests data:', data);

        const normalized = (Array.isArray(data) ? data : [data]).map(
          (req, i) => ({
            id: req._id || req.id || i,
            // person who wants to learn from me
            name: req.requesterName || "Unknown learner",
            // what they WANT to learn from the owner
            wants: req.skillName || "N/A",
            // their message/introduction
            message: req.message || "No message provided",
            // when the request was created
            createdAt: req.createdAt,
            // Store the requesterId - handle both object (populated) and string cases
            requesterId: typeof req.requesterId === 'object' && req.requesterId?._id 
                        ? String(req.requesterId._id) 
                        : String(req.requesterId),
          })
        );

        console.log('Normalized requests:', normalized);
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
        return null;
      }

      const updated = await res.json();
      console.log("Updated request on server:", updated);

      // Remove the request from the UI list since it's no longer pending
      setRequests((prev) => prev.filter((r) => r.id !== id));
      
      return updated;
    } catch (err) {
      console.error("Error updating request status:", err);
      alert("Error updating request status. Check console for details.");
      return null;
    }
  };

  const handleAccept = async (requestId) => {
    try {
      // Get the current user's ID
      const currentUserId = localStorage.getItem('userId');
      
      if (!currentUserId) {
        alert('Please log in to accept requests');
        return;
      }
      
      // Find the request to get the requester's ID
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        console.error('Request not found');
        alert('Error: Request not found');
        return;
      }
      
      if (!request.requesterId) {
        console.error('Requester ID not found in request');
        alert('Error: Could not identify the requester');
        return;
      }
      
      console.log('Accepting request from:', request.name, 'ID:', request.requesterId);
      
      // First, update the request status to accepted
      const updatedRequest = await updateRequestStatus(requestId, "accepted");
      
      if (!updatedRequest) {
        return; // Error already handled in updateRequestStatus
      }
      
      console.log('Finding or creating chat between:', currentUserId, 'and', request.requesterId);
      
      // Find or create a chat between the current user and the requester
      const chatRes = await fetch('/api/chats/find-or-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          friendId: String(request.requesterId)
        })
      });
      
      console.log('Chat response status:', chatRes.status);
      
      if (chatRes.ok) {
        const chat = await chatRes.json();
        console.log('Chat created/found:', chat);
        
        if (!chat._id) {
          console.error('Chat object missing _id:', chat);
          alert('Request accepted, but chat data is invalid. Please check the Chat page manually.');
          return;
        }
        
        console.log('Navigating to chat:', chat._id);
        // Navigate to the Messages page with the chat ID
        navigate(`/chat/${chat._id}`);
      } else {
        const errorData = await chatRes.json().catch(() => ({}));
        console.error('Failed to create/find chat. Status:', chatRes.status, 'Error:', errorData);
        alert(`Request accepted, but failed to open chat (Error ${chatRes.status}). Please check the Chat page.`);
      }
    } catch (err) {
      console.error('Error accepting request:', err);
      alert(`Error accepting request: ${err.message}. Check console for details.`);
    }
  };

  const handleDecline = (id) => {
    updateRequestStatus(id, "declined");
  };

  if (loading) return <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading requests…</p>;
  if (error) return <p className="text-center text-danger py-8">{error}</p>;

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] pt-[65px]">
      <header className="fixed top-[65px] left-0 right-0 z-10 flex items-center gap-4 px-4 py-3 border-b border-gray-200 dark:border-[#333] bg-white dark:bg-[#121212]">
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={() => window.history.back()}
          aria-label="Go back"
        >
          <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Incoming Requests</h2>
      </header>

      <div className="px-4 py-6 pt-[72px] pb-20">
        {requests.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No new requests </p>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="card mb-4 p-4">
              <div className="mb-4">
                <span className="block text-lg font-semibold text-gray-900 dark:text-white mb-2">{req.name}</span>
                <span className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  <strong>Offers:</strong> {req.offers}
                </span>
                <span className="block text-sm text-gray-700 dark:text-gray-300">
                  <strong>Wants:</strong> {req.wants}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  className="btn btn-primary flex-1"
                  onClick={() => handleAccept(req.id)}
                >
                  Accept
                </button>
                <button
                  className="btn bg-danger hover:bg-red-700 text-white flex-1"
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
