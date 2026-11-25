const Session = require("../../../../src/modules/session/session.model.js");
const sessionRepo = require("../../../../src/modules/session/session.repository.js");

jest.mock("../../../../src/modules/session/session.model.js");

describe("Session Repository", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createSession", () => {
        it("should create a new session and return it", async () => {
            const sessionData = { userId: "userId", expiresAt: new Date() };
            const session = { _id: "sessionId", ...sessionData };

            Session.create.mockResolvedValue([session]);

            const result = await sessionRepo.createSession(sessionData);

            expect(Session.create).toHaveBeenCalledWith([sessionData]);
            expect(result).toEqual(session);
        });
    });

    describe("getSession", () => {
        it("should return a session by id", async () => {
            const session = { _id: "sessionId" };
            Session.findById.mockResolvedValue(session);

            const result = await sessionRepo.getSession("sessionId");

            expect(Session.findById).toHaveBeenCalledWith("sessionId");
            expect(result).toEqual(session);
        });

        it("should return null if session does not exist", async () => {
            Session.findById.mockResolvedValue(null);

            const result = await sessionRepo.getSession("sessionId");

            expect(result).toBeNull();
        });
    });

    describe("getAllSessions", () => {
        it("should return all sessions matching the filter", async () => {
            const filter = { userId: "userId" };
            const sessions = [{ _id: "session1" }, { _id: "session2" }];

            Session.find.mockResolvedValue(sessions);

            const result = await sessionRepo.getAllSessions(filter);

            expect(Session.find).toHaveBeenCalledWith(filter);
            expect(result).toEqual(sessions);
        });

        it("should return an empty array if no sessions match", async () => {
            Session.find.mockResolvedValue([]);

            const result = await sessionRepo.getAllSessions({ userId: "userId" });

            expect(result).toEqual([]);
        });
    });

    describe("updateSession", () => {
        it("should update a session and return the updated document", async () => {
            const filter = { _id: "sessionId" };
            const updateData = { revokedAt: new Date() };
            const session = { _id: "sessionId", ...updateData };

            Session.findOneAndUpdate.mockResolvedValue(session);

            const result = await sessionRepo.updateSession(filter, updateData);

            expect(Session.findOneAndUpdate).toHaveBeenCalledWith(
                filter,
                updateData,
                {
                    returnDocument: "after",
                    runValidators: true,
                }
            );
            expect(result).toEqual(session);
        });

        it("should return null if no session matches the filter", async () => {
            Session.findOneAndUpdate.mockResolvedValue(null);

            const result = await sessionRepo.updateSession(
                { _id: "sessionId" },
                { revokedAt: new Date() }
            );

            expect(result).toBeNull();
        });
    });

    describe("updateAllSessions", () => {
        it("should update all sessions matching the filter", async () => {
            const filter = { userId: "userId", revokedAt: null };
            const updateData = { revokedAt: new Date(), refreshToken: null };
            const updateResult = {
                acknowledged: true,
                matchedCount: 2,
                modifiedCount: 2,
            };

            Session.updateMany.mockResolvedValue(updateResult);

            const result = await sessionRepo.updateAllSessions(filter, updateData);

            expect(Session.updateMany).toHaveBeenCalledWith(
                filter,
                updateData,
                { runValidators: true }
            );
            expect(result).toEqual(updateResult);
        });

        it("should return zero modified documents if no sessions match", async () => {
            const updateResult = {
                acknowledged: true,
                matchedCount: 0,
                modifiedCount: 0,
            };

            Session.updateMany.mockResolvedValue(updateResult);

            const result = await sessionRepo.updateAllSessions(
                { userId: "userId" },
                { revokedAt: new Date() }
            );

            expect(result.modifiedCount).toBe(0);
        });
    });

    describe("deleteSession", () => {
        it("should delete a session matching the filter", async () => {
            const filter = { _id: "sessionId" };
            const session = { _id: "sessionId" };

            Session.findOneAndDelete.mockResolvedValue(session);

            const result = await sessionRepo.deleteSession(filter);

            expect(Session.findOneAndDelete).toHaveBeenCalledWith(filter);
            expect(result).toEqual(session);
        });

        it("should return null if no session matches the filter", async () => {
            Session.findOneAndDelete.mockResolvedValue(null);

            const result = await sessionRepo.deleteSession({ _id: "sessionId" });

            expect(result).toBeNull();
        });
    });

    describe("deleteAllSessions", () => {
        it("should delete all sessions matching the filter", async () => {
            const filter = { userId: "userId" };
            const deleteResult = {
                acknowledged: true,
                deletedCount: 3,
            };

            Session.deleteMany.mockResolvedValue(deleteResult);

            const result = await sessionRepo.deleteAllSessions(filter);

            expect(Session.deleteMany).toHaveBeenCalledWith(filter);
            expect(result).toEqual(deleteResult);
        });

        it("should return zero deleted documents if no sessions match", async () => {
            const deleteResult = {
                acknowledged: true,
                deletedCount: 0,
            };

            Session.deleteMany.mockResolvedValue(deleteResult);

            const result = await sessionRepo.deleteAllSessions({ userId: "userId" });

            expect(result.deletedCount).toBe(0);
        });
    });
});
