const Booking = require("../../models/booking.model");
const bookingService = require("./bookings.service");
const QRCode = require("qrcode");

exports.createBooking = async (req, res) => {
  try {
    const booking = await bookingService.createBooking({
      userId: req.user.userId,
      eventId: req.body.eventId,
      quantity: req.body.quantity,
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({
      message: err.message || "Booking failed",
    });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getBookingsByUser(
      req.user.userId
    );
    res.json(bookings);
  } catch {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

exports.getBookingQR = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    const booking = await Booking.findOne({
      _id: bookingId,
      userId,
      status: "confirmed",
    }).select("ticketCode");

    if (!booking || !booking.ticketCode) {
      return res.status(404).json({
        message: "Ticket not available",
      });
    }

    const qr = await QRCode.toDataURL(booking.ticketCode);

    return res.json({
      bookingId,
      qr,
    });
  } catch (err) {
    console.error("QR ERROR:", err);
    return res.status(500).json({
      message: "Failed to generate QR",
    });
  }
};
