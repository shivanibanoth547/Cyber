const IncidentReport = require("../models/IncidentReport");
const LogAnalysis = require("../models/LogAnalysis");
const { createAuditEntry } = require("../middleware/audit.middleware");

/**
 * Generate an incident report from an analysis.
 */
async function generateReport({ analysisId, userId, ipAddress }) {
    const analysis = await LogAnalysis.findById(analysisId);
    if (!analysis) throw new Error("Analysis not found");

    const reportTitle = `Incident Report — ${analysis.severity} Severity — ${new Date().toISOString().split("T")[0]}`;

    const reportBody = `
=====================================
INCIDENT REPORT
=====================================

Report Date:       ${new Date().toISOString()}
Severity Level:    ${analysis.severity}
MITRE ATT&CK:     ${analysis.mitreTechnique}
Analyst ID:        ${userId}

-------------------------------------
THREAT SUMMARY
-------------------------------------
${analysis.threatSummary}

-------------------------------------
LOG SNIPPET
-------------------------------------
${analysis.logSnippet || "N/A"}

-------------------------------------
RECOMMENDED ACTIONS
-------------------------------------
${analysis.recommendedActions.map((a, i) => `${i + 1}. ${a}`).join("\n")}

-------------------------------------
RAW AI ANALYSIS
-------------------------------------
${analysis.rawAiResponse || "N/A"}

=====================================
END OF REPORT
=====================================
  `.trim();

    const report = await IncidentReport.create({
        analysisId,
        reportTitle,
        reportBody,
        generatedBy: userId,
    });

    await createAuditEntry({
        userId,
        action: "REPORT_GENERATED",
        resource: "reports",
        detail: `Generated report for analysis ${analysisId}`,
        ipAddress,
    });

    return report;
}

/**
 * Get reports — all for admins/managers, own for analysts.
 */
async function getReports(userId, role) {
    const filter = role === "admin" || role === "soc_manager" ? {} : { generatedBy: userId };
    return IncidentReport.find(filter)
        .sort({ createdAt: -1 })
        .populate("generatedBy", "fullName email")
        .populate("analysisId", "severity mitreTechnique")
        .lean();
}

/**
 * Get a single report by ID.
 */
async function getReportById(reportId) {
    return IncidentReport.findById(reportId)
        .populate("generatedBy", "fullName email")
        .populate("analysisId")
        .lean();
}

module.exports = { generateReport, getReports, getReportById };
