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
  const event = await Event.findById(req.params.id);

  if (!event) return res.status(404).json({ message: "Event not found" });

  if (
    event.organizerId.toString() !== req.user.userId &&
    !req.user.roles.includes("admin")
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  Object.assign(event, req.body);
  await event.save();

  res.json(event);
};

exports.getAllEvents = async (req, res) => {
  const events = await Event.find({ status: "published" }).sort({ createdAt: -1 });
  res.json(events);
};

exports.getEventById = async (req, res) => {
  const event = await Event.findById(req.params.id);
  res.json(event);
};

exports.cancelEvent = async (req, res) => {
  await Event.findByIdAndUpdate(req.params.id, { status: "cancelled" });
  res.json({ message: "Event cancelled" });
};
