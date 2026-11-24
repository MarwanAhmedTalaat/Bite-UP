const JWT = require("jsonwebtoken");

exports.verifyAccessToken = (accessToken) => {
    return JWT.verify(accessToken, process.env.ACCESS_SECRET_KEY);
}

