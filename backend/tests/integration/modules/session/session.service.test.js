const sessionRepo = require("../../../../src/modules/session/session.repository.js");
const sessionService = require("../../../../src/modules/session/session.service.js");
const token = require("../../../../src/core/utils/token.js");

jest.mock("../../../../src/modules/session/session.repository.js");
jest.mock("../../../../src/core/utils/token.js");

describe("Session Service", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createSession", () => {
        it("should create a session and return it with the refresh token", async () => {
            const userId = "userId";
            const deviceInfo = { browser: { name: "Chrome" } };
            const ipAddress = "127.0.0.1";
            const expiresAt = new Date(Date.now() + 100000);
            const refreshToken = "refreshToken";

            const session = { _id: "sessionId", userId, expiresAt };
            const updatedSession = { ...session, refreshToken: "hashedToken" };

            token.getRefreshTokenExpiresAt.mockReturnValue(expiresAt);
            sessionRepo.createSession.mockResolvedValue(session);
            token.generateRefreshToken.mockReturnValue(refreshToken);
            token.hashToken.mockReturnValue("hashedToken");
            sessionRepo.updateSession.mockResolvedValue(updatedSession);

            const result = await sessionService.createSession(
                userId,
                deviceInfo,
                ipAddress
            );

            expect(token.getRefreshTokenExpiresAt).toHaveBeenCalled();
            expect(sessionRepo.createSession).toHaveBeenCalledWith({
                userId,
                expiresAt,
                deviceInfo,
                ipAddress,
            });
            expect(token.generateRefreshToken).toHaveBeenCalledWith(
                userId,
                session._id,
                expiresAt
            );
            expect(sessionRepo.updateSession).toHaveBeenCalledWith(
                { _id: session._id, revokedAt: null },
                { refreshToken: "hashedToken" }
            );
            expect(result).toEqual({
                session: updatedSession,
                refreshToken,
            });
        });

        it("should delete the created session if storing the refresh token fails", async () => {
            const session = { _id: "sessionId" };

            token.getRefreshTokenExpiresAt.mockReturnValue(new Date());
            sessionRepo.createSession.mockResolvedValue(session);
            token.generateRefreshToken.mockReturnValue("refreshToken");
            token.hashToken.mockReturnValue("hashedToken");
            sessionRepo.updateSession.mockResolvedValue(null);

            await expect(
                sessionService.createSession("userId", {}, "127.0.0.1")
            ).rejects.toMatchObject({
                status: 500,
                message: "Session token storage failed",
            });

            expect(sessionRepo.deleteSession).toHaveBeenCalledWith({
                _id: session._id,
            });
        });

        it("should delete the created session and rethrow the error if storing the token throws", async () => {
            const session = { _id: "sessionId" };
            const error = new Error("Database error");

            token.getRefreshTokenExpiresAt.mockReturnValue(new Date());
            sessionRepo.createSession.mockResolvedValue(session);
            token.generateRefreshToken.mockReturnValue("refreshToken");
            token.hashToken.mockReturnValue("hashedToken");
            sessionRepo.updateSession.mockRejectedValue(error);

            await expect(
                sessionService.createSession("userId", {}, "127.0.0.1")
            ).rejects.toBe(error);

            expect(sessionRepo.deleteSession).toHaveBeenCalledWith({
                _id: session._id,
            });
        });
    });

    describe("getSession", () => {
        it("should return the session if it exists", async () => {
            const session = { _id: "sessionId" };
            sessionRepo.getSession.mockResolvedValue(session);

            const result = await sessionService.getSession("sessionId");

            expect(sessionRepo.getSession).toHaveBeenCalledWith("sessionId");
            expect(result).toEqual(session);
        });

        it("should throw 404 if the session does not exist", async () => {
            sessionRepo.getSession.mockResolvedValue(null);

            await expect(
                sessionService.getSession("sessionId")
            ).rejects.toMatchObject({
                status: 404,
                message: "Session not found",
            });
        });
    });

    describe("getAllSessions", () => {
        it("should return all active sessions belonging to the user", async () => {
            const userId = "userId";
            const sessions = [{ _id: "session1" }, { _id: "session2" }];

            sessionRepo.getAllSessions.mockResolvedValue(sessions);

            const result = await sessionService.getAllSessions(userId);

            expect(sessionRepo.getAllSessions).toHaveBeenCalledWith({
                userId,
                revokedAt: null,
                expiresAt: { $gt: expect.any(Date) },
            });
            expect(result).toEqual(sessions);
        });

        it("should return an empty array if the user has no active sessions", async () => {
            sessionRepo.getAllSessions.mockResolvedValue([]);

            const result = await sessionService.getAllSessions("userId");

            expect(result).toEqual([]);
        });
    });

    describe("rotateRefreshToken", () => {
        const currentHash = "a".repeat(64);
        const newHash = "b".repeat(64);

        const createActiveSession = () => ({
            _id: "sessionId",
            userId: {
                toString: () => "userId",
            },
            refreshToken: currentHash,
            revokedAt: null,
            expiresAt: new Date(Date.now() + 100000),
        });

        it("should throw 401 if the refresh token is invalid or expired", async () => {
            token.verifyRefreshToken.mockImplementation(() => {
                throw new Error("Invalid token");
            });

            await expect(
                sessionService.rotateRefreshToken("invalidToken")
            ).rejects.toMatchObject({
                status: 401,
                message: "Invalid or expired refresh token",
            });

            expect(sessionRepo.getSession).not.toHaveBeenCalled();
        });

        it("should throw 401 if the session does not exist", async () => {
            token.verifyRefreshToken.mockReturnValue({
                sid: "sessionId",
                sub: "userId",
            });
            sessionRepo.getSession.mockResolvedValue(null);

            await expect(
                sessionService.rotateRefreshToken("refreshToken")
            ).rejects.toMatchObject({
                status: 401,
                message: "Invalid refresh token",
            });
        });

        it("should throw 401 if the session belongs to another user", async () => {
            token.verifyRefreshToken.mockReturnValue({
                sid: "sessionId",
                sub: "anotherUser",
            });
            sessionRepo.getSession.mockResolvedValue(createActiveSession());

            await expect(
                sessionService.rotateRefreshToken("refreshToken")
            ).rejects.toMatchObject({
                status: 401,
                message: "Invalid refresh token",
            });
        });

        it("should throw 401 if the session is already revoked", async () => {
            token.verifyRefreshToken.mockReturnValue({
                sid: "sessionId",
                sub: "userId",
            });
            sessionRepo.getSession.mockResolvedValue({
                ...createActiveSession(),
                revokedAt: new Date(),
            });

            await expect(
                sessionService.rotateRefreshToken("refreshToken")
            ).rejects.toMatchObject({
                status: 401,
                message: "Session expired or revoked",
            });
        });

        it("should throw 401 if the session has expired", async () => {
            token.verifyRefreshToken.mockReturnValue({
                sid: "sessionId",
                sub: "userId",
            });
            sessionRepo.getSession.mockResolvedValue({
                ...createActiveSession(),
                expiresAt: new Date(Date.now() - 100000),
            });

            await expect(
                sessionService.rotateRefreshToken("refreshToken")
            ).rejects.toMatchObject({
                status: 401,
                message: "Session expired or revoked",
            });
        });

        it("should revoke only the affected session if refresh token reuse is detected", async () => {
            token.verifyRefreshToken.mockReturnValue({
                sid: "sessionId",
                sub: "userId",
            });
            sessionRepo.getSession.mockResolvedValue(createActiveSession());
            token.hashToken.mockReturnValue("c".repeat(64));
            sessionRepo.updateSession.mockResolvedValue({ _id: "sessionId" });

            await expect(
                sessionService.rotateRefreshToken("reusedToken")
            ).rejects.toMatchObject({
                status: 401,
                message: "Refresh token reuse detected",
            });

            expect(sessionRepo.updateSession).toHaveBeenCalledWith(
                { _id: "sessionId", revokedAt: null },
                { revokedAt: expect.any(Date), refreshToken: null }
            );
        });

        it("should rotate the refresh token and update its stored hash", async () => {
            const session = createActiveSession();
            const newRefreshToken = "newRefreshToken";
            const updatedSession = {
                ...session,
                refreshToken: newHash,
            };

            token.verifyRefreshToken.mockReturnValue({
                sid: "sessionId",
                sub: "userId",
            });
            sessionRepo.getSession.mockResolvedValue(session);
            token.hashToken.mockReturnValueOnce(currentHash).mockReturnValueOnce(newHash);
            token.generateRefreshToken.mockReturnValue(newRefreshToken);
            sessionRepo.updateSession.mockResolvedValue(updatedSession);

            const result = await sessionService.rotateRefreshToken("refreshToken");

            expect(token.generateRefreshToken).toHaveBeenCalledWith(
                session.userId,
                session._id,
                session.expiresAt
            );
            expect(sessionRepo.updateSession).toHaveBeenCalledWith(
                {
                    _id: session._id,
                    userId: session.userId,
                    refreshToken: currentHash,
                    revokedAt: null,
                    expiresAt: { $gt: expect.any(Date) },
                },
                { refreshToken: newHash }
            );
            expect(result).toEqual({
                session: updatedSession,
                refreshToken: newRefreshToken,
            });
        });

        it("should revoke the session if the atomic token update fails", async () => {
            const session = createActiveSession();

            token.verifyRefreshToken.mockReturnValue({
                sid: "sessionId",
                sub: "userId",
            });
            sessionRepo.getSession.mockResolvedValue(session);
            token.hashToken.mockReturnValueOnce(currentHash).mockReturnValueOnce(newHash);
            token.generateRefreshToken.mockReturnValue("newRefreshToken");
            sessionRepo.updateSession
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ _id: "sessionId" });

            await expect(
                sessionService.rotateRefreshToken("refreshToken")
            ).rejects.toMatchObject({
                status: 401,
                message: "Refresh token reuse detected",
            });

            expect(sessionRepo.updateSession).toHaveBeenLastCalledWith(
                { _id: session._id, revokedAt: null },
                { revokedAt: expect.any(Date), refreshToken: null }
            );
        });
    });

    describe("revokeSession", () => {
        it("should revoke an active session belonging to the user", async () => {
            const revokedSession = { _id: "sessionId", revokedAt: new Date() };
            sessionRepo.updateSession.mockResolvedValue(revokedSession);

            const result = await sessionService.revokeSession(
                "sessionId",
                "userId"
            );

            expect(sessionRepo.updateSession).toHaveBeenCalledWith(
                {
                    _id: "sessionId",
                    userId: "userId",
                    revokedAt: null,
                    expiresAt: { $gt: expect.any(Date) },
                },
                {
                    revokedAt: expect.any(Date),
                    refreshToken: null,
                }
            );
            expect(result).toEqual(revokedSession);
        });

        it("should throw 404 if no active session belonging to the user matches", async () => {
            sessionRepo.updateSession.mockResolvedValue(null);

            await expect(
                sessionService.revokeSession("sessionId", "userId")
            ).rejects.toMatchObject({
                status: 404,
                message: "Active session not found",
            });
        });
    });

    describe("revokeAllSessions", () => {
        it("should revoke all active sessions belonging to the user", async () => {
            const updateResult = {
                acknowledged: true,
                matchedCount: 3,
                modifiedCount: 3,
            };

            sessionRepo.updateAllSessions.mockResolvedValue(updateResult);

            const result = await sessionService.revokeAllSessions("userId");

            expect(sessionRepo.updateAllSessions).toHaveBeenCalledWith(
                {
                    userId: "userId",
                    revokedAt: null,
                    expiresAt: { $gt: expect.any(Date) },
                },
                {
                    revokedAt: expect.any(Date),
                    refreshToken: null,
                }
            );
            expect(result).toEqual(updateResult);
        });

        it("should return the update result when the user has no active sessions", async () => {
            const updateResult = {
                acknowledged: true,
                matchedCount: 0,
                modifiedCount: 0,
            };

            sessionRepo.updateAllSessions.mockResolvedValue(updateResult);

            const result = await sessionService.revokeAllSessions("userId");

            expect(result.modifiedCount).toBe(0);
        });
    });
});
