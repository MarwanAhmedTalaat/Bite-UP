
const express = require("express");
const request = require("supertest");

const sessionRoutes = require("../../../../src/modules/session/session.routes.js");
const sessionService = require("../../../../src/modules/session/session.service.js");
const authMiddleware = require("../../../../src/core/middleware/auth.middleware.js");

jest.mock("../../../../src/modules/session/session.service.js");

jest.mock("../../../../src/core/middleware/auth.middleware.js", () => ({
    protect: jest.fn((req, res, next) => {
        if (!req.headers.authorization) {
            return res.status(401).json({
                status: "fail",
                message: "You are not logged in",
            });
        }

        req.user = { _id: "user123" };
        next();
    }),
}));

describe("Session Routes", () => {
    let app;

    beforeEach(() => {
        jest.clearAllMocks();

        app = express();
        app.use(express.json());
        app.use("/api/sessions", sessionRoutes);

        app.use((err, req, res, next) => {
            res.status(err.status || 500).json({
                status: "error",
                message: err.message,
            });
        });
    });

    const authHeader = {
        Authorization: "Bearer test-token",
    };

    describe("GET /api/sessions", () => {
        it("should return the authenticated user's sessions", async () => {
            sessionService.getAllSessions.mockResolvedValue([
                {
                    _id: "session123",
                    deviceInfo: {},
                    ipAddress: "127.0.0.1",
                    expiresAt: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    refreshToken: "secret-hash",
                },
            ]);

            const response = await request(app)
                .get("/api/sessions")
                .set(authHeader);

            expect(response.status).toBe(200);
            expect(response.body.results).toBe(1);
            expect(response.body.data.sessions).toHaveLength(1);
            expect(response.body.data.sessions[0]).not.toHaveProperty("refreshToken");

            expect(sessionService.getAllSessions).toHaveBeenCalledWith("user123");
            expect(authMiddleware.protect).toHaveBeenCalled();
        });

        it("should reject unauthenticated requests", async () => {
            const response = await request(app).get("/api/sessions");

            expect(response.status).toBe(401);
            expect(sessionService.getAllSessions).not.toHaveBeenCalled();
        });
    });

    describe("DELETE /api/sessions/:id", () => {
        it("should revoke the requested session", async () => {
            sessionService.revokeSession.mockResolvedValue({
                _id: "session123",
            });

            const response = await request(app)
                .delete("/api/sessions/session123")
                .set(authHeader);

            expect(response.status).toBe(204);

            expect(sessionService.revokeSession).toHaveBeenCalledWith(
                "session123",
                "user123"
            );
        });

        it("should return 404 when the session does not belong to the user", async () => {
            const error = new Error("Active session not found");
            error.status = 404;

            sessionService.revokeSession.mockRejectedValue(error);

            const response = await request(app)
                .delete("/api/sessions/other-session")
                .set(authHeader);

            expect(response.status).toBe(404);

            expect(sessionService.revokeSession).toHaveBeenCalledWith(
                "other-session",
                "user123"
            );
        });

        it("should reject unauthenticated requests", async () => {
            const response = await request(app)
                .delete("/api/sessions/session123");

            expect(response.status).toBe(401);
            expect(sessionService.revokeSession).not.toHaveBeenCalled();
        });
    });

    describe("DELETE /api/sessions", () => {
        it("should revoke all active sessions", async () => {
            sessionService.revokeAllSessions.mockResolvedValue({
                acknowledged: true,
                modifiedCount: 3,
            });

            const response = await request(app)
                .delete("/api/sessions")
                .set(authHeader);

            expect(response.status).toBe(200);
            expect(response.body.data.revokedCount).toBe(3);

            expect(sessionService.revokeAllSessions).toHaveBeenCalledWith("user123");
        });

        it("should reject unauthenticated requests", async () => {
            const response = await request(app).delete("/api/sessions");

            expect(response.status).toBe(401);
            expect(sessionService.revokeAllSessions).not.toHaveBeenCalled();
        });
    });
});
