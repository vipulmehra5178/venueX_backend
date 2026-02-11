
const mongoose = require("mongoose");

const eventSettlementRequestSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    ticketsSold: {
      type: Number,
      required: true,
    },

    grossRevenue: {
      type: Number,
      required: true,
    },

    platformFeePercent: {
      type: Number,
      required: true,
    },

    platformFeeAmount: {
      type: Number,
      required: true,
    },

    taxAmount: {
      type: Number,
      default: 0,
    },

    refundAmount: {
      type: Number,
      default: 0,
    },

    netPayableAmount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: [
        "requested",  
        "under_review",
        "approved",
        "rejected",
        "paid",
      ],
      default: "requested",
    },
    finalPayableAmount: {
  type: Number,
  required:true,
},

    adminNotes: String,
    organizerNotes: String,

    payoutReference: String,
    payoutMethod: {
      type: String,
      enum: ["bank_transfer", "upi", "manual"],
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },
    

    approvedAt: Date,
    rejectedAt: Date,
    paidAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "EventSettlementRequest",
  eventSettlementRequestSchema
);
