const crypto = require("crypto");

/**
 * Compute SHA-256 hash of a string.
 */
function hashString(input) {
    return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

/**
 * Compute SHA-256 hash of a Buffer.
 */
function hashBuffer(buffer) {
    return crypto.createHash("sha256").update(buffer).digest("hex");
}

module.exports = { hashString, hashBuffer };
