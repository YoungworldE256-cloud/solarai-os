import { NextResponse } from "next/server";
import { createOrganization } from "@/lib/services/organizations";


export async function POST(request) {
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
            { error: "Not Available" },
            { status: 404 }
        );
    }

    // Temporary local-only test.
    // Do not deploy this route.

    const host = request.headers.get("host");

    if (!["localhost:3000", "127.0.0.1:3000"].includes(host)) {
        return NextResponse.json(
            { error: "local request only" },
            { status: 403 }
        );
    }


    try {
        const organization = await createOrganization({
            name: "YoungworldAI OS",
            slug: "youngworldai-os",
            status: "active"
        });

        return NextResponse.json(
            {
                success: true,
                organization: {
                    ...organization,
                    _id: organization._id.toString()
                }
            },
            {
                status: 201
            }
        );

    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Organixzation Already Exists"
                },
                {
                    status: 409
                }
            );
        }

        console.error("Organization Test Failed", error)

        return NextResponse.json(
            {
                success: false,
                message: "Test Failed"
            },
            {
                status: 500
            }
        )
    }


}