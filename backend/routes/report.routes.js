const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/rbac.middleware");
const { generateReport, getReports, getReportById } = require("../services/report.service");

router.use(authenticate);
router.use(authorize("admin", "soc_manager", "soc_analyst"));

/**
 * POST /api/reports/generate/:analysisId
 * Generate an incident report from an analysis.
 */
router.post("/generate/:analysisId", async (req, res) => {
    try {
        const report = await generateReport({
            analysisId: req.params.analysisId,
            userId: req.user._id,
            ipAddress: req.ip,
        });
        res.status(201).json({ message: "Report generated", report });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/reports
 * Get all incident reports.
 */
router.get("/", async (req, res) => {
    try {
        const reports = await getReports(req.user._id, req.user.role);
        res.json({ reports });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/reports/:id
 * Get a single incident report.
 */
router.get("/:id", async (req, res) => {
    try {
        const report = await getReportById(req.params.id);
        if (!report) return res.status(404).json({ error: "Report not found" });
        res.json({ report });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
