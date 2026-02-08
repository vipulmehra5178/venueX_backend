const paymentService = require("./payment.service");

exports.createOrder = async (req, res) => {
  try {
    const order = await paymentService.createRazorpayOrder(
      req.body.bookingId
    );
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const booking = await paymentService.verifyPayment(req.body);
    res.json({ success: true, booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
