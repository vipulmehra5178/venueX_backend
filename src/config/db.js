const mongoose = require("mongoose");
const logger = require("../utils/logger");
const { MONGO_URI, NODE_ENV } = require("./env");

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 50,          
      minPoolSize: 10,          

      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,

      autoIndex: NODE_ENV !== "production",

      family: 4
    });

    logger.info(`MongoDB Connected (${NODE_ENV})`);

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected!");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected!");
    });

  } catch (error) {
    logger.error("MongoDB connection failed");
    logger.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
