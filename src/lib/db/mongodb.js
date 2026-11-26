import "server-only"

// MongoClient creates the connection to Atlas.

import { MongoClient } from "mongodb"

// process.env reads our private configuration from .env.local.

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
    throw new Error("MONGODB_URI is missing from .env.local")
}

if (!dbName) {
    throw new Error("MONGODB_DB is missing from .env.local")
}

const options = {};

let clientPromise;

// client.connect() establishes the connection.

// globalThis._mongoClientPromise helps reuse the connection across development hot reloads.

if (process.env.NODE_ENV === "development") {
    if (!globalThis._mongoClientPromise) {
        const client = new MongoClient(uri, options);
        globalThis._mongoClientPromise = client.connect();
    }

    clientPromise = globalThis._mongoClientPromise;

} else {
    const client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

// client.db(dbName) selects our application database.

export async function getDatabase() {
    const client = await clientPromise;
    return client.db(dbName);
}

// Export mongoDb Client
export async function getMongoClient() {
    return await clientPromise
}