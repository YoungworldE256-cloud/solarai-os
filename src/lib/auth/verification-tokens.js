import "server-only";
import { randomBytes, createHash } from "node:crypto";

// Generate a cryptographically secure random token
export function generateVerificationToken() {
    return randomBytes(32).toString("hex");
}

// Hash the token before storing it in MongoDb
export function hashVerificationToken(token) {
    return createHash("sha256")
       .update(token)
       .digest("hex")
}

// calculate when the verification link expires
export function getVerificationExpiration() {
    const expiration = new Date();

    expiration.setHours(expiration.getHours() + 24);

    return expiration

}