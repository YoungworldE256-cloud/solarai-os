import "server-only"

import { getDatabase } from "@/lib/db/mongodb"
import { userSchema } from "@/lib/validations/users"

export async function createUser(input) {

    // 1. Validate the information
    const data = userSchema.parse(input);

    // 2. Connect to our database
    const db = await getDatabase();

    // 3. Select the users collection
    const users = db.collection("users")

    // 4. Create timestamps
    const now = new Date();

    // 5. Build the user document
    const user = {
        ...data,
        createdAt: now,
        updatedAt: now
    }

    // 6. Insert the user into MongoDB
    const result = await users.insertOne(user);

    // 7. Return the created user
    return {
        ...user,
        _id: result.insertedId
    }

}
