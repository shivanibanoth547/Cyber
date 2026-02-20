const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = "mongodb+srv://shivanibanoth547_db_user:shivani%402006@cluster0.ed3kdxv.mongodb.net/soc_ai_assistant?appName=Cluster0";

async function main() {
    await mongoose.connect(MONGODB_URI);
    const user = await mongoose.connection.db.collection("users").findOne({ email: "sunny@gmail.com" });

    if (!user) { console.log("User not found"); return; }

    console.log("User found:");
    console.log("  Name:", user.fullName);
    console.log("  Email:", user.email);
    console.log("  Role:", user.role);
    console.log("  Status:", user.status);
    console.log("  Has password:", !!user.hashedPassword);

    // Test password
    const match = await bcrypt.compare("sunny@123", user.hashedPassword);
    console.log("  Password 'sunny@123' matches:", match);

    await mongoose.disconnect();
}
main().catch(err => { console.error(err); process.exit(1); });
