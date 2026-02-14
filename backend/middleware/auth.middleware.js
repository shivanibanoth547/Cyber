const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../config/env");

/**
 * Middleware: verify JWT token and attach user to req.user
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.userId).select("-hashedPassword");
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        if (user.status !== "approved") {
            return res.status(403).json({ error: "Account not approved" });
        }

        if (user.isLocked()) {
            return res.status(423).json({ error: "Account is temporarily locked" });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired" });
        }
        return res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = { authenticate };
