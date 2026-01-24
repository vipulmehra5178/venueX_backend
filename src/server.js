const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { PORT } = require("./config/env");
const logger = require("./utils/logger");

connectDB();

const server = http.createServer(app);


server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});
