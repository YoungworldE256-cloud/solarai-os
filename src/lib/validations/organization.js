import { z } from "zod";

export const organizationSchema = z.object({
    name: z.string().trim().min(2).max(120),

    slug: z.string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),

    status: z.enum(["active", "suspended"])
    .default("active")
})