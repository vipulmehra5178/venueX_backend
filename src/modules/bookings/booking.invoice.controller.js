const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
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

    const event = booking.eventId;
    const bookingId = booking._id.toString();
    const invoiceNo = `VX-${bookingId.slice(-6).toUpperCase()}`;
    const invoiceDate = new Date().toLocaleDateString("en-IN");

    const totalAmount = booking.totalAmount; 
    const gstRate = 18;

    const baseAmount = +(totalAmount / (1 + gstRate / 100)).toFixed(2);
    const gstAmount = +(totalAmount - baseAmount).toFixed(2);
    const cgst = +(gstAmount / 2).toFixed(2);
    const sgst = +(gstAmount / 2).toFixed(2);

    const logoPath = path.join(__dirname, "../../assets/logo.png");
    const hasLogo = fs.existsSync(logoPath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=VenueX-Invoice-${invoiceNo}.pdf`
    );

    doc = new PDFDocument({ size: "A4", margin: 45 });
    doc.pipe(res);

    doc.save();
    doc.rotate(-35, { origin: [300, 400] });
    doc
      .font("Helvetica-Bold")
      .fontSize(90)
      .fillColor("#e5e7eb")
      .opacity(0.25)
      .text("PAID", 120, 350);
    doc.restore().opacity(1);

    const gradient = doc.linearGradient(0, 0, doc.page.width, 0);
    gradient.stop(0, "#020617").stop(1, "#020a3a");
    doc.rect(0, 0, doc.page.width, 110).fill(gradient);

    if (hasLogo) {
      doc.image(logoPath, 45, 32, { width: 42 });
    }

    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("VenueX", hasLogo ? 100 : 45, 36);

    doc
      .fontSize(10)
      .fillColor("#cbd5f5")
      .font("Helvetica")
      .text("Premium Event Experiences", hasLogo ? 100 : 45, 62);

    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("#38bdf8")
      .text("INVOICE", 0, 40, { align: "right" });

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#e2e8f0")
      .text(`Invoice No: ${invoiceNo}`, 0, 68, { align: "right" });

    doc.moveDown(4);

    const infoY = doc.y;
    doc.roundedRect(45, infoY, 505, 48, 12).fill("#f8fafc");

    doc
      .fillColor("#020617")
      .fontSize(9)
      .text("Invoice Date", 65, infoY + 10)
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(invoiceDate, 65, infoY + 26);

    doc
      .font("Helvetica")
      .fontSize(9)
      .text("Booking ID", 310, infoY + 10)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(bookingId, 310, infoY + 26);

    doc.moveDown(3);

    doc.font("Helvetica-Bold").fontSize(13).text("Billed To");
    doc
      .moveDown(0.4)
      .fontSize(11)
      .text(booking.userId.name)
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#475569")
      .text(booking.userId.email);

    doc.moveDown(1.5);

    const cardY = doc.y;
    doc.roundedRect(45, cardY, 505, 110, 14).fill("#f1f5f9");

    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .fillColor("#020617")
      .text("Event Details", 65, cardY + 12);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#334155")
      .text(`Event: ${event.title}`, 65, cardY + 38)
      .text(
        `Date & Time: ${new Date(event.startDateTime).toLocaleString("en-IN")}`,
        65,
        cardY + 55
      )
      .text(`Mode: ${event.mode.toUpperCase()}`, 65, cardY + 72)
      .text(
        `Location: ${
          event.mode === "online"
            ? event.onlineLink
            : `${event.venueName}, ${event.city}`
        }`,
        65,
        cardY + 89
      );

    doc.moveDown(6);

    const tableY = doc.y;
    doc.roundedRect(45, tableY, 505, 145, 14).stroke("#e5e7eb");

    let y = tableY + 20;
    doc.font("Helvetica").fontSize(10);

    doc.text("Base Amount", 325, y);
    doc.text(`₹${baseAmount}`, 465, y);

    y += 18;
    doc.text("CGST (9%)", 325, y);
    doc.text(`₹${cgst}`, 465, y);

    y += 18;
    doc.text("SGST (9%)", 325, y);
    doc.text(`₹${sgst}`, 465, y);

    y += 26;
    doc.roundedRect(320, y - 6, 230, 36, 10).fill("#020617");

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#cbd5f5")
      .text("Total Paid (Incl. GST)", 335, y + 6);

    doc
      .fontSize(15)
      .fillColor("#38bdf8")
      .text(`₹${totalAmount}`, 465, y + 4);

    const qr = await QRCode.toDataURL(
      `Invoice:${invoiceNo}|Amount:${totalAmount}`
    );
    doc.image(qr, 45, y - 10, { width: 70 });

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#94a3b8")
      .text(
        "This is a system-generated GST invoice. Payment successfully received.",
        0,
        760,
        { align: "center" }
      );

    doc.end();
  } catch (err) {
    console.error("Invoice generation failed:", err);

    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  }
};
