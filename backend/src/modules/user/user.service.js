const userRepo = require("./user.repository.js");
const AppError = require("../../core/utils/AppError.js");

    exports.getUser = async (id) => {
    const user = await userRepo.getUser(id);
    if (!user) throw new AppError(404, "User not found");
    if (user.isDeleted) throw new AppError(404, "User not found");
    return user
    }

    exports.getAllUsers = async () => {
    return userRepo.getAllUsers()
    }

    exports.updateMe = async (id, data) => {
    const allowedFields = ["firstName", "lastName", "avatar"];
    const filteredData = Object.fromEntries(Object.entries(data).filter(([key]) => allowedFields.includes(key)));
    if (Object.keys(filteredData).length === 0) throw new AppError(400, "No valid fields provided for update");

    const updatedUser = await userRepo.updateUser({ _id: id, isDeleted: false }, filteredData);
    if (!updatedUser) throw new AppError(404, "User not found");
    return updatedUser;
    }

    exports.updateUserByAdmin = async (id, data) => {
    const allowedFields = ["firstName", "lastName", "avatar", "role", "accountStatus"];
    const filteredData = Object.fromEntries(Object.entries(data).filter(([key]) => allowedFields.includes(key)));
    if (Object.keys(filteredData).length === 0) throw new AppError(400, "No valid fields provided for update");

    const updatedUser = await userRepo.updateUser({ _id: id, isDeleted: false }, filteredData);
    if (!updatedUser) throw new AppError(404, "User not found");
    return updatedUser;
    }

    exports.deleteUser = async (id) => {
    const deletedUser = await userRepo.deleteUser(id);
    if (!deletedUser) throw new AppError(404, "User not found");
    return deletedUser
    }
