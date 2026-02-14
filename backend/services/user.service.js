const User = require("../models/User");
const IdentityDocument = require("../models/IdentityDocument");
const { createAuditEntry } = require("../middleware/audit.middleware");

/**
 * Get all pending users with their identity documents.
 */
async function getPendingUsers() {
    const users = await User.find({ status: "pending" }).select("-hashedPassword").lean();

    const userIds = users.map((u) => u._id);
    const docs = await IdentityDocument.find({ userId: { $in: userIds } }).lean();

    return users.map((user) => ({
        ...user,
        identityDocuments: docs.filter((d) => d.userId.toString() === user._id.toString()),
    }));
}

/**
 * Approve a user.
 */
async function approveUser(userId, adminId, ipAddress) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    if (user.status === "approved") throw new Error("User already approved");

    user.status = "approved";
    await user.save();

    await createAuditEntry({
        userId: adminId,
        action: "USER_APPROVED",
        resource: "user_management",
        detail: `Approved user ${user.email} (${userId})`,
        ipAddress,
    });

    return { id: user._id, email: user.email, status: user.status };
}

/**
 * Reject a user.
 */
async function rejectUser(userId, adminId, ipAddress) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.status = "rejected";
    await user.save();

    await createAuditEntry({
        userId: adminId,
        action: "USER_REJECTED",
        resource: "user_management",
        detail: `Rejected user ${user.email} (${userId})`,
        ipAddress,
    });

    return { id: user._id, email: user.email, status: user.status };
}

/**
 * Assign role to a user.
 */
async function assignRole(userId, role, adminId, ipAddress) {
    const validRoles = ["admin", "soc_manager", "soc_analyst"];
    if (!validRoles.includes(role)) throw new Error("Invalid role");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await createAuditEntry({
        userId: adminId,
        action: "ROLE_CHANGED",
        resource: "user_management",
        detail: `Changed role of ${user.email} from ${oldRole} to ${role}`,
        ipAddress,
    });

    return { id: user._id, email: user.email, role: user.role };
}

/**
 * Disable a user account.
 */
async function disableUser(userId, adminId, ipAddress) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.status = "disabled";
    await user.save();

    await createAuditEntry({
        userId: adminId,
        action: "USER_DISABLED",
        resource: "user_management",
        detail: `Disabled user ${user.email} (${userId})`,
        ipAddress,
    });

    return { id: user._id, email: user.email, status: user.status };
}

/**
 * Get all users (admin view).
 */
async function getAllUsers() {
    return User.find().select("-hashedPassword").lean();
}

module.exports = { getPendingUsers, approveUser, rejectUser, assignRole, disableUser, getAllUsers };
