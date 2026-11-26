import { z } from "zod";

export const userSchema = z.object({
    name: z.string()
       .trim()
       .min(2, "Name must have at least two characters")
       .max(100),

    email: z.email()
        .trim()
        .toLowerCase()
        .pipe(z.email("Enter a valid email address")),

    phone: z.string()
        .trim()
        .regex(
          /^\+1[2-9]\d{2}[2-9]\d{6}$/,
        "Enter a valid US phone number in +1 format"  
        ),

    zipCode: z.string()
        .trim()
        .regex(
        /^\d{5}$/,
      "Enter a valid 5-digit ZIP code"
        ),
    
    status: z.enum([
        "active",
        "pending",
        "suspended"
    ]).default("pending")
}).strict();
