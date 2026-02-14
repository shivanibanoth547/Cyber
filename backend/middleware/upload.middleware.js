const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { MAX_FILE_SIZE_MB, UPLOAD_DIR } = require("../config/env");

const ALLOWED_DOC_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ALLOWED_LOG_TYPES = ["text/plain", "text/csv", "application/json", "application/octet-stream"];

/**
 * Storage engine: saves files with UUID names to prevent collisions.
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const subDir = file.fieldname === "identityDoc" ? "identity_docs" : "logs";
        const dest = path.join(UPLOAD_DIR, subDir);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    },
});

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
