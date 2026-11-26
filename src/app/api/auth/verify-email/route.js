import "server-only"

import { NextResponse } from "next/server";
import { verifyEmail } from "@/lib/services/email-verification";


export const runtime = "nodejs";

export async function POST(request) {
    // 1 Read the JSON body
    let body;

    try {
        body = await request.json();

    } catch {
        return NextResponse.json(
            {
                success: false,
                error: "Invalid JSON request body"
                    
            },
            { status: 400 }
        );
    }

    // 2. validate the submitted token
    const token = body?.token;

    if (
        typeof token !== "string" ||
        !/^[a-f0-9]{64}$/i.test(token)

    ) {
        return NextResponse.json(
            {
                success: false,
                error: "Invalid verification token"
            },
            { status: 400 }
        );
    }

    // 3 Call the verification service
    try {

        const result = await verifyEmail(token); 

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Verification link is expired or invalid"
                },
                { status: 400}
            );
        }

        // return a successful response
        return NextResponse.json(
            {
                success: true,
                message: "Email verified successfully"
            },
            { status: 200 }
        );
    } catch (error) {
        // 5. Log unexpected errors on the server
        console.error(
            "Email verification failed",
            error
        );

        return NextResponse.json(
            {
            success: false,
            error: "Unable to verify email right now"
            },
            { status: 500 }
        );
    }
 
}