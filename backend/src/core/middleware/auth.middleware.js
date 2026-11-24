const userRepo = require("../../modules/user/user.repository");
const token = require("../utils/token.js");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.protect = catchAsync(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return next(new AppError(401, "Please login first"));

    const accessToken = authHeader.split(" ")[1]
    let decoded;

    try {
        decoded = token.verifyAccessToken(accessToken);
    } catch (error) {
        return next(new AppError(401, "Invalid or expired token"));
    }

    const user = await userRepo.getUser(decoded.userId);
    if (!user) return next(new AppError(401, "User no longer exists"));
    if (user.isDeleted) return next(new AppError(403, "This account has been deleted"));
    if (user.accountStatus !== "active") return next(new AppError(403, "Account is not active"));

    req.user = user;
    next();
});

exports.restrictTo = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) return next(new AppError(403, "You do not have permission to access this route"));
    next();
};