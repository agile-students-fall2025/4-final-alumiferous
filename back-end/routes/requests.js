// back-end/routes/requests.js
import express from "express";
import axios from "axios";
import Request from "../models/Request.js";

const router = express.Router();

/**
 * POST /api/requests
 * Creates a new request to learn a skill.
 * Body expects:
 * { skillId, skillName, ownerId, ownerName, requesterId, requesterName, message }
 */
router.post("/", async (req, res) => {
  const {
    skillId,
    skillName,
    ownerId,
    ownerName,
    requesterId,
    requesterName,
    message,
  } = req.body;

  // Validate required fields
  if (!skillId || !ownerId || !requesterId || !message) {
    return res.status(400).json({
      error: "skillId, ownerId, requesterId, and message are required",
    });
  }

  try {
    // Check if a pending request already exists for this skill from this requester
    const existingRequest = await Request.findOne({
      skillId,
      requesterId,
      status: "pending"
    });

    if (existingRequest) {
      return res.status(409).json({
        error: "You have already sent a request for this skill",
        existingRequest: existingRequest
      });
    }

    const newRequest = new Request({
      skillId,
      skillName: skillName || "Unknown Skill",
      ownerId,
      ownerName: ownerName || "Unknown Owner",
      requesterId,
      requesterName: requesterName || "Unknown User",
      message: message.trim(),
      status: "pending",
    });

    await newRequest.save();
    return res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error creating request:", error);
    return res.status(500).json({ error: "Failed to create request" });
  }
});

/**
 * GET /api/requests/check?skillId=123&requesterId=456
 * Check if a pending request already exists for this skill from this requester
 */
router.get("/check", async (req, res) => {
  const { skillId, requesterId } = req.query;

  if (!skillId || !requesterId) {
    return res.status(400).json({
      error: "skillId and requesterId query parameters are required",
    });
  }

  try {
    const existingRequest = await Request.findOne({
      skillId,
      requesterId,
      status: "pending"
    });

    return res.json({
      exists: !!existingRequest,
      request: existingRequest
    });
  } catch (error) {
    console.error("Error checking for existing request:", error);
    return res.status(500).json({ error: "Failed to check request" });
  }
});

/**
 * GET /api/requests/incoming?userId=123
 * Fetches incoming requests for a skill owner from MongoDB.
 */
router.get("/incoming", async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({
      error: "userId query parameter is required",
    });
  }

  try {
    const incoming = await Request.find({
      ownerId: userId,
      status: "pending"
    })
    .populate('requesterId', 'username firstName lastName email')
    .sort({ createdAt: -1 });

    // Map requests to include the actual user's name from the populated data
    const requestsWithNames = incoming.map(req => {
      const requester = req.requesterId || {};
      const actualName = requester.username || 
                        `${requester.firstName || ''} ${requester.lastName || ''}`.trim() ||
                        requester.email?.split('@')[0] ||
                        req.requesterName ||
                        'Unknown User';
      
      return {
        ...req.toObject(),
        requesterName: actualName
      };
    });

    return res.json(requestsWithNames);
  } catch (error) {
    console.error("Error fetching incoming requests:", error);
    return res.status(500).json({ error: "Failed to fetch requests" });
  }
});

/**
 * GET /api/requests/all
 * Debug endpoint: returns all requests from MongoDB (for testing).
 */
router.get("/all", async (req, res) => {
  try {
    const allRequests = await Request.find({}).sort({ createdAt: -1 });
    return res.json({
      total: allRequests.length,
      requests: allRequests,
    });
  } catch (error) {
    console.error("Error fetching all requests:", error);
    return res.status(500).json({ error: "Failed to fetch requests" });
  }
});

/**
 * PATCH /api/requests/:requestId
 * Updates a request's status (accept / decline).
 * Body expects: { status: "accepted" | "declined" }
 */
router.patch("/:requestId", async (req, res) => {
  const requestId = req.params.requestId;
  const { status } = req.body;

  if (!status || !["accepted", "declined"].includes(status)) {
    return res.status(400).json({
      error: "status must be 'accepted' or 'declined'",
    });
  }

  try {
    const request = await Request.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        error: "Request not found",
      });
    }

    return res.json(request);
  } catch (error) {
    console.error("Error updating request:", error);
    return res.status(500).json({ error: "Failed to update request" });
  }
});

/**
 * GET /api/requests/mock-incoming?userId=123
 * DEPRECATED: Use /api/requests/incoming instead.
 * Legacy endpoint kept for backwards compatibility.
 */
router.get("/mock-incoming", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "userId query parameter is required" });
  }

  try {
    const incoming = await Request.find({
      ownerId: userId,
      status: "pending"
    })
    .populate('requesterId', 'username firstName lastName email')
    .sort({ createdAt: -1 });

    // Map requests to include the actual user's name from the populated data
    const requestsWithNames = incoming.map(req => {
      const requester = req.requesterId || {};
      const actualName = requester.username || 
                        `${requester.firstName || ''} ${requester.lastName || ''}`.trim() ||
                        requester.email?.split('@')[0] ||
                        req.requesterName ||
                        'Unknown User';
      
      return {
        ...req.toObject(),
        requesterName: actualName
      };
    });

    return res.json(requestsWithNames);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return res.status(500).json({ error: "Failed to fetch requests" });
  }
});

export default router;
