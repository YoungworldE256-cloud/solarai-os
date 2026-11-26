import VerifyEmailForm from "./VerifyEmailForm"

export default async function VerifyEmailPage({ searchParams }) {
    // 1. Resolve the URL search parameters
    const params = await searchParams;

    // 2. Extract the verification token
    const token = typeof params.token === "string"
        ? params.token
        : "";
    
    // 3. Render the verification form
    return (
        <main>
            <VerifyEmailForm token={token} />
        </main>
    )
}