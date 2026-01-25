const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const passport =require("passport");

const rateLimiter = require("./middlewares/rateLimiter.middleware");
const errorHandler = require("./middlewares/error.middleware");

const healthRoutes = require("./routes/v1/health.route");
const authRoutes = require("./modules/auth/auth.routes");
const eventRoutes = require("./modules/events/event.routes");
const adminRoutes = require("./modules/admin/admin.routes");

const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json());

app.use(morgan("dev"));

app.use(rateLimiter);



app.use(passport.initialize());



app.use("/api/v1/health", healthRoutes);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/events", eventRoutes);

app.use("/api/v1/admin", adminRoutes);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

app.use(errorHandler);

module.exports = app;
