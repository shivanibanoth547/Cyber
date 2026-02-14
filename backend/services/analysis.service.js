const LogAnalysis = require("../models/LogAnalysis");
const { analyzeLog } = require("../ai_engine/engine");
const { hashString } = require("../utils/hash");
const { createAuditEntry } = require("../middleware/audit.middleware");

/**
 * Analyze a log text using the AI engine and store results.
 */
async function analyzeLogContent({ logText, originalFilename, userId, ipAddress }) {
    const logContentHash = hashString(logText);

    // Invoke AI engine
    const aiResult = await analyzeLog(logText);

    const analysis = await LogAnalysis.create({
        userId,
        originalFilename: originalFilename || null,
        logContentHash,
        logSnippet: logText.substring(0, 2000),
        threatSummary: aiResult.threatSummary,
        severity: aiResult.severity,
        mitreTechnique: aiResult.mitreTechnique,
        recommendedActions: aiResult.recommendedActions,
        rawAiResponse: aiResult.rawResponse,
    });

    await createAuditEntry({
        userId,
        action: "LOG_ANALYZED",
        resource: "analysis",
        detail: `Analyzed log: ${originalFilename || "direct_input"} | Severity: ${aiResult.severity}`,
        ipAddress,
    });

    return analysis;
}

/**
 * Get all analyses for a user (or all if admin).
 */
async function getAnalyses(userId, role) {
    const filter = role === "admin" || role === "soc_manager" ? {} : { userId };
    return LogAnalysis.find(filter).sort({ createdAt: -1 }).populate("userId", "fullName email").lean();
}

/**
 * Get a single analysis by ID.
 */
async function getAnalysisById(analysisId) {
    return LogAnalysis.findById(analysisId).populate("userId", "fullName email").lean();
}

module.exports = { analyzeLogContent, getAnalyses, getAnalysisById };
