const crypto = require("crypto");
const fs = require("fs");

/**
 * Compute SHA-256 hash of a string.
 */
function hashString(input) {
    return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

/**
 * Compute SHA-256 hash of a file by its path.
 */
function hashFile(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(filePath);
        stream.on("data", (chunk) => hash.update(chunk));
        stream.on("end", () => resolve(hash.digest("hex")));
        stream.on("error", reject);
    });
}

module.exports = { hashString, hashFile };
