import "server-only"

import { NextResponse } from "next/server"
import { randomBytes } from "node:crypto"
import { sendVerificationEmail } from "@/lib/services/email"



export async function POST() {
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
            {
                success: false,
                message: "Not Found"
            },
            { status: 404 }
        );
    }

    const testEmail = process.env.RESEND_TEST_EMAIL

    if (!testEmail) {
        return NextResponse.json(
            {
                success: false,
                message: "Test email not configured"
            },
            {
                status: 500
            }
        )
    }

    try {
        const token = randomBytes(32).toString("hex");

        const result = await sendVerificationEmail({
            email: testEmail,
            name: "Community Solar OS Tester",
            token
        });

        return NextResponse.json({
            success: true,
            message: "Test email accepted by Resend",
            messageId: result.messageId
        });

    } catch (error) {
        console.error("Development email test failed", error);

        return NextResponse.json(
            {
                success: false,
                message: "Email test failed"
            },
            {
                status: 500
            }
        );       
    }
}