
const { updateMeSchema, updateUserSchema } = require("../../../../src/modules/user/user.validation");

describe("User Validation", () => {
    describe("updateMeSchema", () => {
        it("should accept valid profile data", () => {
            const result = updateMeSchema.safeParse({
                firstName: "Marwan",
                lastName: "Ahmed",
                avatar: "avatar.png",
            });

            expect(result.success).toBe(true);
        });

        it("should trim string values", () => {
            const result = updateMeSchema.safeParse({
                firstName: " Marwan ",
            });

            expect(result.data.firstName).toBe("Marwan");
        });

        it("should reject an empty object", () => {
            const result = updateMeSchema.safeParse({});

            expect(result.success).toBe(false);
        });

        it("should reject invalid field lengths", () => {
            const result = updateMeSchema.safeParse({
                firstName: "Ma",
            });

            expect(result.success).toBe(false);
        });

        it("should reject unknown fields", () => {
            const result = updateMeSchema.safeParse({
                role: "admin",
            });

            expect(result.success).toBe(false);
        });
    });

    describe("updateUserSchema", () => {
        it("should accept valid admin update data", () => {
            const result = updateUserSchema.safeParse({
                firstName: "Marwan",
                role: "admin",
                accountStatus: "active",
            });

            expect(result.success).toBe(true);
        });

        it("should accept valid roles", () => {
            for (const role of ["customer", "owner", "admin"]) {
                expect(updateUserSchema.safeParse({ role }).success).toBe(true);
            }
        });

        it("should reject invalid roles", () => {
            const result = updateUserSchema.safeParse({
                role: "superadmin",
            });

            expect(result.success).toBe(false);
        });

        it("should reject invalid account statuses", () => {
            const result = updateUserSchema.safeParse({
                accountStatus: "pending",
            });

            expect(result.success).toBe(false);
        });

        it("should reject an empty object", () => {
            const result = updateUserSchema.safeParse({});

            expect(result.success).toBe(false);
        });

        it("should reject unknown fields", () => {
            const result = updateUserSchema.safeParse({
                isDeleted: true,
            });

            expect(result.success).toBe(false);
        });
    });
});
