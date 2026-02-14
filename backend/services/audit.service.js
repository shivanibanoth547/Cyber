const AuditLog = require("../models/AuditLog");

/**
 * Get audit logs with optional filters.
 */
async function getAuditLogs({ page = 1, limit = 50, userId, action }) {
    const filter = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = action;

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "fullName email")
        .lean();

    return { logs, total, page, totalPages: Math.ceil(total / limit) };
}

module.exports = { getAuditLogs };
