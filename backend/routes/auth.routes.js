const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../services/auth.service");
const { authenticate } = require("../middleware/auth.middleware");
const { uploadIdentityDoc } = require("../middleware/upload.middleware");
const IdentityDocument = require("../models/IdentityDocument");
const { hashFile } = require("../utils/hash");
const { isValidEmail, isStrongPassword } = require("../utils/validators");
const { createAuditEntry } = require("../middleware/audit.middleware");

/**
 * POST /api/auth/register
 * Register a new user account.
 */
router.post("/register", (req, res) => {
    uploadIdentityDoc(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        try {
            const { email, password, fullName } = req.body;

            // Validate input
            if (!email || !password || !fullName) {
                return res.status(400).json({ error: "Email, password, and full name are required" });
            }
            if (!isValidEmail(email)) {
                return res.status(400).json({ error: "Invalid email format" });
            }
            if (!isStrongPassword(password)) {
                return res.status(400).json({
                    error:
                        "Password must be at least 8 characters with uppercase, lowercase, digit, and special character",
                });
            }

            // Register user
            const userData = await registerUser({ email, password, fullName });

            // Save identity document if uploaded
            if (req.file) {
                const sha256Hash = await hashFile(req.file.path);
                await IdentityDocument.create({
                    userId: userData.id,
                    originalName: req.file.originalname,
                    storedName: req.file.filename,
                    filePath: req.file.path,
                    mimeType: req.file.mimetype,
                    fileSize: req.file.size,
                    sha256Hash,
                });
            }

            await createAuditEntry({
                userId: userData.id,
                action: "USER_REGISTERED",
                resource: "auth",
                detail: `New user registered: ${email}`,
                ipAddress: req.ip,
            });

            res.status(201).json({
                message: "Registration successful. Your account is pending admin approval.",
                user: userData,
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
});

/**
 * POST /api/auth/login
 * Authenticate and receive JWT.
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const result = await loginUser({ email, password, ipAddress: req.ip });
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

/**
 * GET /api/auth/me
 * Get current authenticated user profile.
 */
router.get("/me", authenticate, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
