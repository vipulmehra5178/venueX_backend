const Booking = require("../../models/booking.model");
const Event = require("../../models/event.model");

exports.createBooking = async ({ userId, eventId, quantity }) => {
  const event = await Event.findById(eventId);

  if (!event) throw new Error("Event not found");
  if (event.availableTickets < quantity)
    throw new Error("Not enough tickets available");

  const pricePerTicket = event.isPaid ? event.ticketPrice : 0;
  const totalAmount = pricePerTicket * quantity;

  event.availableTickets -= quantity;
  await event.save();

  const booking = await Booking.create({
    userId,
    eventId,
    quantity,
    pricePerTicket,
    totalAmount,
    currency: event.currency || "INR",
    status: "pending",
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  return booking;
};

exports.getBookingsByUser = async (userId) => {
  return Booking.find({ userId })
    .populate("eventId")
    .sort({ createdAt: -1 });
};
