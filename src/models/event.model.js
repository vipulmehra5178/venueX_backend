  const mongoose = require("mongoose");

  const eventSchema = new mongoose.Schema(
    {
      title: { type: String, required: true },
      subtitle: String,
      description: String,

      category: {
        type: String,
        enum: ["music", "tech", "sports", "comedy", "workshop", "meetup"],
        required: true,
      },

      tags: [String],

      startDateTime: { type: Date, required: true },
      endDateTime: Date,
      timezone: { type: String, default: "Asia/Kolkata" },

      mode: {
        type: String,
        enum: ["offline", "online", "hybrid"],
        default: "offline",
      },

      venueName: String,
      address: String,
      city: String,
      state: String,
      country: String,
      mapLink: String,
      onlineLink: String,

      isPaid: { type: Boolean, default: false },
      ticketPrice: { type: Number, default: 0 },
      currency: { type: String, default: "INR" },
      totalTickets: Number,
      availableTickets: Number,
      maxTicketsPerUser: { type: Number, default: 5 },

      coverImage: String,
      gallery: [String],

      organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      status: {
        type: String,
        enum: ["published", "cancelled", "completed"],
        default: "published",
      },

      views: { type: Number, default: 0 },
      publishedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
  );

  module.exports = mongoose.model("Event", eventSchema);
