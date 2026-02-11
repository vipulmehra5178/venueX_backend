const Booking = require("../../models/booking.model");
const Event = require("../../models/event.model");
const mongoose = require("mongoose");

exports.getOrganizerRevenue = async (req, res) => {
  try {
    const organizerId = new mongoose.Types.ObjectId(req.user.userId);

    const bookings = await Booking.aggregate([
      {
        $match: {
          status: "confirmed",
        },
      },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $match: {
          "event.organizerId": organizerId,
        },
      },
    ]);

    let totalRevenue = 0;
    let totalTickets = 0;

    const revenueByEvent = {};
    const revenueByDate = {};

    bookings.forEach((b) => {
      totalRevenue += b.totalAmount;
      totalTickets += b.quantity;

      const eventTitle = b.event.title;
      revenueByEvent[eventTitle] =
        (revenueByEvent[eventTitle] || 0) + b.totalAmount;

      const date = new Date(b.createdAt).toISOString().split("T")[0];
      revenueByDate[date] =
        (revenueByDate[date] || 0) + b.totalAmount;
    });

    res.json({
      success: true,
      summary: {
        totalRevenue,
        totalTickets,
        totalBookings: bookings.length,
      },
      charts: {
        revenueByEvent,
        revenueByDate,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Analytics failed" });
  }
};
