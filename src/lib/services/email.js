import "server-only"

import { Resend } from "resend"

export async function sendVerificationEmail({
    email,
    name,
    token
}) {
    // 1. Read the API key from the server environment
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
        throw new Error("RESEND_API_KEY_MISSING")
    }


    // 2. Initialize resend client
    const resend = new Resend(apiKey);

    // 3. Construct the verification URL
    const baseUrl = 
        process.env.APP_BASE_URL || "http://localhost:3000"

    const verificationUrl = 
        `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;

    // 4. Send the verification email
    const { data, error } = await resend.emails.send({
        from: "Community Solar OS <onboarding@resend.dev>",
        to: email,
        subject: "Verify your Community Solar OS account",
        text: `Hello ${name},
        Welcome to Community Solar OS
        
        Please verify your email address using this link:
        
        ${verificationUrl}
        
        This verification link expires in 24 hours.
        
        If you did not create this account, you can ignore this email.`
    });

    // 5. Handle provider errors
    if (error) {
        throw new Error("VERIFICATION_EMAIL_SEND_FAILED")
    }

    // 6. Return the provider's message identifier
    return {
        messageId: data.id
    }
}   