
jest.mock("../../../../src/modules/user/user.repository", () => ({
    getUser: jest.fn(),
    getAllUsers: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
}));

const userRepo = require("../../../../src/modules/user/user.repository");
const userService = require("../../../../src/modules/user/user.service");

describe("User Service", () => {
    afterEach(() => jest.clearAllMocks());

    describe("getUser", () => {
        it("should return a user when found", async () => {
            const user = { _id: "user-1", isDeleted: false };
            userRepo.getUser.mockResolvedValue(user);

            await expect(userService.getUser("user-1")).resolves.toEqual(user);
        });

        it("should throw 404 when user does not exist", async () => {
            userRepo.getUser.mockResolvedValue(null);

            await expect(userService.getUser("user-1"))
                .rejects.toMatchObject({ status: 404 });
        });

        it("should throw 404 when user is deleted", async () => {
            userRepo.getUser.mockResolvedValue({ isDeleted: true });

            await expect(userService.getUser("user-1"))
                .rejects.toMatchObject({ status: 404 });
        });
    });

    describe("getAllUsers", () => {
        it("should return all users", async () => {
            const users = [{ _id: "user-1" }, { _id: "user-2" }];
            userRepo.getAllUsers.mockResolvedValue(users);

            await expect(userService.getAllUsers()).resolves.toEqual(users);
        });
    });

    describe("updateMe", () => {
        it("should update the allowed profile fields", async () => {
            const updatedUser = { _id: "user-1", firstName: "Marwan" };
            userRepo.updateUser.mockResolvedValue(updatedUser);

            await expect(
                userService.updateMe("user-1", { firstName: "Marwan" })
            ).resolves.toEqual(updatedUser);

            expect(userRepo.updateUser).toHaveBeenCalledWith(
                { _id: "user-1", isDeleted: false },
                { firstName: "Marwan" }
            );
        });
    });

    describe("updateUserByAdmin", () => {
        it("should allow admin to update role and account status", async () => {
            const updatedUser = { _id: "user-1", role: "admin" };
            userRepo.updateUser.mockResolvedValue(updatedUser);

            await expect(
                userService.updateUserByAdmin("user-1", {
                    role: "admin",
                    accountStatus: "active",
                })
            ).resolves.toEqual(updatedUser);
        });

        it("should throw 404 when user does not exist", async () => {
            userRepo.updateUser.mockResolvedValue(null);

            await expect(
                userService.updateUserByAdmin("user-1", { role: "admin" })
            ).rejects.toMatchObject({ status: 404 });
        });
    });

    describe("deleteUser", () => {
        it("should soft delete an existing user", async () => {
            const deletedUser = { _id: "user-1", isDeleted: true };
            userRepo.deleteUser.mockResolvedValue(deletedUser);

            await expect(
                userService.deleteUser("user-1")
            ).resolves.toEqual(deletedUser);
        });

        it("should throw 404 when user does not exist", async () => {
            userRepo.deleteUser.mockResolvedValue(null);

            await expect(
                userService.deleteUser("user-1")
            ).rejects.toMatchObject({ status: 404 });
        });
    });

    describe("updateMe", () => {
        it("should reject updates with no allowed fields", async () => {
            await expect(
                userService.updateMe("user-1", { role: "admin" })
            ).rejects.toMatchObject({
                status: 400,
                message: "No valid fields provided for update",
            });

            expect(userRepo.updateUser).not.toHaveBeenCalled();
        });

        it("should throw an error when the user does not exist", async () => {
            userRepo.updateUser.mockResolvedValue(null);

            await expect(
                userService.updateMe("user-1", { firstName: "Marwan" })
            ).rejects.toMatchObject({
                status: 404,
                message: "User not found",
            });
        });
    });
    describe("updateUserByAdmin", () => {
        it("should reject updates with no allowed fields", async () => {
            await expect(
                userService.updateUserByAdmin("user-1", { isDeleted: true })
            ).rejects.toMatchObject({
                status: 400,
                message: "No valid fields provided for update",
            });

            expect(userRepo.updateUser).not.toHaveBeenCalled();
        });
    });

});
