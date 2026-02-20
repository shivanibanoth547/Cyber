const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const { PORT, CORS_ORIGIN } = require("./config/env");

// Route imports
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const analysisRoutes = require("./routes/analysis.routes");
const reportRoutes = require("./routes/report.routes");

const app = express();

// ---- Security Middleware ----
app.use(helmet());
const allowedOrigins = CORS_ORIGIN.split(",").map((o) => o.trim());
app.use(
    cors({
        origin: (origin, cb) => {
            if (!origin || allowedOrigins.includes(origin)) cb(null, true);
            else cb(new Error("CORS not allowed"));
        },
        credentials: true,
    })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests, please try again later" },
});
app.use("/api/", limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: "Too many authentication attempts" },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ---- Connect to MongoDB ----
connectDB();

// ---- API Routes ----
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/reports", reportRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "SOC AI Assistant API",
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("[Error]", err.stack);
    res.status(500).json({ error: "Internal server error" });
});

// ---- Start Server (only when not on Vercel) ----
if (process.env.VERCEL !== "1") {
    app.listen(PORT, () => {
        console.log(`\n🛡️  SOC AI Assistant API running on port ${PORT}`);
        console.log(`📄  Health check: http://localhost:${PORT}/api/health\n`);
    });
}

// Export for Vercel serverless
module.exports = app;
