const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        hashedPassword: {
            type: String,
            required: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ["admin", "soc_manager", "soc_analyst"],
            default: "soc_analyst",
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "disabled"],
            default: "pending",
        },
        failedLoginAttempts: {
            type: Number,
            default: 0,
        },
        lockedUntil: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

UserSchema.methods.isLocked = function () {
    if (!this.lockedUntil) return false;
    return new Date() < this.lockedUntil;
};

module.exports = mongoose.model("User", UserSchema);
