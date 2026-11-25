const Session = require("./session.model.js");

    exports.createSession = async (data) => {
        const [session] = await Session.create([data]);
        return session;
    }

    exports.getSession = async (id) => {
        return Session.findById(id)
    }

    exports.getAllSessions = async (filter) => {
        return Session.find(filter)
    }

    exports.updateSession = async (filter, data) => {
        return Session.findOneAndUpdate(filter, data, {
            returnDocument: "after",
            runValidators: true,
        })
    }

    exports.updateAllSessions = async (filter, data) => {
        return Session.updateMany(filter, data, {
            runValidators: true,
        });
    }

    exports.deleteSession = async (filter) => {
        return Session.findOneAndDelete(filter)
    }

    exports.deleteAllSessions = async (filter) => {
        return Session.deleteMany(filter);
    }