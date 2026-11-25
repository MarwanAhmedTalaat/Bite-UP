const catchAsync = require("../../core/utils/catchAsync.js");
const sessionService = require("./session.service.js");

exports.getMySessions = catchAsync(async (req, res, next) => {
    const sessions = await sessionService.getAllSessions(req.user._id);

    const safeSessions = sessions.map((session) => ({
        _id: session._id,
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
    }));

    res.status(200).json({
        status: "success",
        results: safeSessions.length,
        data: { sessions: safeSessions },
    });
});

exports.revokeSession = catchAsync(async (req, res, next) => {
    await sessionService.revokeSession(req.params.id, req.user._id);
    res.status(204).send();
});

exports.revokeAllSessions = catchAsync(async (req, res, next) => {
    const result = await sessionService.revokeAllSessions(req.user._id);

    res.status(200).json({
        status: "success",
        data: {
            revokedCount: result.modifiedCount,
        },
    });
});
