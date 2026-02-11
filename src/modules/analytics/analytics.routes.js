const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");
const controller = require("./analytics.controller");

router.get(
  "/organizer/revenue",
  auth,
  rbac(["organizer", "admin"]),
  controller.getOrganizerRevenue
);

module.exports = router;
