"use client"

import { useState } from "react" 


export default function VerifyEmailForm({ token }) {
    // 1. Validate the token format
    const validToken = 
        typeof token === "string" &&
        /^[a-f0-9]{64}$/i.test(token);
    

    // 2. Manage verification state
    const [status, setStatus] = useState(
        validToken ? "idle" : "error"
    );

    const [message, setMessage] = useState(
        validToken 
            ? ""
            : "Invalid verification link."
    );


    // 3. Handle the verification request
    async function handleVerification() {
        
        if (!validToken || status === "loading" ||
            status === "success") {
                return
            }

        setStatus("loading");
        setMessage("");

        try {

            // 4. Send the token to the backend
            const response = await fetch(
                "/api/auth/verify-email",
                {
                    method: "POST",
                    headers: {
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({ token })
                }
            )

            // 5. Read the API response 
        const data = await response.json();

        // 6. Handle unsuccessful verification
        if (!response.ok || !data.success) {
            setStatus("error");
            setMessage(
                data.error || "Email verification failed."
            );
            return;
        }

        // 7. Handle successful verification
        setStatus("success");
        setMessage(data.message);


        } catch {
            setStatus("error");
            setMessage(
                "Unable to verify your email right now. Please try again."
            );

        }

    } 

    // 8. Render the verification interface
    return(
        <section>
            <h1>Verify your email</h1>

            <p>
                Confirm your email address to activate your Community Solar OS account.
            </p>

            {message && (
                <p role="status">{message}</p>
            )}

            {validToken && status !== "success" && (
                <button
                    type="button"
                    onClick={handleVerification}
                    disabled={status === "loading"}
                    > 
                    {status === "loading" 
                        ? "Verifying..."
                        : "Verify Email"}
                    </button>
            )}
            
        </section>
    )
    
}