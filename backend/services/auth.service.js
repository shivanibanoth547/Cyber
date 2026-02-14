const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET, JWT_EXPIRES_IN, MAX_LOGIN_ATTEMPTS, LOCK_DURATION_MINUTES } = require("../config/env");
const { createAuditEntry } = require("../middleware/audit.middleware");

const SALT_ROUNDS = 12;

/**
 * Register a new user (status = pending).
 */
async function registerUser({ email, password, fullName }) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
        throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
        email: email.toLowerCase(),
        hashedPassword,
        fullName,
        role: "soc_analyst",
        status: "pending",
    });

    return { id: user._id, email: user.email, fullName: user.fullName, status: user.status };
}

/**
 * Login with account locking.
 */
async function loginUser({ email, password, ipAddress }) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new Error("Invalid credentials");
    }

    // Check account lock
    if (user.isLocked()) {
        const remaining = Math.ceil((user.lockedUntil - Date.now()) / 60000);
        throw new Error(`Account locked. Try again in ${remaining} minutes.`);
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
        user.failedLoginAttempts += 1;

        if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
            user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
            await user.save();

            await createAuditEntry({
                userId: user._id,
                action: "ACCOUNT_LOCKED",
                resource: "auth",
                detail: `Account locked after ${MAX_LOGIN_ATTEMPTS} failed attempts`,
                ipAddress,
            });

            throw new Error("Account locked due to too many failed attempts");
        }

        await user.save();
        throw new Error("Invalid credentials");
    }

    // Check approval status
    if (user.status !== "approved") {
        throw new Error(`Account status: ${user.status}. Please wait for admin approval.`);
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await user.save();

    // Generate JWT
    const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    await createAuditEntry({
        userId: user._id,
        action: "LOGIN",
        resource: "auth",
        detail: "Successful login",
        ipAddress,
    });

    return {
        token,
        user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            status: user.status,
        },
    };
}

module.exports = { registerUser, loginUser };
