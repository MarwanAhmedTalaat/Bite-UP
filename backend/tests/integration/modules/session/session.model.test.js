
const mongoose = require("mongoose");
const Session = require("../../../../src/modules/session/session.model.js");

describe("Session Model", () => {
    describe("Schema Validation", () => {
        it("should create a valid session", async () => {
            const session = new Session({
                userId: new mongoose.Types.ObjectId(),
                expiresAt: new Date(Date.now() + 100000),
                refreshToken: "hashedToken",
                deviceInfo: {
                    browser: {
                        name: "Chrome",
                        version: "120",
                    },
                    os: {
                        name: "Windows",
                        version: "11",
                    },
                    device: {
                        vendor: "Dell",
                        model: "Laptop",
                        type: "desktop",
                    },
                },
                ipAddress: "127.0.0.1",
            });

            await expect(session.validate()).resolves.toBeUndefined();
        });

        it("should require userId", async () => {
            const session = new Session({
                expiresAt: new Date(Date.now() + 100000),
            });

            await expect(session.validate()).rejects.toMatchObject({
                errors: {
                    userId: expect.any(Object),
                },
            });
        });

        it("should require expiresAt", async () => {
            const session = new Session({
                userId: new mongoose.Types.ObjectId(),
            });

            await expect(session.validate()).rejects.toMatchObject({
                errors: {
                    expiresAt: expect.any(Object),
                },
            });
        });

        it("should apply default values to optional fields", () => {
            const session = new Session({
                userId: new mongoose.Types.ObjectId(),
                expiresAt: new Date(Date.now() + 100000),
            });

            expect(session.refreshToken).toBeNull();
            expect(session.revokedAt).toBeNull();
            expect(session.ipAddress).toBeNull();
            expect(session.deviceInfo.browser.name).toBeNull();
            expect(session.deviceInfo.browser.version).toBeNull();
            expect(session.deviceInfo.os.name).toBeNull();
            expect(session.deviceInfo.os.version).toBeNull();
            expect(session.deviceInfo.device.vendor).toBeNull();
            expect(session.deviceInfo.device.model).toBeNull();
            expect(session.deviceInfo.device.type).toBeNull();
        });

        it("should cast expiresAt to Date", () => {
            const expiresAt = "2030-01-01T00:00:00.000Z";

            const session = new Session({
                userId: new mongoose.Types.ObjectId(),
                expiresAt,
            });

            expect(session.expiresAt).toBeInstanceOf(Date);
            expect(session.expiresAt.toISOString()).toBe(expiresAt);
        });

        it("should cast userId to ObjectId", () => {
            const userId = new mongoose.Types.ObjectId().toString();

            const session = new Session({
                userId,
                expiresAt: new Date(Date.now() + 100000),
            });

            expect(session.userId).toBeInstanceOf(mongoose.Types.ObjectId);
            expect(session.userId.toString()).toBe(userId);
        });
    });

    describe("Schema Configuration", () => {
        it("should enable timestamps", () => {
            const options = Session.schema.options;

            expect(options.timestamps).toBe(true);
        });

        it("should disable version key", () => {
            expect(Session.schema.options.versionKey).toBe(false);
        });

        it("should define the userId index", () => {
            const indexes = Session.schema.indexes();

            expect(indexes).toContainEqual([
                { userId: 1 },
                expect.any(Object),
            ]);
        });

        it("should define the TTL index on expiresAt", () => {
            const indexes = Session.schema.indexes();

            expect(indexes).toContainEqual([
                { expiresAt: 1 },
                expect.objectContaining({
                    expireAfterSeconds: 0,
                }),
            ]);
        });
    });
});
