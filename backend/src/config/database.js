const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("DataBase connected Successfully")
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error
    }
};

module.exports = connectDB;