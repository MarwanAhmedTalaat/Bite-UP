const User = require("./user.model.js");

    exports.createUser = async (data, session = null) => {
    const options = session ? { session } : {};
    const [user] = await User.create([data], options);
    return user
    }

    exports.getAllUsers = async () => {
    return User.find().lean()
    }

    exports.getUser = async (id, select = null) => {
    const query = User.findById(id)
    if (select) query.select(select)
    return query.lean()
    }

    exports.countUsers = async (filter = {}) => {
    return User.countDocuments(filter)
    }

    exports.updateUser = async (filter, data, session = null) => {
    const options = {
        returnDocument: "after",
        runValidators: true,
        ...(session && { session }),
    }

    return User.findOneAndUpdate(filter, data, options).lean()
    };

    exports.deleteUser = async (id, session = null) => {
    const options = {
        returnDocument: "after",
        runValidators: true,
        ...(session && { session }),
    }

    return User.findByIdAndUpdate(id,{ isDeleted: true },options).lean()
    };
