const AuditLog = require("../models/AuditLog");

/**
 * Creates an audit log entry.
 */
const createAuditEntry = async ({ userId, action, resource, detail, ipAddress }) => {
    try {
        await AuditLog.create({
            userId: userId || null,
            action,
            resource,
            detail: detail || "",
            ipAddress: ipAddress || "unknown",
        });
    } catch (error) {
        console.error("[Audit] Failed to write audit log:", error.message);
    }
};

/**
 * Middleware: automatically log request to audit trail.
 */
const auditMiddleware = (action, resource) => {
    return async (req, res, next) => {
        res.on("finish", async () => {
            if (res.statusCode < 400) {
                await createAuditEntry({
                    userId: req.user?._id,
                    action,
                    resource,
                    detail: `${req.method} ${req.originalUrl} -> ${res.statusCode}`,
                    ipAddress: req.ip || req.connection?.remoteAddress,
                });
            }
        });
        next();
    };
};

module.exports = { createAuditEntry, auditMiddleware };
