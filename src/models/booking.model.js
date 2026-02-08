const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    pricePerTicket: {
      type: Number,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "failed"],
      default: "pending",
    },

    paymentProvider: {
      type: String,
      enum: ["razorpay", "stripe", "none"],
      default: "none",
    },

    paymentIntentId: String,
    paymentTransactionId: String,
    paymentMeta: Object,

    attendeeName: String,
    attendeeEmail: String,
    attendeePhone: String,
ticketCode: {
  type: String,
  unique: true,
  sparse: true,
},

ticketIssuedAt: Date,
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
