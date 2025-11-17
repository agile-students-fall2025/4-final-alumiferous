// back-end/routes/reports.js
import express from "express";

const router = express.Router();

// In-memory "database" for reports
// Structure:
// {
//   reportId,
//   reporterId,
//   targetType,   // 'user' | 'skill' | 'bug' | etc
//   targetId,     // e.g. userId/skillId or null
//   category,     // 'abuse' | 'bug' | 'spam' | etc
//   message,
//   createdAt,
// }
let reports = [];

/**
 * POST /api/reports
 * Report a problem / user / skill / bug.
 * Body expects:
 * {
 *   reporterId,
 *   targetType,
 *   targetId,
 *   category,
 *   message
 * }
 */
router.post("/", (req, res) => {
  const { reporterId, targetType, targetId, category, message } = req.body;

  if (!reporterId || !targetType || !category || !message) {
    return res.status(400).json({
      success: false,
      message:
        "reporterId, targetType, category, and message are required fields.",
    });
  }

  const newReportId = reports.length
    ? reports[reports.length - 1].reportId + 1
    : 1;

  const newReport = {
    reportId: newReportId,
    reporterId: Number(reporterId),
    targetType,
    targetId: targetId ?? null,
    category,
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };

  reports.push(newReport);
  console.log("New report created:", newReport);

  return res.status(201).json({
    success: true,
    report: newReport,
  });
});

/**
 * Optional debug route:
 * GET /api/reports/all
 */
router.get("/all", (req, res) => {
  return res.json({
    total: reports.length,
    reports,
  });
});

export default router;
