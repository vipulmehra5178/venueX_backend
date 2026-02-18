const Event = require("../../models/event.model");
const EventSettlementRequest = require("../../models/eventSettlementRequest.model");

exports.createEvent = async (req, res) => {
  const event = await Event.create({
    ...req.body,
    organizerId: req.user.userId,
    availableTickets: req.body.totalTickets,
  });

  res.status(201).json(event);
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select("organizerId");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const settlement = await EventSettlementRequest.exists({
      eventId: event._id,
      status: { $in: ["requested", "under_review", "approved", "paid"] },
    });

    if (settlement) {
      return res.status(403).json({
        message: "Event locked due to settlement process",
      });
    }

    if (
      !req.user.roles.includes("admin") &&
      event.organizerId.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Not allowed to edit this event",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean();

    res.json(updatedEvent);

  } catch (err) {
    res.status(500).json({ message: "Failed to update event" });
  }
};


exports.getAllEvents = async (req, res) => {
  try {
    const {
      search,
      category,
      city,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { status: "published" };

    if (search) {
      filter.$text = { $search: search };
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (city) {
      filter.city = city;
    }

    const skip = (page - 1) * limit;

    let query = Event.find(filter)
      .select("title subtitle category city startDateTime ticketPrice availableTickets totalTickets isPaid coverImage views")

      .lean();

   
    if (sort === "date") {
      query = query.sort({ startDateTime: 1 });
    } else if (sort === "price") {
      query = query.sort({ ticketPrice: 1 });
    } else if (sort === "popular") {
      query = query.sort({ views: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const events = await query.skip(skip).limit(Number(limit));

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
};


exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } }, 
      { new: true }
    ).lean();

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch event" });
  }
};

exports.cancelEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (["requested", "settled"].includes(event.settlementStatus)) {
      return res.status(403).json({
        message:
          "Event cannot be cancelled after settlement request.",
      });
    }

    if (
      !req.user.roles.includes("admin") &&
      event.organizerId.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "You are not allowed to cancel this event",
      });
    }

    await Event.findByIdAndUpdate(req.params.id, {
  status: "cancelled",
});

    res.json({ message: "Event cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel event" });
  }
};

exports.getMyEvents = async (req, res) => {
  try {
    const filter = { status: "published" };

    if (!req.user.roles.includes("admin")) {
      filter.organizerId = req.user.userId;
    }

    const events = await Event.find(filter)
      .select("title category city startDateTime views")
      .sort({ createdAt: -1 })
      .lean();

    res.json(events);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch organizer events",
    });
  }
};


