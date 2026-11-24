const { z } = require("zod");

    exports.updateMeSchema = z.object({
        firstName: z.string().trim().min(3).max(20).optional(),
        lastName: z.string().trim().min(3).max(40).optional(),
        avatar: z.string().trim().optional(),
    }).strict().refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided"
    });

    exports.updateUserSchema = z.object({
        firstName: z.string().trim().min(3).max(20).optional(),
        lastName: z.string().trim().min(3).max(40).optional(),
        avatar: z.string().trim().optional(),
        role: z.enum(["customer", "owner", "admin"]).optional(),
        accountStatus: z.enum(["active", "suspended", "blocked"]).optional(),
    }).strict().refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided"
    });
