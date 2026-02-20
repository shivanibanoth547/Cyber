const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/rbac.middleware");
const { uploadLogFile } = require("../middleware/upload.middleware");
const { analyzeLogContent, getAnalyses, getAnalysisById } = require("../services/analysis.service");

// All analysis routes require authentication + approved SOC role
router.use(authenticate);
router.use(authorize("admin", "soc_manager", "soc_analyst"));

/**
 * POST /api/analysis/upload-log
 * Upload a log file or send log text for AI analysis.
 */
router.post("/upload-log", (req, res) => {
    uploadLogFile(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        try {
            let logText = "";
            let originalFilename = null;

            if (req.file) {
                // Read file content from memory buffer
                logText = req.file.buffer.toString("utf-8");
                originalFilename = req.file.originalname;
            } else if (req.body.logText) {
                // Direct text input
                logText = req.body.logText;
                originalFilename = "direct_input";
            } else {
                return res.status(400).json({ error: "Provide a log file or logText in request body" });
            }

            if (logText.trim().length === 0) {
                return res.status(400).json({ error: "Log content cannot be empty" });
            }

            if (logText.length > 50000) {
                return res.status(400).json({ error: "Log content exceeds 50,000 character limit" });
            }

            const analysis = await analyzeLogContent({
                logText,
                originalFilename,
                userId: req.user._id,
                ipAddress: req.ip,
            });

            res.status(201).json({ message: "Analysis complete", analysis });
        } catch (error) {
            console.error("[Analysis] Error:", error.message);
            res.status(500).json({ error: "Analysis failed: " + error.message });
        }
    });
});

/**
 * GET /api/analysis/history
 * Get analysis history.
 */
router.get("/history", async (req, res) => {
    try {
        const analyses = await getAnalyses(req.user._id, req.user.role);
        res.json({ analyses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/analysis/:id
 * Get a specific analysis.
 */
router.get("/:id", async (req, res) => {
    try {
        const analysis = await getAnalysisById(req.params.id);
        if (!analysis) return res.status(404).json({ error: "Analysis not found" });
        res.json({ analysis });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
