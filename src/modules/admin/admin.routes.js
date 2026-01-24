const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");
const controller = require("./admin.controller");

router.get(
  "/pending-organizers",
  authMiddleware,
  rbac(["admin"]),
  controller.getPendingOrganizers
);

module.exports = router;
