
const Event = require("../../models/event.model");
const EventSettlementRequest = require("../../models/eventSettlementRequest.model");
const SettlementComment = require("../../models/settlementComment.model");
const {
  calculateSettlementSnapshot,
} = require("./settlement.service");


exports.createSettlementRequest = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const existing = await EventSettlementRequest.findOne({ eventId });
    if (existing) {
      return res.status(400).json({
        message: "Settlement already exists for this event",
      });
    }

    const snapshot = await calculateSettlementSnapshot(eventId);
const settlement = await EventSettlementRequest.create({
  eventId,
  organizerId: event.organizerId,
  ...snapshot,
  finalPayableAmount: snapshot.netPayableAmount, 
  organizerNotes: req.body.organizerNotes || "",
  status: "requested",
});

    res.json(settlement);
  } catch (err) {
    console.error("Create settlement error:", err);
    res.status(500).json({ message: "Failed to request settlement" });
  }
};

exports.adminUpdateSettlement = async (req, res) => {
  try {
    const { settlementId } = req.params;

    const settlement = await EventSettlementRequest.findById(settlementId);

    if (!settlement) {
      return res.status(404).json({ message: "Settlement not found" });
    }

    if (["approved", "paid"].includes(settlement.status)) {
      return res.status(403).json({
        message: "Cannot edit finalized settlement",
      });
    }

    const {
      platformFeePercent,
      finalPayableAmount,
      adminNotes,
    } = req.body;

  if (platformFeePercent !== undefined) {
  settlement.platformFeePercent = platformFeePercent;

  const newFeeAmount = Math.round(
    (settlement.grossRevenue * platformFeePercent) / 100
  );

  settlement.platformFeeAmount = newFeeAmount;
  settlement.netPayableAmount =
    settlement.grossRevenue - newFeeAmount;
    if (finalPayableAmount === undefined) {
    settlement.finalPayableAmount =
      settlement.netPayableAmount;
  } 
}

    if (finalPayableAmount !== undefined) {
  settlement.finalPayableAmount =
    finalPayableAmount;
}

    if (adminNotes !== undefined) {
      settlement.adminNotes = adminNotes;
    }

    settlement.status = "under_review";

    await settlement.save();

    res.json(settlement);
  } catch (err) {
    console.error("Admin update error:", err);
    res.status(500).json({ message: "Failed to update settlement" });
  }
};



exports.approveSettlement = async (req, res) => {
  try {
    const { settlementId } = req.params;

    const settlement = await EventSettlementRequest.findById(settlementId);
    if (!settlement) {
      return res.status(404).json({ message: "Settlement not found" });
    }

    if (!["requested", "under_review"].includes(settlement.status)) {
      return res.status(400).json({
        message: "Settlement not eligible for approval",
      });
    }
    if (!settlement.finalPayableAmount) {
  settlement.finalPayableAmount =
    settlement.netPayableAmount;
}


    settlement.status = "approved";
    settlement.approvedAt = new Date();

    await settlement.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Approve error:", err);
    res.status(500).json({ message: "Failed to approve settlement" });
  }
};

exports.rejectSettlement = async (req, res) => {
  try {
    const { settlementId } = req.params;

    const settlement = await EventSettlementRequest.findById(settlementId);
    if (!settlement) {
      return res.status(404).json({ message: "Settlement not found" });
    }

    if (!["requested", "under_review"].includes(settlement.status)) {
      return res.status(400).json({
        message: "Settlement not eligible for rejection",
      });
    }

    settlement.status = "rejected";
    settlement.rejectedAt = new Date();
    settlement.adminNotes = req.body.adminNotes || "";

    await settlement.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).json({ message: "Failed to reject settlement" });
  }
};
exports.markAsPaid = async (req, res) => {
  try {
    const { settlementId } = req.params;

    const settlement = await EventSettlementRequest.findById(settlementId);
    if (!settlement) {
      return res.status(404).json({ message: "Settlement not found" });
    }

    if (settlement.status !== "approved") {
      return res.status(400).json({
        message: "Only approved settlements can be paid",
      });
    }

    settlement.status = "paid";
    settlement.paidAt = new Date();
    settlement.payoutReference = req.body.payoutReference;

    await settlement.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Mark paid error:", err);
    res.status(500).json({ message: "Failed to mark as paid" });
  }
};


exports.getEventRevenuePreview = async (req, res) => {
  try {
    const { eventId } = req.params;

    const snapshot = await calculateSettlementSnapshot(eventId);
    const settlement = await EventSettlementRequest.findOne({ eventId });

    res.json({
      eventId,
      ...snapshot,
      settlementStatus: settlement ? settlement.status : "not_requested",
      settlementId: settlement?._id || null,
    });
  } catch (err) {
    console.error("Revenue preview error:", err);
    res.status(500).json({
      message: "Failed to fetch revenue preview",
    });
  }
};

exports.getSettlementByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const settlement = await EventSettlementRequest.findOne({ eventId });

    if (!settlement) {
      return res.status(404).json({ message: "No settlement found" });
    }

    res.json(settlement);
  } catch (err) {
    console.error("Get settlement error:", err);
    res.status(500).json({ message: "Failed to fetch settlement" });
  }
};


exports.getAdminPendingSettlements = async (req, res) => {
  try {
    const settlements = await EventSettlementRequest.find({
      status: { $in: ["requested", "under_review"] },
    })
      .populate("eventId", "title")
      .populate("organizerId", "name email")
      .sort({ requestedAt: -1 });

    res.json(settlements);
  } catch (err) {
    console.error("Admin pending error:", err);
    res.status(500).json({
      message: "Failed to load pending settlements",
    });
  }
};


exports.getSettlementComments = async (req, res) => {
  try {
    const { settlementId } = req.params;

    const comments = await SettlementComment.find({ settlementId })
      .populate("userId", "name")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    console.error("Fetch comments error:", err);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { settlementId } = req.params;

    const settlement = await EventSettlementRequest.findById(settlementId);
    if (!settlement) {
      return res.status(404).json({ message: "Settlement not found" });
    }

    if (["approved", "paid"].includes(settlement.status)) {
      return res.status(403).json({
        message: "Comments are locked after settlement finalization.",
      });
    }

    const comment = await SettlementComment.create({
      settlementId,
      userId: req.user.userId,
      role: req.user.roles.includes("admin") ? "admin" : "organizer",
      message: req.body.message,
    });

    res.json(comment);
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
};


exports.getMySettlements = async (req, res) => {
  try {
    const settlements = await EventSettlementRequest.find({
      organizerId: req.user.userId,
    });

    res.json(settlements);
  } catch (err) {
    console.error("Get my settlements error:", err);
    res.status(500).json({ message: "Failed to fetch settlements" });
  }
};
