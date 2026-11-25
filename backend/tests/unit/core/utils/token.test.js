
const crypto = require("crypto");
const JWT = require("jsonwebtoken");
const token = require("../../../../src/core/utils/token.js");

describe("Token Utility", () => {
    beforeAll(() => {
        process.env.ACCESS_SECRET_KEY = "test-access-secret";
        process.env.REFRESH_SECRET_KEY = "test-refresh-secret";
    });

    describe("verifyAccessToken", () => {
        it("should verify a valid access token", () => {
            const accessToken = JWT.sign(
                { userId: "userId" },
                process.env.ACCESS_SECRET_KEY,
                { expiresIn: "15m" }
            );

            const decoded = token.verifyAccessToken(accessToken);

            expect(decoded.userId).toBe("userId");
        });

        it("should throw an error for an invalid access token", () => {
            expect(() => token.verifyAccessToken("invalidToken")).toThrow();
        });

        it("should throw an error for an access token signed with another secret", () => {
            const accessToken = JWT.sign(
                { userId: "userId" },
                "another-secret"
            );

            expect(() => token.verifyAccessToken(accessToken)).toThrow();
        });
    });

    describe("generateRefreshToken and verifyRefreshToken", () => {
        it("should generate a valid refresh token with the expected claims", () => {
            const userId = crypto.randomUUID();
            const sessionId = crypto.randomUUID();
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            const refreshToken = token.generateRefreshToken(
                userId,
                sessionId,
                expiresAt
            );

            const decoded = token.verifyRefreshToken(refreshToken);

            expect(decoded.sub).toBe(userId);
            expect(decoded.sid).toBe(sessionId);
            expect(decoded.jti).toEqual(expect.any(String));
            expect(decoded.exp).toBe(Math.floor(expiresAt.getTime() / 1000));
        });

        it("should generate a unique jti for each refresh token", () => {
            const userId = new crypto.randomUUID();
            const sessionId = new crypto.randomUUID();
            const expiresAt = new Date(Date.now() + 100000);

            const firstToken = token.generateRefreshToken(
                userId,
                sessionId,
                expiresAt
            );
            const secondToken = token.generateRefreshToken(
                userId,
                sessionId,
                expiresAt
            );

            const firstDecoded = token.verifyRefreshToken(firstToken);
            const secondDecoded = token.verifyRefreshToken(secondToken);

            expect(firstDecoded.jti).not.toBe(secondDecoded.jti);
        });

        it("should reject a refresh token signed with another secret", () => {
            const refreshToken = JWT.sign(
                { sub: "userId", sid: "sessionId" },
                "another-secret"
            );

            expect(() => token.verifyRefreshToken(refreshToken)).toThrow();
        });

        it("should reject an expired refresh token", () => {
            const refreshToken = JWT.sign(
                { sub: "userId", sid: "sessionId" },
                process.env.REFRESH_SECRET_KEY,
                { expiresIn: -1 }
            );

            expect(() => token.verifyRefreshToken(refreshToken)).toThrow();
        });
    });

    describe("hashToken", () => {
        it("should return a SHA-256 hash of the token", () => {
            const value = "refresh-token-value";
            const expectedHash = crypto
                .createHash("sha256")
                .update(value)
                .digest("hex");

            expect(token.hashToken(value)).toBe(expectedHash);
        });

        it("should return the same hash for the same token", () => {
            const value = "same-token";

            expect(token.hashToken(value)).toBe(token.hashToken(value));
        });

        it("should return different hashes for different tokens", () => {
            expect(token.hashToken("token-one")).not.toBe(
                token.hashToken("token-two")
            );
        });

        it("should return a 64-character hexadecimal hash", () => {
            const hash = token.hashToken("refresh-token");

            expect(hash).toMatch(/^[a-f0-9]{64}$/);
        });
    });

    describe("getRefreshTokenExpiresAt", () => {
        it("should return an expiration date 30 days in the future", () => {
            const before = Date.now();
            const expiresAt = token.getRefreshTokenExpiresAt();
            const after = Date.now();

            const thirtyDays = 30 * 24 * 60 * 60 * 1000;

            expect(expiresAt).toBeInstanceOf(Date);
            expect(expiresAt.getTime()).toBeGreaterThanOrEqual(
                before + thirtyDays
            );
            expect(expiresAt.getTime()).toBeLessThanOrEqual(
                after + thirtyDays
            );
        });
    });
});
