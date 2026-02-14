const mongoose = require("mongoose");

const LogAnalysisSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        originalFilename: {
            type: String,
            default: null,
        },
        logContentHash: {
            type: String,
            required: true,
        },
        logSnippet: {
            type: String,
            maxlength: 2000,
        },
        threatSummary: {
            type: String,
            required: true,
        },
        severity: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            required: true,
        },
        mitreTechnique: {
            type: String,
            default: "N/A",
        },
        recommendedActions: {
            type: [String],
            default: [],
        },
        rawAiResponse: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("LogAnalysis", LogAnalysisSchema);
