
const JWT = require("jsonwebtoken");
const tokenUtils = require("../../../../src/core/utils/token");

describe("Token Utils", () => {
    const originalSecret = process.env.ACCESS_SECRET_KEY;

    beforeAll(() => {
        process.env.ACCESS_SECRET_KEY = "test-secret";
    });

    afterAll(() => {
        if (originalSecret === undefined) delete process.env.ACCESS_SECRET_KEY;
        else process.env.ACCESS_SECRET_KEY = originalSecret;
    });

    describe("verifyAccessToken", () => {
        it("should return the decoded payload for a valid access token", () => {
            const accessToken = JWT.sign(
                { userId: "user-1", role: "customer" },
                process.env.ACCESS_SECRET_KEY,
                { expiresIn: "1m" }
            );

            const decoded = tokenUtils.verifyAccessToken(accessToken);

            expect(decoded).toMatchObject({
                userId: "user-1",
                role: "customer",
            });
        });

        it("should throw an error for an invalid access token", () => {
            expect(() => tokenUtils.verifyAccessToken("invalid-token")).toThrow();
        });
    });
});
