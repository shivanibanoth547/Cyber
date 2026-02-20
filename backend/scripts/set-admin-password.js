/**
 * One-time script to set admin password.
 * Usage: node scripts/set-admin-password.js
 */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = "mongodb+srv://shivanibanoth547_db_user:shivani%402006@cluster0.ed3kdxv.mongodb.net/soc_ai_assistant?appName=Cluster0";

async function main() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const hashedPassword = await bcrypt.hash("sunny@123", 12);

    const result = await mongoose.connection.db.collection("users").findOneAndUpdate(
        { email: "sunny@gmail.com" },
        { $set: { hashedPassword, status: "approved", role: "admin" } },
        { returnDocument: "after" }
    );

    if (result) {
        console.log(`✅ Updated: ${result.fullName} (${result.email})`);
        console.log(`   Role: admin | Status: approved | Password: sunny@123`);
    } else {
        console.log("User not found");
    }

    await mongoose.disconnect();
    console.log("Done");
}

main().catch(err => { console.error(err); process.exit(1); });
