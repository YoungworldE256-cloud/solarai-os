import "server-only";

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { registerUser } from  "@/lib/services/auth"
import { sendVerificationEmail } from "@/lib/services/email";

export async function POST(request) {
    try {

        // 1. Grab Input Data From Request Object 
        const input = await request.json();

        // 2. Take That Input Information To Register User From registerUser Services
        const { user, verificationToken } = await registerUser(input);

        // 3. Attempt verification email delivery
        let emailAccepted = false;

        try {
            await sendVerificationEmail({
                email: user.email,
                name: user.name,
                token: verificationToken
            });

            emailAccepted = true

        } catch (emailError) {
            console.error("Verification email send failed", {
                userId: user.id
            })
        }

        // 4. If Successful Return Success Object Response
        return NextResponse.json(
            {
                success: true,
                message: emailAccepted
                    ? "Registration received. Please verify your email."
                    : "Registration received, but verification email could not be sent.",
                emailAccepted,
                user
            },
            {
                status: 201
            }
        )
    
    } catch (error) {
        // 5. Error Handling in case Of Zod Error Failing Validation
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    message: "invalid registration information"
                },
                {
                    status: 400
                }
            )
        }
        
        // 6. Error Catch If Code is === 11000 (unique violation)
        if (error.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "unable to complete registration"
                },
                { 
                    status: 409
                }
            );
        }

        console.error("Registration failed", error)
        
        // 7. Error Catch in case Other Internal Server Error
        return NextResponse.json(
            {
                success: false,
                message: "Registration failed"
            },
            {
                status: 500
            }
        );
    } 
}