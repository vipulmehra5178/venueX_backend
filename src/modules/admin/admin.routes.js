const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");
const controller = require("./admin.controller");
const adminController = require('./admin.analytics.controller')
router.get(
  "/pending-organizers",
  authMiddleware,
  rbac(["admin"]),
  controller.getPendingOrganizers
);

router.get(
  "/analytics",
  authMiddleware,
  rbac(["admin"]),
  adminController.getAdminAnalytics
);
router.get(
  "/analytics/events",
  authMiddleware,
  rbac(["admin"]),
  adminController.getAllEventsDetailed
);

router.get(
  "/analytics/organizers",
  authMiddleware,
  rbac(["admin"]),
  adminController.getOrganizerDetailed
);

router.get(
  "/analytics/bookings",
  authMiddleware,
  rbac(["admin"]),
  adminController.getAllBookingsDetailed
);

module.exports = router;
