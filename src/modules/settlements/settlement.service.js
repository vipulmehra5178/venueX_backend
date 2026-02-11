const Booking = require("../../models/booking.model");
const Event = require("../../models/event.model");

const GLOBAL_PLATFORM_FEE = 10;

exports.calculateSettlementSnapshot = async (eventId) => {
  const event = await Event.findById(eventId).populate("organizerId");
  if (!event) throw new Error("Event not found");

  const bookings = await Booking.find({
    eventId,
    status: "confirmed",
  });

  const ticketsSold = bookings.reduce((sum, b) => sum + b.quantity, 0);

  const grossRevenue = bookings.reduce(
    (sum, b) => sum + (b.totalAmount || 0),
    0
  );

  const platformFeePercent =
    event.organizerId.platformFeePercent ?? GLOBAL_PLATFORM_FEE;

  const platformFeeAmount = Math.round(
    (grossRevenue * platformFeePercent) / 100
  );

  const netPayableAmount = grossRevenue - platformFeeAmount;

  return {
    ticketsSold,
    grossRevenue,
    platformFeePercent,
    platformFeeAmount,
    netPayableAmount,
  };
};
