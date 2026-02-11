
const mongoose = require("mongoose");

const settlementCommentSchema = new mongoose.Schema(
  {
    settlementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventSettlementRequest",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["organizer", "admin"],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "SettlementComment",
  settlementCommentSchema
);
