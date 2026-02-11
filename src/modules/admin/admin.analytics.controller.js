const Booking = require("../../models/booking.model");
const Event = require("../../models/event.model");
const User = require("../../models/user.model");

exports.getAdminAnalytics = async (req, res) => {
  try {
    const confirmedBookings = await Booking.find({ status: "confirmed" })
      .populate("eventId");

    const totalRevenue = confirmedBookings.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0
    );

    const totalBookings = confirmedBookings.length;
    const totalTickets = confirmedBookings.reduce(
      (sum, b) => sum + b.quantity,
      0
    );

    const totalEvents = await Event.countDocuments({
      status:"published",
    });
    const activeOrganizers = await User.countDocuments({
      roles: "organizer",
    });

    const revenueByDate = {};
    confirmedBookings.forEach((b) => {
      const date = b.createdAt.toISOString().slice(0, 10);
      revenueByDate[date] = (revenueByDate[date] || 0) + b.totalAmount;
    });

    const revenueByEvent = {};
    confirmedBookings.forEach((b) => {
      const title = b.eventId?.title || "Unknown";
      revenueByEvent[title] = (revenueByEvent[title] || 0) + b.totalAmount;
    });

    const revenueByOrganizer = {};
    confirmedBookings.forEach((b) => {
      const organizer = b.eventId?.organizerId?.toString();
      if (!organizer) return;
      revenueByOrganizer[organizer] =
        (revenueByOrganizer[organizer] || 0) + b.totalAmount;
    });

    const statusStats = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({
      summary: {
        totalRevenue,
        totalBookings,
        totalTickets,
        totalEvents,
        activeOrganizers,
      },
      charts: {
        revenueByDate,
        revenueByEvent,
        revenueByOrganizer,
        bookingStatus: statusStats,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load admin analytics" });
  }
};
exports.getAllEventsDetailed = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("organizerId", "name email profile.city")
      .lean();

    const bookings = await Booking.find({ status: "confirmed" });

    const eventStats = events.map((event) => {
      const eventBookings = bookings.filter(
        (b) => b.eventId.toString() === event._id.toString()
      );

      const revenue = eventBookings.reduce(
        (sum, b) => sum + b.totalAmount,
        0
      );

      const ticketsSold = eventBookings.reduce(
        (sum, b) => sum + b.quantity,
        0
      );

      return {
        ...event,
        revenue,
        ticketsSold,
        bookingCount: eventBookings.length,
      };
    });

    res.json(eventStats);
  } catch (err) {
    res.status(500).json({ message: "Failed to load events detail" });
  }
};
exports.getOrganizerDetailed = async (req, res) => {
  try {
    const organizers = await User.find({ roles: "organizer" }).lean();

    const events = await Event.find().lean();
    const bookings = await Booking.find({ status: "confirmed" }).lean();

    const detailed = organizers.map((org) => {
      const orgEvents = events.filter(
        (e) => e.organizerId.toString() === org._id.toString()
      );

      const orgEventIds = orgEvents.map((e) => e._id.toString());

      const orgBookings = bookings.filter((b) =>
        orgEventIds.includes(b.eventId.toString())
      );

      const revenue = orgBookings.reduce(
        (sum, b) => sum + b.totalAmount,
        0
      );

      const tickets = orgBookings.reduce(
        (sum, b) => sum + b.quantity,
        0
      );

      return {
        ...org,
        totalEvents: orgEvents.length,
        totalRevenue: revenue,
        totalTickets: tickets,
        events: orgEvents,
      };
    });

    res.json(detailed);
  } catch (err) {
    res.status(500).json({ message: "Failed to load organizer detail" });
  }
};
exports.getAllBookingsDetailed = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .populate("eventId")
      .lean();

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to load bookings" });
  }
};
