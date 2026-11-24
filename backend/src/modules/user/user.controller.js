const userService = require("./user.service.js");
const catchAsync = require("../../core/utils/catchAsync.js");

exports.getMe = catchAsync(async (req, res) => {
    const user = await userService.getUser(req.user._id);
    res.status(200).json({
        status: "success",
        data: { user } 
    });
});

exports.updateMe = catchAsync(async (req, res) => {
    const user = await userService.updateMe(req.user._id, req.body);
    res.status(200).json({
        status: "success",
        data: { user }
    })
});

exports.getUser = catchAsync(async (req, res) => {
    const user = await userService.getUser(req.params.id);
    res.status(200).json({
        status: "success",
        data: { user } 
    });
});

exports.getAllUsers = catchAsync(async (req, res) => {
    const users = await userService.getAllUsers();
    res.status(200).json({
        status: "success",
        results: users.length,
        data: { users }
    });
})

exports.updateUser = catchAsync(async (req, res) => {
    const user = await userService.updateUserByAdmin(req.params.id, req.body);
    res.status(200).json({
        status: "success",
        data: { user }
    })
});

exports.deleteUser = catchAsync(async (req, res) => {
    const user = await userService.deleteUser(req.params.id);
    res.status(204).json({
        status: "success",
        message: `User ${user.firstName} ${user.lastName} deleted successfully`,
    });
});
