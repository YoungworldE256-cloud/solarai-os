import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/mongodb";


export async function GET() {
    try {
        const db = await getDatabase();

        await db.command({ ping: 1 });

        return NextResponse.json({
            success: true,
            message: "MongoDB connection successful"
        })
    } catch (error) {
        console.error("Database Connection Failed:", error)

        return NextResponse.json(
            {
                success: false,
                message: "Database Connection Failed"
            },
            {
                status: 500
            }

        )
    }
}