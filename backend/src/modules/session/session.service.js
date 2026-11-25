const crypto = require("crypto");
const sessionRepo = require("./session.repository.js");
const AppError = require("../../core/utils/AppError.js");
const token = require("../../core/utils/token.js");

const isSessionActive = (session) => {
    return session && !session.revokedAt && session.expiresAt > new Date();
};

const revokeSessionById = async (sessionId) => {
    return sessionRepo.updateSession(
        { _id: sessionId, revokedAt: null },
        { revokedAt: new Date(), refreshToken: null }
    );
};

exports.createSession = async (userId, deviceInfo, ipAddress) => {
    const expiresAt = token.getRefreshTokenExpiresAt();

    const session = await sessionRepo.createSession({
        userId,
        expiresAt,
        deviceInfo,
        ipAddress,
    });

    const refreshToken = token.generateRefreshToken(
        userId,
        session._id,
        expiresAt
    );

    try {
        const updatedSession = await sessionRepo.updateSession(
            { _id: session._id, revokedAt: null },
            { refreshToken: token.hashToken(refreshToken) }
        );

        if (!updatedSession) throw new AppError(500, "Session token storage failed");

        return { session: updatedSession, refreshToken };
    } catch (error) {
        await sessionRepo.deleteSession({ _id: session._id });
        throw error;
    }
};

exports.getSession = async (sessionId) => {
    const session = await sessionRepo.getSession(sessionId);

    if (!session) throw new AppError(404, "Session not found");

    return session;
};

exports.getAllSessions = async (userId) => {
    return sessionRepo.getAllSessions({
        userId,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
    });
};

exports.rotateRefreshToken = async (refreshToken) => {
    let decoded;

    try {
        decoded = token.verifyRefreshToken(refreshToken);
    } catch {
        throw new AppError(401, "Invalid or expired refresh token");
    }

    const session = await sessionRepo.getSession(decoded.sid);

    if (!session || session.userId.toString() !== decoded.sub)
        throw new AppError(401, "Invalid refresh token");

    if (!isSessionActive(session))
        throw new AppError(401, "Session expired or revoked");

    const currentHash = token.hashToken(refreshToken);
    const storedHash = session.refreshToken;

    const hashesMatch = storedHash &&
        currentHash.length === storedHash.length &&
        crypto.timingSafeEqual(
            Buffer.from(currentHash, "hex"),
            Buffer.from(storedHash, "hex")
        );

    if (!hashesMatch) {
        await revokeSessionById(session._id);
        throw new AppError(401, "Refresh token reuse detected");
    }

    const newRefreshToken = token.generateRefreshToken(
        session.userId,
        session._id,
        session.expiresAt
    );

    const updatedSession = await sessionRepo.updateSession({
        _id: session._id,
        userId: session.userId,
        refreshToken: storedHash,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
    }, {
        refreshToken: token.hashToken(newRefreshToken),
    });

    if (!updatedSession) {
        await revokeSessionById(session._id);
        throw new AppError(401, "Refresh token reuse detected");
    }

    return {
        session: updatedSession,
        refreshToken: newRefreshToken,
    };
};

exports.revokeSession = async (sessionId, userId) => {
    const revokedSession = await sessionRepo.updateSession({
        _id: sessionId,
        userId,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
    }, {
        revokedAt: new Date(),
        refreshToken: null,
    });

    if (!revokedSession) throw new AppError(404, "Active session not found");

    return revokedSession;
};

exports.revokeAllSessions = async (userId) => {
    return sessionRepo.updateAllSessions({
        userId,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
    }, {
        revokedAt: new Date(),
        refreshToken: null,
    });
};
