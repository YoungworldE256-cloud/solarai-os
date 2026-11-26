import "server-only";

import {
  getDatabase,
  getMongoClient
} from "../db/mongodb";

import { registrationSchema } from "@/lib/validations/auth";

import { hashPassword } from "@/lib/auth/passwords";

import { createEmailVerificationToken } from "@/lib/services/email-verification";



export async function registerUser(input) {
    // 1. Validate and normalize registration data
    const data = registrationSchema.parse(input);

    // 2. Hash the password before storing it
    const passwordHash = await hashPassword(data.password);

    // 3. Connect to MongoDB
    const db = await getDatabase();

    // 4. Select the users collection
    const users = db.collection("users");

    // 5. Prepare the user document
    const now = new Date();

    const user = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        zipCode: data.zipCode,

        passwordHash,

        status: "pending",
        emailVerifiedAt: null,

        createdAt: now,
        updatedAt: now,
    };

    // 6 Get the mongoDB client
    const client = await getMongoClient();
    
    // 7. Start a mongDB session
    const session = client.startSession();

    try {
        const result = await session.withTransaction(async () => {
            // Create the pending user
            const insertResult = await users.insertOne(
                user,
                { session }
            );

            // Generate and store verification token
            const verificationToken = 
               await createEmailVerificationToken(
                insertResult.insertedId,
                { session }
               );

            return {
                user: {
                    id: insertResult.insertedId.toString(),
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    zipCode: user.zipCode,
                    status: user.status
                },
                verificationToken
            };
        });

        return result;
    } finally {
        await session.endSession();
    }

}