import "server-only"

import { getDatabase,
         getMongoClient
 } from "@/lib/db/mongodb";

import {
    generateVerificationToken,
    hashVerificationToken,
    getVerificationExpiration
} from "@/lib/auth/verification-tokens";

import { ObjectId } from "mongodb";





export async function createEmailVerificationToken(
  userId,
  { session } = {}
) {

    if (
     !(userId instanceof ObjectId) &&
     !(
       typeof userId === "string" &&
       /^[a-f0-9]{24}$/i.test(userId)
      )
    ) {
      throw new Error("INVALID_USER_ID");
    }

    const normalizedUserId = 
       userId instanceof ObjectId 
           ? userId
           : new ObjectId(userId);
    
    // 1. Generate the original random token
    const token = generateVerificationToken();

    // 2. Hash the token for database storage
    const tokenHash = hashVerificationToken(token);

    // 3. Calculate expiration
    const expiresAt = getVerificationExpiration();

    // 4. Connect to MongoDb
    const db = await getDatabase();

    // 5. Select the verification collection
    const tokens = db.collection("emailVerificationTokens");

    // 6. Save the Verification Record
    await tokens.insertOne({
        userId: normalizedUserId,
        tokenHash,
        expiresAt,
        createdAt: new Date()
    },
    { session }
  );

    // 7. Return the original token for email delivery
    return token
}

export async function verifyEmail(token) {
  // 1. Validate the original token
  if (
    typeof token !== "string" ||
    !/^[a-f0-9]{64}$/i.test(token)
  ) {
    return {
      success: false,
      reason: "invalid"
    };
  }

  // 2. Hash the token
  const tokenHash = hashVerificationToken(token);

  // 3. Get MongoDB client and database
  const client = await getMongoClient();
  const db = await getDatabase();

  const tokens = db.collection("emailVerificationTokens");
  const users = db.collection("users");

  // 4. Start a transaction session
  const session = client.startSession();

  try {
    return await session.withTransaction(async () => {
      const now = new Date();

      // 5. Find and consume the unexpired token
      const record = await tokens.findOneAndDelete(
        {
          tokenHash,
          expiresAt: { $gt: now }
        },
        { session }
      );

      if (!record) {
        return {
          success: false,
          reason: "invalid_or_expired"
        };
      }

      // 6. Validate the user ID stored in the token
      const storedUserId = record.userId;

      if (
        !(storedUserId instanceof ObjectId) &&
        !(
          typeof storedUserId === "string" &&
          /^[a-f0-9]{24}$/i.test(storedUserId)
        )
      ) {
        throw new Error("INVALID_STORED_USER_ID");
      }

      const userId =
        storedUserId instanceof ObjectId
          ? storedUserId
          : new ObjectId(storedUserId);

      // 7. Activate the pending user
      const userResult = await users.updateOne(
        {
          _id: userId,
          status: "pending",
          emailVerifiedAt: null
        },
        {
          $set: {
            status: "active",
            emailVerifiedAt: now,
            updatedAt: now
          }
        },
        { session }
      );

      if (userResult.modifiedCount !== 1) {
        throw new Error("ACCOUNT_ACTIVATION_CONFLICT");
      }

      // 8. Return successful verification
      return {
        success: true,
        userId: userId.toString()
      };
    });
  } finally {
    await session.endSession();
  }
}