const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    subtitle: { type: String, index: true },
    description: String,

    category: {
      type: String,
      enum: ["music", "tech", "sports", "comedy", "workshop", "meetup"],
      required: true,
      index: true,
    },

    tags: [{ type: String, index: true }],

    startDateTime: { type: Date, required: true, index: true },
    endDateTime: Date,
    timezone: { type: String, default: "Asia/Kolkata" },

    mode: {
      type: String,
      enum: ["offline", "online", "hybrid"],
      default: "offline",
      index: true,
    },

    city: { type: String, index: true },
    state: String,
    country: String,

    isPaid: { type: Boolean, default: false, index: true },
    ticketPrice: { type: Number, default: 0, index: true },

    totalTickets: Number,
    availableTickets: Number,

    coverImage: String,

    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["published", "cancelled", "completed"],
      default: "published",
      index: true,
    },

    views: { type: Number, default: 0, index: true },
    publishedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

eventSchema.index({
  title: "text",
  subtitle: "text",
  tags: "text",
});

module.exports = mongoose.model("Event", eventSchema);
