const mongoose = require("mongoose");
    const userSchema = new mongoose.Schema(
        {
            firstName: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 20,
            },

            lastName: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 40,
            },

            avatar: {
            type: String,
            default: "default-avatar.png",
            },

            role: {
            type: String,
            enum: ["customer", "owner", "admin"],
            default: "customer",
            required: true,
            },

            accountStatus: {
            type: String,
            enum: ["active", "suspended", "blocked"],
            default: "active",
            required: true,
            },

            isDeleted: {
            type: Boolean,
            default: false,
            },
        },
        {
            timestamps: true,
        }
        );

    userSchema.index({ isDeleted: 1, accountStatus: 1 })
    const User = mongoose.model("User", userSchema)
    module.exports = User
