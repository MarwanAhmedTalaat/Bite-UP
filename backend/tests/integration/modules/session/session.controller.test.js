
const sessionController = require("../../../../src/modules/session/session.controller.js");
const sessionService = require("../../../../src/modules/session/session.service.js");

jest.mock("../../../../src/modules/session/session.service.js");

describe("Session Controller", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            user: {
                _id: "user123",
            },
            params: {
                id: "session123",
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };

        next = jest.fn();
    });

    describe("getMySessions", () => {
        it("should return the user's sessions with the correct result count and safe fields only", async () => {
            const expiresAt = new Date("2026-12-24T10:00:00.000Z");
            const createdAt = new Date("2026-11-24T10:00:00.000Z");
            const updatedAt = new Date("2026-11-24T11:00:00.000Z");

            const sessions = [
                {
                    _id: "session1",
                    deviceInfo: {
                        browser: { name: "Chrome", version: "120" },
                        os: { name: "Windows", version: "11" },
                        device: { vendor: null, model: null, type: "desktop" },
                    },
                    ipAddress: "127.0.0.1",
                    expiresAt,
                    createdAt,
                    updatedAt,
                    refreshToken: "secret-hash-1",
                },
                {
                    _id: "session2",
                    deviceInfo: {
                        browser: { name: "Firefox", version: "121" },
                        os: { name: "Linux", version: "Ubuntu" },
                        device: { vendor: null, model: null, type: "desktop" },
                    },
                    ipAddress: "192.168.1.1",
                    expiresAt,
                    createdAt,
                    updatedAt,
                    refreshToken: "secret-hash-2",
                },
            ];

            sessionService.getAllSessions.mockResolvedValue(sessions);

            await sessionController.getMySessions(req, res, next);

            expect(sessionService.getAllSessions).toHaveBeenCalledWith("user123");

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                status: "success",
                results: 2,
                data: {
                    sessions: [
                        {
                            _id: "session1",
                            deviceInfo: sessions[0].deviceInfo,
                            ipAddress: "127.0.0.1",
                            expiresAt,
                            createdAt,
                            updatedAt,
                        },
                        {
                            _id: "session2",
                            deviceInfo: sessions[1].deviceInfo,
                            ipAddress: "192.168.1.1",
                            expiresAt,
                            createdAt,
                            updatedAt,
                        },
                    ],
                },
            });

            const returnedSessions = res.json.mock.calls[0][0].data.sessions;

            expect(returnedSessions[0]).not.toHaveProperty("refreshToken");
            expect(returnedSessions[1]).not.toHaveProperty("refreshToken");

            expect(next).not.toHaveBeenCalled();
        });

        it("should return an empty sessions array when the user has no active sessions", async () => {
            sessionService.getAllSessions.mockResolvedValue([]);

            await sessionController.getMySessions(req, res, next);

            expect(sessionService.getAllSessions).toHaveBeenCalledWith("user123");

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                status: "success",
                results: 0,
                data: {
                    sessions: [],
                },
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("should pass errors to the next middleware", async () => {
            const error = new Error("Database error");

            sessionService.getAllSessions.mockRejectedValue(error);

            await sessionController.getMySessions(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("revokeSession", () => {
        it("should revoke the requested session successfully", async () => {
            sessionService.revokeSession.mockResolvedValue({
                _id: "session123",
            });

            await sessionController.revokeSession(req, res, next);

            expect(sessionService.revokeSession).toHaveBeenCalledWith(
                "session123",
                "user123"
            );

            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalledWith();
            expect(res.json).not.toHaveBeenCalled();

            expect(next).not.toHaveBeenCalled();
        });

        it("should pass errors to the next middleware", async () => {
            const error = new Error("Session not found");

            sessionService.revokeSession.mockRejectedValue(error);

            await sessionController.revokeSession(req, res, next);

            expect(sessionService.revokeSession).toHaveBeenCalledWith(
                "session123",
                "user123"
            );

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("revokeAllSessions", () => {
        it("should revoke all active sessions and return the revoked count", async () => {
            sessionService.revokeAllSessions.mockResolvedValue({
                acknowledged: true,
                modifiedCount: 3,
            });

            await sessionController.revokeAllSessions(req, res, next);

            expect(sessionService.revokeAllSessions).toHaveBeenCalledWith("user123");

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                status: "success",
                data: {
                    revokedCount: 3,
                },
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("should return zero when the user has no active sessions to revoke", async () => {
            sessionService.revokeAllSessions.mockResolvedValue({
                acknowledged: true,
                modifiedCount: 0,
            });

            await sessionController.revokeAllSessions(req, res, next);

            expect(sessionService.revokeAllSessions).toHaveBeenCalledWith("user123");

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                status: "success",
                data: {
                    revokedCount: 0,
                },
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("should pass errors to the next middleware", async () => {
            const error = new Error("Database error");

            sessionService.revokeAllSessions.mockRejectedValue(error);

            await sessionController.revokeAllSessions(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
