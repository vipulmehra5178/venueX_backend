const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    dateTime: {
      type: Date,
      required: true
    },

    location: {
      type: String,
      required: true
    },

    ticketPrice: {
      type: Number,
      required: true
    },

    totalTickets: {
      type: Number,
      required: true
    },

    availableTickets: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active"
    },

    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    imageUrl: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
