import { MongoClient } from "mongodb";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;


loadEnvConfig(process.cwd());

const client = new MongoClient(process.env.MONGODB_URI);

try {
    await client.connect();

    const db = client.db(process.env.MONGODB_DB);

    await db.collection("organizations").createIndex(
        { slug: 1 },
        { unique: true }
    );

    console.log("Organizations slug index created")

    await db.collection("users").createIndex(
        { email: 1 },
        {
            unique: true,
            name: "users_email_unique"
        }
    );

    console.log("Users unique email index created");

    // Grab emailVerificationTokens Collections
    const verificationTokens = db.collection(
        "emailVerificationTokens"
    );

    // Prevent duplicate token hashes
    await verificationTokens.createIndex(
        { tokenHash: 1 },
        { unique: true }
    );

    // Efficiently find tokens belonging to a user
    await verificationTokens.createIndex(
        { userId: 1 }
    );

    // Automatically remove expired token records
    await verificationTokens.createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0 }
    );

    console.log("Email verification indexes created")
} finally {
    await client.close();

}