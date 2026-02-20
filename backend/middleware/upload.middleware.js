const multer = require("multer");
const { MAX_FILE_SIZE_MB } = require("../config/env");

const ALLOWED_DOC_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ALLOWED_LOG_TYPES = ["text/plain", "text/csv", "application/json", "application/octet-stream"];

/**
 * Memory storage: files are stored as Buffer in req.file.buffer
 * Works on serverless platforms (Vercel) where disk is not persistent.
 */
const storage = multer.memoryStorage();

/**
 * Identity document upload (PDF, JPG, PNG).
 */
const uploadIdentityDoc = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_DOC_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Allowed: ${ALLOWED_DOC_TYPES.join(", ")}`));
        }
    },
}).single("identityDoc");

/**
 * Log file upload (text, csv, json).
 */
const uploadLogFile = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_LOG_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Allowed: ${ALLOWED_LOG_TYPES.join(", ")}`));
        }
    },
}).single("logFile");

module.exports = { uploadIdentityDoc, uploadLogFile };
