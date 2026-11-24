const AppError = require("../utils/AppError");

const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const error = result.error.issues[0];
            return next(new AppError(400, error.message));
        }
        req.body = result.data;
        next();
    };
};

module.exports = validate;