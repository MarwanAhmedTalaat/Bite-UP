
jest.mock("../../../../src/modules/user/user.repository", () => ({
    getUser: jest.fn(),
}));

jest.mock("../../../../src/core/utils/token", () => ({
    verifyAccessToken: jest.fn(),
}));

const userRepo = require("../../../../src/modules/user/user.repository");
const token = require("../../../../src/core/utils/token");
const { protect, restrictTo } = require("../../../../src/core/middleware/auth.middleware");

describe("Auth Middleware", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {
            headers: {
                authorization: "Bearer valid-token",
            },
        };
        res = {};
        next = jest.fn();
    });

    afterEach(() => jest.clearAllMocks());

    describe("protect", () => {
        it("should return 401 when authorization header is missing", async () => {
            req.headers.authorization = undefined;

            await protect(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ status: 401 })
            );
        });

        it("should return 401 when token is invalid", async () => {
            token.verifyAccessToken.mockImplementation(() => {
                throw new Error("Invalid token");
            });

            await protect(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ status: 401 })
            );
        });

        it("should return 401 when user does not exist", async () => {
            token.verifyAccessToken.mockReturnValue({ userId: "user-1" });
            userRepo.getUser.mockResolvedValue(null);

            await protect(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ status: 401 })
            );
        });

        it("should return 403 when user is deleted", async () => {
            token.verifyAccessToken.mockReturnValue({ userId: "user-1" });
            userRepo.getUser.mockResolvedValue({ isDeleted: true });

            await protect(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ status: 403 })
            );
        });

        it("should return 403 when account is inactive", async () => {
            token.verifyAccessToken.mockReturnValue({ userId: "user-1" });
            userRepo.getUser.mockResolvedValue({
                isDeleted: false,
                accountStatus: "suspended",
            });

            await protect(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ status: 403 })
            );
        });

        it("should attach user to request when authenticated", async () => {
            const user = {
                _id: "user-1",
                role: "customer",
                isDeleted: false,
                accountStatus: "active",
            };

            token.verifyAccessToken.mockReturnValue({ userId: "user-1" });
            userRepo.getUser.mockResolvedValue(user);

            await protect(req, res, next);

            expect(req.user).toEqual(user);
            expect(next).toHaveBeenCalledWith();
        });
    });

    describe("restrictTo", () => {
        it("should allow users with permitted roles", () => {
            req.user = { role: "admin" };

            restrictTo("admin")(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        it("should return 403 for unauthorized roles", () => {
            req.user = { role: "customer" };

            restrictTo("admin")(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ status: 403 })
            );
        });
    });
});
