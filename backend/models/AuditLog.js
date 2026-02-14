const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        action: {
            type: String,
            required: true,
        },
        resource: {
            type: String,
            required: true,
        },
        detail: {
            type: String,
            default: "",
        },
        ipAddress: {
            type: String,
            default: "unknown",
        },
    },
    {
        timestamps: true,
    }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ userId: 1 });

module.exports = mongoose.model("AuditLog", AuditLogSchema);
