const Razorpay = require("razorpay");
const Booking = require("../../models/booking.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createRazorpayOrder = async (bookingId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status !== "pending") {
    throw new Error("Booking is not pending");
  }

  const order = await razorpay.orders.create({
    amount: booking.totalAmount * 100, 
    currency: booking.currency,
    receipt: `booking_${booking._id}`,
  });

  booking.paymentProvider = "razorpay";
  booking.paymentIntentId = order.id;
  await booking.save();

  return order;
};



exports.verifyPayment = async ({
  bookingId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    throw new Error("Invalid payment signature");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");

  const ticketPayload = {
    bookingId: booking._id,
    userId: booking.userId,
    eventId: booking.eventId,
  };

  const ticketCode = jwt.sign(
    ticketPayload,
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  booking.status = "confirmed";
  booking.paymentTransactionId = razorpay_payment_id;
  booking.ticketCode = ticketCode;
  booking.ticketIssuedAt = new Date();

  await booking.save();

  return booking;
};
