// back-end/routes/requests.js
import express from "express";
import axios from "axios";

const router = express.Router();

// In-memory "database" for requests
// Structure: {
//   requestId, skillId, skillName,
//   ownerId, ownerName,
//   requesterId, requesterName,
//   message, status, createdAt, updatedAt?,
//   skillsAcquired?, skillsWanted?
// }
let requests = [];
let mockRequestsCache = [];

/**
 * POST /api/requests
 * Creates a new request to learn a skill.
 * Body expects:
 * { skillId, skillName, ownerId, ownerName, requesterId, requesterName, message }
 */
router.post("/", (req, res) => {
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

  const newRequestId = requests.length
    ? requests[requests.length - 1].requestId + 1
    : 1;

  const newRequest = {
    requestId: newRequestId,
    skillId: Number(skillId),
    skillName: skillName || "Unknown Skill",
    ownerId: Number(ownerId), // the user who owns the skill
    ownerName: ownerName || "Unknown Owner",
    requesterId: Number(requesterId), // the user making the request
    requesterName: requesterName || "Unknown User",
    message: message.trim(),
    status: "pending", // pending, accepted, declined
    createdAt: new Date().toISOString(),
  };

  requests.push(newRequest);
  console.log("Saved new request (manual POST):", newRequest);

  return res.status(201).json(newRequest);
});

/**
 * GET /api/requests/incoming?userId=123
 * Fetches incoming requests for a skill owner from the in-memory array.
 */
router.get("/incoming", (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({
      error: "userId query parameter is required",
    });
  }

  const userIdNum = Number(userId);

  const incoming = requests.filter(
    (request) => request.ownerId === userIdNum && request.status === "pending",
  );

  console.log(
    `/api/requests/incoming userId=${userIdNum} -> ${incoming.length} requests`
  );

  return res.json(incoming);
});

/**
 * GET /api/requests/all
 * Debug endpoint: returns all requests (for testing).
 */
router.get("/all", (req, res) => {
  return res.json({
    total: requests.length,
    requests,
  });
});

/**
 * PATCH /api/requests/:requestId
 * Updates a request's status (accept / decline).
 * Body expects: { status: "accepted" | "declined" }
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

  console.log(
    `Updated requestId=${requestId} to status='${status}'`
  );

  return res.json(request);
});

/**
 * GET /api/requests/mock-incoming?userId=123
 *
 * Uses Mockaroo to seed the in-memory "requests" array once,
 * then returns only pending incoming requests for that ownerId.
 * This is what your Requests page is using.
 */
router.get("/mock-incoming", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "userId query parameter is required" });
  }

  const apiKey = process.env.API_SECRET_KEY;

  try {
    // 1) Fetch from Mockaroo once and cache the raw data
    if (mockRequestsCache.length === 0) {
      console.log("Fetching mock requests from Mockaroo…");

      const response = await axios.get(
        "https://api.mockaroo.com/api/27165660?count=200",
        { headers: { "X-API-Key": apiKey } }
      );

      mockRequestsCache = Array.isArray(response.data)
        ? response.data
        : [response.data];
      console.log("Mock requests loaded:", mockRequestsCache.length);
    }

    // 2) Seed the in-memory "requests" array ONCE from Mockaroo
    if (requests.length === 0) {
      requests = mockRequestsCache.map((r, i) => {
        const skillName =
          r.skillName ||
          r.desiredSkill ||
          (Array.isArray(r.skillsWanted) ? r.skillsWanted[0] : "Unknown Skill");

        return {
          requestId: r.requestId || i + 1,
          skillId: r.skillId ? Number(r.skillId) : null,
          skillName,
          ownerId: Number(r.ownerId || r.tutorId || r.skillOwnerId || 1),
          ownerName: r.ownerName || r.tutorName || "Unknown Owner",
          requesterId: Number(r.requesterId || r.userId || r.id || 0),
          requesterName:
            r.requesterName ||
            r.username ||
            `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim(),
          skillsAcquired: r.skillsAcquired || r._allSkills || [],
          skillsWanted: r.skillsWanted || [],
          message: r.message || `Wants to learn ${skillName}`,
          status: "pending",
          createdAt: new Date().toISOString(),
        };
      });
    }

    const userIdNum = Number(userId);

    // 3) Now just filter the in-memory "requests" array by ownerId + pending
    const incoming = requests.filter(
      (req) => req.ownerId === userIdNum && req.status === "pending"
    );

    console.log(
      ` /api/requests/mock-incoming userId=${userIdNum} -> ${incoming.length} requests`
    );

    return res.json(incoming);
  } catch (error) {
    console.error("Mockaroo fetch failed:", error.message);
    return res.status(500).json({ error: "Failed to fetch mock requests" });
  }
});

export default router;
