import "server-only";

import { getDatabase } from "@/lib/db/mongodb";
import { organizationSchema } from "@/lib/validations/organization";

export async function createOrganization(input) {
    // 1. Validate the organization data
    const data = organizationSchema.parse(input);

    // 2. Get Out Database
    const db = await getDatabase();

    // 3. Select the organizations collection
    const organizations = db.collection("organizations");

    // 4. Build The Document
    const now = new Date();

    const organization = {
        ...data,
        createdAt: now,
        updatedAt: now
    };

    // 5. Insert Into MongoDB
    const result = await organizations.insertOne(organization);

    // 6. Return The New Organization
    return {
        ...organization,
        _id: result.insertedId
    }
}
