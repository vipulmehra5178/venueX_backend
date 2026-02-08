const router = require("express").Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const bookingController = require("./bookings.controller");
const paymentController = require("./payment.controller");
const invoiceController = require("./booking.invoice.controller");

router.post("/", authMiddleware, bookingController.createBooking);
router.get("/me", authMiddleware, bookingController.getMyBookings);

router.post("/create-order", authMiddleware, paymentController.createOrder);
router.post("/verify-payment", authMiddleware, paymentController.verifyPayment);

router.get(
  "/:bookingId/qr",
  authMiddleware,
  bookingController.getBookingQR
);
router.get(
  "/:id/invoice",
  authMiddleware,
  invoiceController.generateInvoice
);

module.exports = router;
