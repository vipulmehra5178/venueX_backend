const PDFDocument = require("pdfkit");
const Booking = require("../../models/booking.model");

exports.generateInvoice = async (req, res) => {
  let doc;

  try {
    const booking = await Booking.findById(req.params.id)
      .populate("eventId")
      .populate("userId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (
      booking.userId._id.toString() !== req.user.userId &&
      !req.user.roles.includes("admin")
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const bookingIdStr = booking._id.toString();
    const invoiceNo = `VX-${bookingIdStr.slice(-6).toUpperCase()}`;

    doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=invoice-${bookingIdStr}.pdf`
    );

    doc.pipe(res);

    doc
      .fontSize(22)
      .text("VenueX — Invoice", { align: "center" })
      .moveDown(1);

    doc
      .fontSize(10)
      .text(`Invoice No: ${invoiceNo}`)
      .text(`Booking ID: ${bookingIdStr}`)
      .text(`Invoice Date: ${new Date().toLocaleDateString()}`)
      .moveDown(1.5);

    doc.fontSize(14).text("Billed To", { underline: true });
    doc
      .fontSize(11)
      .text(booking.userId.name)
      .text(booking.userId.email)
      .moveDown(1.5);

    const event = booking.eventId;

    doc.fontSize(14).text("Event Details", { underline: true });
    doc
      .fontSize(11)
      .text(`Title: ${event.title}`)
      .text(`Date: ${new Date(event.startDateTime).toLocaleString()}`)
      .text(`Mode: ${event.mode}`)
      .text(
        `Location: ${
          event.mode === "online"
            ? event.onlineLink
            : `${event.venueName}, ${event.city}`
        }`
      )
      .moveDown(1.5);

    doc.fontSize(14).text("Payment Summary", { underline: true });
    doc
      .fontSize(11)
      .text(`Ticket Price: ₹${event.ticketPrice || 0}`)
      .text(`Quantity: ${booking.quantity}`)
      .text(`Total Amount: ₹${booking.totalAmount}`)
      .text(`Status: ${booking.status.toUpperCase()}`);

    if (booking.razorpayPaymentId) {
      doc
        .moveDown(0.5)
        .text(`Payment ID: ${booking.razorpayPaymentId}`)
        .text(`Currency: ${booking.currency || "INR"}`);
    }

    doc.moveDown(2);

    doc
      .fontSize(10)
      .text(
        "This is a system-generated invoice and does not require a signature.",
        { align: "center" }
      );

    doc.end(); 
  } catch (err) {
    console.error("Invoice generation failed:", err);

    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate invoice" });
    }

    if (doc && !doc.ended) {
      try {
        doc.end();
      } catch {}
    }
  }
};
