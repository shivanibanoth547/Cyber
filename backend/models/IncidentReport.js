const mongoose = require("mongoose");

const IncidentReportSchema = new mongoose.Schema(
    {
        analysisId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LogAnalysis",
            required: true,
        },
        reportTitle: {
            type: String,
            required: true,
            trim: true,
        },
        reportBody: {
            type: String,
            required: true,
        },
        generatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("IncidentReport", IncidentReportSchema);
