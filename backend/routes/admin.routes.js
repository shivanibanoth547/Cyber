const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/rbac.middleware");
const { auditMiddleware } = require("../middleware/audit.middleware");
const {
    getPendingUsers,
    approveUser,
    rejectUser,
    assignRole,
    disableUser,
    getAllUsers,
} = require("../services/user.service");
const { getAuditLogs } = require("../services/audit.service");

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(authorize("admin"));

/**
 * GET /api/admin/users
 * Get all users.
 */
router.get("/users", async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json({ users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/admin/pending-users
 * Get users awaiting approval.
 */
router.get(
    "/pending-users",
    auditMiddleware("VIEW_PENDING_USERS", "user_management"),
    async (req, res) => {
        try {
            const users = await getPendingUsers();
            res.json({ users });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * POST /api/admin/approve/:userId
 */
router.post("/approve/:userId", async (req, res) => {
    try {
        const result = await approveUser(req.params.userId, req.user._id, req.ip);
        res.json({ message: "User approved", user: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /api/admin/reject/:userId
 */
router.post("/reject/:userId", async (req, res) => {
    try {
        const result = await rejectUser(req.params.userId, req.user._id, req.ip);
        res.json({ message: "User rejected", user: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /api/admin/assign-role/:userId
 */
router.post("/assign-role/:userId", async (req, res) => {
    try {
        const { role } = req.body;
        if (!role) return res.status(400).json({ error: "Role is required" });

        const result = await assignRole(req.params.userId, role, req.user._id, req.ip);
        res.json({ message: "Role assigned", user: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /api/admin/disable/:userId
 */
router.post("/disable/:userId", async (req, res) => {
    try {
        const result = await disableUser(req.params.userId, req.user._id, req.ip);
        res.json({ message: "User disabled", user: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/admin/audit-logs
 */
router.get("/audit-logs", async (req, res) => {
    try {
        const { page, limit, userId, action } = req.query;
        const result = await getAuditLogs({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 50,
            userId,
            action,
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
