
const crypto = require("crypto");
const JWT = require("jsonwebtoken");

exports.verifyAccessToken = (accessToken) => {
    return JWT.verify(accessToken, process.env.ACCESS_SECRET_KEY);
};

exports.generateRefreshToken = (userId, sessionId, expiresAt) => {
    return JWT.sign({
        sub: userId.toString(),
        sid: sessionId.toString(),
        jti: crypto.randomUUID(),
        exp: Math.floor(expiresAt.getTime() / 1000),
    }, process.env.REFRESH_SECRET_KEY);
}

exports.verifyRefreshToken = (refreshToken) => {
    return JWT.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
}

exports.hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
}


exports.getRefreshTokenExpiresAt = () => {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

