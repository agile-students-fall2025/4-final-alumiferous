// back-end/routes/requests.js
import express from "express";

const router = express.Router();

// In-memory "database" for requests
// Structure: { requestId, skillId, skillName, requesterId, requesterName, ownerId, ownerName, message, status, createdAt }
let requests = [];

/**
 * POST /api/requests
 * Creates a new request to learn a skill
 * Expects: { skillId, skillName, ownerId, ownerName, requesterId, requesterName, message }
 */
router.post("/", (req, res) => {
  const { skillId, skillName, ownerId, ownerName, requesterId, requesterName, message } = req.body;

  // Validate required fields
  if (!skillId || !ownerId || !requesterId || !message) {
    return res.status(400).json({
      error: "skillId, ownerId, requesterId, and message are required",
    });
  }

  // Auto-generate a new requestId
  const newRequestId = requests.length ? requests[requests.length - 1].requestId + 1 : 1;

  const newRequest = {
    requestId: newRequestId,
    skillId: Number(skillId),
    skillName: skillName || "Unknown Skill",
    ownerId: Number(ownerId), // The user who owns the skill (will receive this request)
    ownerName: ownerName || "Unknown Owner",
    requesterId: Number(requesterId), // The user making the request
    requesterName: requesterName || "Unknown User",
    message: message.trim(),
    status: "pending", // pending, accepted, declined
    createdAt: new Date().toISOString(),
  };

  requests.push(newRequest);
  
  // Debug logging
  console.log(`[DEBUG] New request created:`, JSON.stringify(newRequest, null, 2));
  console.log(`[DEBUG] Total requests now: ${requests.length}`);

  return res.status(201).json(newRequest);
});

/**
 * GET /api/requests/incoming
 * Fetches incoming requests for a user (requests for skills they own)
 * Query params: userId (required)
 * NOTE: This route must be defined BEFORE /:requestId to avoid route conflicts
 */
router.get("/incoming", (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({
      error: "userId query parameter is required",
    });
  }

  const userIdNum = Number(userId);
  
  // Debug logging
  console.log(`[DEBUG] Fetching incoming requests for userId: ${userIdNum}`);
  console.log(`[DEBUG] Total requests in storage: ${requests.length}`);
  console.log(`[DEBUG] All requests:`, JSON.stringify(requests, null, 2));

  // Filter requests where the ownerId matches the userId
  // These are requests from other users wanting to learn skills owned by this user
  const incomingRequests = requests.filter(
    (request) => request.ownerId === userIdNum && request.status === "pending"
  );

  console.log(`[DEBUG] Filtered incoming requests: ${incomingRequests.length}`);
  
  return res.json(incomingRequests);
});

/**
 * GET /api/requests/all
 * Debug endpoint to see all requests (for testing)
 */
router.get("/all", (req, res) => {
  return res.json({
    total: requests.length,
    requests: requests
  });
});

/**
 * PATCH /api/requests/:requestId
 * Updates request status (accept/decline)
 * Expects: { status: "accepted" | "declined" }
 */
router.patch("/:requestId", (req, res) => {
  const requestId = Number(req.params.requestId);
  const { status } = req.body;

  if (!status || !["accepted", "declined"].includes(status)) {
    return res.status(400).json({
      error: "status must be 'accepted' or 'declined'",
    });
  }

  const request = requests.find((r) => r.requestId === requestId);

  if (!request) {
    return res.status(404).json({
      error: "Request not found",
    });
  }

  request.status = status;
  request.updatedAt = new Date().toISOString();

  return res.json(request);
});

export default router;

