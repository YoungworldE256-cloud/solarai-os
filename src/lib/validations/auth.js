import { z } from "zod";
import { userSchema } from "@/lib/validations/users";

export const registrationSchema = userSchema
    .omit({
        status: true
    })
    .extend({
        password: z.string()
           .min(12, "Password must contain at least 12 characters")
           .max(128, "Password must not exceed 128 characters")
    });
    