import { config } from "dotenv"

import { MongoClient, ObjectId } from "mongodb"
import { randomBytes, createHash } from "node:crypto"

// Load the same enviroment file as next.js
config({
    path: ".env.local",
    override: true
})

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB

if (!uri || !dbName) {
    throw new Error("MongoDb enviroment variables are missing");
}

const client = new MongoClient(uri);

try {
    await client.connect();

    const db = client.db(dbName)
    const users = db.collection("users")
    const tokens = db.collection("emailVerificationTokens")


    // Create an isolated pending test account
    // This account is for verification testing only

    const userId = new ObjectId();
    const now = new Date();

    await users.insertOne({
        _id: userId,
        name: "Verification Test User",
        email: `verification-test-${userId.toString()}@example.com`,
        status: "pending",
        emailVerifiedAt: null,
        createdAt: now,
        updatedAt: now
    })

    // Generate a genuine 64-character verification token 
    const token = randomBytes(32).toString("hex");

    // Store only its SHA-256 hash
    const tokenHash = createHash("sha256")
       .update(token)
       .digest("hex")

    const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
    );

    await tokens.insertOne({
        userId,
        tokenHash,
        expiresAt,
        createdAt: new Date()
    })

    console.log("test user created at:", userId.toString());
    console.log("Test email:", `verification-test-${userId}@example.com`)
    console.log("Development test token:", token)

    console.log("\nSend this token to:")
    console.log("POST  http://localhost:3000/api/auth/verify-email")

} finally {
    await client.close();
}