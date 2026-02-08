const Event = require("../../models/event.model");

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
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (
      !req.user.roles.includes("admin") &&
      event.organizerId.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "You are not allowed to edit this event",
      });
    }

    Object.assign(event, req.body);
    await event.save();

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "Failed to update event" });
  }
};

exports.getAllEvents = async (req, res) => {
  const { search, category, city, sort } = req.query;

  const filter = { status: "published" };

  if (search) {
    filter.$or = [
      { title: new RegExp(search, "i") },
      { subtitle: new RegExp(search, "i") },
      { tags: new RegExp(search, "i") },
    ];
  }

  if (category && category !== "All") {
    filter.category = category;
  }

  if (city) {
    filter.city = new RegExp(city, "i");
  }

  let query = Event.find(filter);

  if (sort === "date") {
    query = query.sort({ startDateTime: 1 });
  } else if (sort === "price") {
    query = query.sort({ ticketPrice: 1 });
  } else if (sort === "popular") {
    query = query.sort({ views: -1 });
  } else {
    query = query.sort({ createdAt: -1 });
  }

  const events = await query;
  res.json(events);
};


exports.getEventById = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });

  event.views += 1;
  await event.save();

  res.json(event);
};


exports.cancelEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (
      !req.user.roles.includes("admin") &&
      event.organizerId.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "You are not allowed to cancel this event",
      });
    }

    event.status = "cancelled";
    await event.save();

    res.json({ message: "Event cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel event" });
  }
};
exports.getMyEvents = async (req, res) => {
  try {
    if (req.user.roles.includes("admin")) {
      const events = await Event.find({
          status: "published",

      }).sort({ createdAt: -1 });
      return res.json(events);
    }

    const events = await Event.find({
      organizerId: req.user.userId,
        status: "published",

    }).sort({ createdAt: -1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch organizer events",
    });
  }
};

