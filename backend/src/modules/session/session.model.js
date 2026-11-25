const mongoose = require("mongoose");

    const sessionSchema = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        refreshToken: {
            type: String,
            default: null,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        revokedAt: {
            type: Date,
            default: null,
        },
        deviceInfo: {
            browser: {
                name: { type: String, default: null },
                version: { type: String, default: null },
            },
            os: {
                name: { type: String, default: null },
                version: { type: String, default: null },
            },
            device: {
                vendor: { type: String, default: null },
                model: { type: String, default: null },
                type: { type: String, default: null },
            },
        },
        ipAddress: {
            type: String,
            default: null,
        },
    }, {
        timestamps: true,
        versionKey: false,
    });

sessionSchema.index({ userId: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Session", sessionSchema);
