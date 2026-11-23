
const AppError = require("../utils/AppError.js");

const GlobalError = (err, req, res, next) => {
    let error = err;
    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || "Internal Server Error";

    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource ID";
    }

    else if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(", ");
    }

    else if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0];
        message = field
            ? `${field} already exists`
            : "Duplicate value";
    }

    else if (err.type === "entity.parse.failed") {
        statusCode = 400;
        message = "Invalid JSON request body";
    }

    else if (err.type === "entity.too.large") {
        statusCode = 413;
        message = "Request payload is too large";
    }

    else if (err instanceof AppError || err.operational) {
        statusCode = err.statusCode || err.status || 500;
        message = err.message;
    }

    else {
        console.error(err);
        statusCode = 500;
        message = "Internal Server Error";
    }

    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = GlobalError;
