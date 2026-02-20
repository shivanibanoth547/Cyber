/**
 * One-time script to promote the first registered user to admin + approved.
 * Usage: node scripts/promote-admin.js
 */
const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://shivanibanoth547_db_user:shivani%402006@cluster0.ed3kdxv.mongodb.net/soc_ai_assistant?appName=Cluster0";

async function main() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const result = await mongoose.connection.db.collection("users").findOneAndUpdate(
        {},
        { $set: { status: "approved", role: "admin" } },
        { returnDocument: "after" }
    );

    if (result) {
        console.log(`✅ Promoted user: ${result.fullName} (${result.email}) → admin, approved`);
    } else {
        console.log("No users found in database");
    }

    await mongoose.disconnect();
    console.log("Done");
}

main().catch(err => { console.error(err); process.exit(1); });
