const cron = require("node-cron");
const Booking = require("../models/booking.model");
const Event = require("../models/event.model");
const logger = require("./logger");

const startBookingExpiryCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const expiredBookings = await Booking.find({
        status: "pending",
        expiresAt: { $lt: now },
      });

      if (expiredBookings.length === 0) return;

      for (const booking of expiredBookings) {
        const event = await Event.findById(booking.eventId);
        if (event) {
          event.availableTickets += booking.quantity;
          await event.save();
        }

        booking.status = "cancelled";
        await booking.save();

        logger.info(
          `⏱️ Booking expired & cancelled: ${booking._id}`
        );
      }
    } catch (err) {
      logger.error("❌ Booking expiry cron failed", err);
    }
  });

  logger.info("⏱️ Booking expiry cron started");
};

module.exports = startBookingExpiryCron;
