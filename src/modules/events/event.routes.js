const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");
const controller = require("./event.controller");

// Public
router.get("/", controller.getAllEvents);
router.get("/:id", controller.getEventById);

// Organizer/Admin
router.post("/", auth, rbac(["organizer", "admin"]), controller.createEvent);
router.put("/:id", auth, rbac(["organizer", "admin"]), controller.updateEvent);
router.delete("/:id", auth, rbac(["organizer", "admin"]), controller.cancelEvent);

module.exports = router;
