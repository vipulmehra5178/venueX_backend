const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");
const controller = require("./event.controller");


router.get("/", controller.getAllEvents);
router.get(
  "/my",
  auth,
  rbac(["organizer", "admin"]),
  controller.getMyEvents
);

router.get("/:id", controller.getEventById);

router.post("/", auth, rbac(["organizer", "admin"]), controller.createEvent);
router.put("/:id", auth, rbac(["organizer", "admin"]), controller.updateEvent);
router.delete("/:id", auth, rbac(["organizer", "admin"]), controller.cancelEvent);

module.exports = router;
