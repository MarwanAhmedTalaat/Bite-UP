
jest.mock("../../../../src/modules/user/user.model", () => ({
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndUpdate: jest.fn(),
}));

const User = require("../../../../src/modules/user/user.model");
const userRepo = require("../../../../src/modules/user/user.repository");

describe("User Repository", () => {
    afterEach(() => jest.clearAllMocks());

    describe("createUser", () => {
        it("should create a user without session", async () => {
            const user = { _id: "user-1" };
            User.create.mockResolvedValue([user]);

            await expect(userRepo.createUser({ firstName: "Marwan" }))
                .resolves.toEqual(user);

            expect(User.create).toHaveBeenCalledWith(
                [{ firstName: "Marwan" }],
                {}
            );
        });

        it("should create a user with session", async () => {
            const session = { id: "session-1" };
            User.create.mockResolvedValue([{ _id: "user-1" }]);

            await userRepo.createUser({ firstName: "Marwan" }, session);

            expect(User.create).toHaveBeenCalledWith(
                [{ firstName: "Marwan" }],
                { session }
            );
        });
    });

    describe("getAllUsers", () => {
        it("should return all users", async () => {
            const users = [{ _id: "user-1" }];
            const query = { lean: jest.fn().mockResolvedValue(users) };
            User.find.mockReturnValue(query);

            await expect(userRepo.getAllUsers()).resolves.toEqual(users);

            expect(User.find).toHaveBeenCalled();
            expect(query.lean).toHaveBeenCalled();
        });
    });

    describe("getUser", () => {
        it("should return a user by ID", async () => {
            const user = { _id: "user-1" };
            const query = {
                select: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(user),
            };
            User.findById.mockReturnValue(query);

            await expect(userRepo.getUser("user-1")).resolves.toEqual(user);

            expect(User.findById).toHaveBeenCalledWith("user-1");
            expect(query.lean).toHaveBeenCalled();
            expect(query.select).not.toHaveBeenCalled();
        });

        it("should apply selected fields when provided", async () => {
            const query = {
                select: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue({ firstName: "Marwan" }),
            };
            User.findById.mockReturnValue(query);

            await userRepo.getUser("user-1", "firstName lastName");

            expect(query.select).toHaveBeenCalledWith("firstName lastName");
        });
    });

    describe("countUsers", () => {
        it("should use an empty filter by default", async () => {
            User.countDocuments.mockResolvedValue(5);

            const result = await userRepo.countUsers();

            expect(User.countDocuments).toHaveBeenCalledWith({});
            expect(result).toBe(5);
        });
        it("should count users using the provided filter", async () => {
            User.countDocuments.mockResolvedValue(5);

            await expect(userRepo.countUsers({ role: "customer" })).resolves.toBe(5);

            expect(User.countDocuments).toHaveBeenCalledWith({
                role: "customer",
            });
        });
    });

    describe("updateUser", () => {
        it("should update a user without session", async () => {
            const updatedUser = { _id: "user-1" };
            const query = { lean: jest.fn().mockResolvedValue(updatedUser) };
            User.findOneAndUpdate.mockReturnValue(query);

            await expect(
                userRepo.updateUser({ _id: "user-1" }, { firstName: "Marwan" })
            ).resolves.toEqual(updatedUser);

            expect(User.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: "user-1" },
                { firstName: "Marwan" },
                {
                    returnDocument: "after",
                    runValidators: true,
                }
            );
        });

        it("should update a user with session", async () => {
            const session = { id: "session-1" };
            const query = { lean: jest.fn().mockResolvedValue({ _id: "user-1" }) };
            User.findOneAndUpdate.mockReturnValue(query);

            await userRepo.updateUser(
                { _id: "user-1" },
                { firstName: "Marwan" },
                session
            );

            expect(User.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: "user-1" },
                { firstName: "Marwan" },
                {
                    returnDocument: "after",
                    runValidators: true,
                    session,
                }
            );
        });
    });

    describe("deleteUser", () => {
        it("should soft delete a user", async () => {
            const deletedUser = { _id: "user-1", isDeleted: true };
            const query = { lean: jest.fn().mockResolvedValue(deletedUser) };
            User.findByIdAndUpdate.mockReturnValue(query);

            await expect(userRepo.deleteUser("user-1")).resolves.toEqual(deletedUser);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                "user-1",
                { isDeleted: true },
                {
                    returnDocument: "after",
                    runValidators: true,
                }
            );
        });

        it("should soft delete a user with session", async () => {
            const session = { id: "session-1" };
            const query = { lean: jest.fn().mockResolvedValue({ isDeleted: true }) };
            User.findByIdAndUpdate.mockReturnValue(query);

            await userRepo.deleteUser("user-1", session);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                "user-1",
                { isDeleted: true },
                {
                    returnDocument: "after",
                    runValidators: true,
                    session,
                }
            );
        });
    });
});
