const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");

const controller = require("./event.controller");

router.get("/", controller.getEvents);
router.get("/:id", controller.getEvent);

router.post(
  "/",
  authMiddleware,
  rbac(["organizer", "admin"]),
  controller.createEvent
);

router.put(
  "/:id",
  authMiddleware,
  rbac(["organizer", "admin"]),
  controller.updateEvent
);

router.delete(
  "/:id",
  authMiddleware,
  rbac(["organizer", "admin"]),
  controller.deleteEvent
);

module.exports = router;
