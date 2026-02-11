const mongoose = require("mongoose");
const logger = require("../utils/logger");
const { MONGO_URI } = require("./env");

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error(" MongoDB connection failed");
    logger.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
