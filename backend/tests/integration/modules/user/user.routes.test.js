
jest.mock("../../../../src/modules/user/user.repository", () => ({
    getUser: jest.fn(),
}));

jest.mock("../../../../src/modules/user/user.service", () => ({
    getUser: jest.fn(),
    getAllUsers: jest.fn(),
    updateMe: jest.fn(),
    updateUserByAdmin: jest.fn(),
    deleteUser: jest.fn(),
}));

jest.mock("../../../../src/core/utils/token", () => ({
    verifyAccessToken: jest.fn(),
}));

const request = require("supertest");
const app = require("../../../../src/app");

const userRepo = require("../../../../src/modules/user/user.repository");
const userService = require("../../../../src/modules/user/user.service");
const token = require("../../../../src/core/utils/token");

describe("User Routes", () => {
    const customer = {
        _id: "customer-1",
        firstName: "Marwan",
        lastName: "Ahmed",
        role: "customer",
        accountStatus: "active",
        isDeleted: false,
    };

    const admin = {
        _id: "admin-1",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        accountStatus: "active",
        isDeleted: false,
    };

    beforeEach(() => {
        token.verifyAccessToken.mockReturnValue({ userId: "customer-1" });
        userRepo.getUser.mockResolvedValue(customer);
    });

    afterEach(() => jest.clearAllMocks());

    describe("GET /api/users/profile", () => {
        it("should return the authenticated user's profile", async () => {
            userService.getUser.mockResolvedValue(customer);

            const response = await request(app)
                .get("/api/users/profile")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(200);
            expect(response.body.data.user).toMatchObject({
                _id: customer._id,
                role: "customer",
            });
        });
    });

    describe("PATCH /api/users/profile", () => {
        it("should update the authenticated user's profile", async () => {
            const updatedUser = { ...customer, firstName: "Mohamed" };
            userService.updateMe.mockResolvedValue(updatedUser);

            const response = await request(app)
                .patch("/api/users/profile")
                .set("Authorization", "Bearer valid-token")
                .send({ firstName: "Mohamed" });

            expect(response.status).toBe(200);
            expect(userService.updateMe).toHaveBeenCalledWith(
                customer._id,
                { firstName: "Mohamed" }
            );
        });

        it("should reject invalid update data", async () => {
            const response = await request(app)
                .patch("/api/users/profile")
                .set("Authorization", "Bearer valid-token")
                .send({ role: "admin" });

            expect(response.status).toBe(400);
            expect(userService.updateMe).not.toHaveBeenCalled();
        });
    });

    describe("GET /api/users", () => {
        it("should reject non-admin users", async () => {
            const response = await request(app)
                .get("/api/users")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(403);
        });

        it("should return all users for admin", async () => {
            token.verifyAccessToken.mockReturnValue({ userId: "admin-1" });
            userRepo.getUser.mockResolvedValue(admin);
            userService.getAllUsers.mockResolvedValue([customer, admin]);

            const response = await request(app)
                .get("/api/users")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(200);
            expect(response.body.results).toBe(2);
        });
    });

    describe("DELETE /api/users/:id", () => {
        it("should allow admin to delete a user", async () => {
            token.verifyAccessToken.mockReturnValue({ userId: "admin-1" });
            userRepo.getUser.mockResolvedValue(admin);
            userService.deleteUser.mockResolvedValue({
                ...customer,
                isDeleted: true,
            });

            const response = await request(app)
                .delete("/api/users/customer-1")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(204);
            expect(userService.deleteUser).toHaveBeenCalledWith("customer-1");
        });
    });

    describe("GET /api/users/:id", () => {
        it("should return a user for admin", async () => {
            token.verifyAccessToken.mockReturnValue({ userId: "admin-1" });
            userRepo.getUser.mockResolvedValue(admin);
            userService.getUser.mockResolvedValue(customer);

            const response = await request(app)
                .get("/api/users/customer-1")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(200);
            expect(response.body.data.user).toMatchObject({
                _id: customer._id,
                role: "customer",
            });
        });
    });

    describe("PATCH /api/users/:id", () => {
        it("should update a user for admin", async () => {
            const updatedUser = { ...customer, role: "owner" };

            token.verifyAccessToken.mockReturnValue({ userId: "admin-1" });
            userRepo.getUser.mockResolvedValue(admin);
            userService.updateUserByAdmin.mockResolvedValue(updatedUser);

            const response = await request(app)
                .patch("/api/users/customer-1")
                .set("Authorization", "Bearer valid-token")
                .send({ role: "owner" });

            expect(response.status).toBe(200);
            expect(userService.updateUserByAdmin).toHaveBeenCalledWith(
                "customer-1",
                { role: "owner" }
            );
        });
    });

});
