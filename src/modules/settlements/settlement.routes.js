const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");
const controller = require("./settlement.controller");

router.get(
  "/events/:eventId/revenue",
  auth,
  rbac(["organizer", "admin"]),
  controller.getEventRevenuePreview
);

router.get(
  "/events/:eventId",
  auth,
  rbac(["organizer", "admin"]),
  controller.getSettlementByEvent
);

router.post(
  "/events/:eventId/request",
  auth,
  rbac(["organizer"]),
  controller.createSettlementRequest
);

router.get(
  "/my",
  auth,
  rbac(["organizer", "admin"]),
  controller.getMySettlements
);

router.get(
  "/admin/pending",
  auth,
  rbac(["admin"]),
  controller.getAdminPendingSettlements
);

router.put(
  "/admin/:settlementId",
  auth,
  rbac(["admin"]),
  controller.adminUpdateSettlement
);

router.post(
  "/admin/:settlementId/approve",
  auth,
  rbac(["admin"]),
  controller.approveSettlement
);

router.post(
  "/admin/:settlementId/reject",
  auth,
  rbac(["admin"]),
  controller.rejectSettlement
);

router.post(
  "/admin/:settlementId/pay",
  auth,
  rbac(["admin"]),
  controller.markAsPaid
);

router.get(
  "/:settlementId/comments",
  auth,
  rbac(["organizer", "admin"]),
  controller.getSettlementComments
);

router.post(
  "/:settlementId/comment",
  auth,
  rbac(["organizer", "admin"]),
  controller.addComment
);

module.exports = router;
