const mongoose = require("mongoose");

const IdentityDocumentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        originalName: {
            type: String,
            required: true,
        },
        storedName: {
            type: String,
            required: true,
        },
        filePath: {
            type: String,
            required: true,
        },
        mimeType: {
            type: String,
            required: true,
            enum: ["application/pdf", "image/jpeg", "image/png"],
        },
        fileSize: {
            type: Number,
            required: true,
        },
        sha256Hash: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("IdentityDocument", IdentityDocumentSchema);
