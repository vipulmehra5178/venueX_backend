const express = require("express");
const router = express.Router();

const passport = require("passport");
require("../../config/passport");

const authMiddleware = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");
const controller = require("./auth.controller");

router.post("/register", controller.register);
router.post("/login", controller.login);

router.post(
  "/request-organizer",
  authMiddleware,
  controller.requestOrganizer
);

router.post(
  "/approve-organizer",
  authMiddleware,
  rbac(["admin"]),
  controller.approveOrganizer
);

router.post(
  "/grant-admin",
  authMiddleware,
  rbac(["admin"]),
  controller.grantAdmin
);

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.userId,
      name: req.user.name,
      email: req.user.email,
      roles: req.user.roles,
    },
  });
});

module.exports = router;
