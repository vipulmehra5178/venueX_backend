const Event = require("../../models/event.model");

exports.createEvent = async (data, organizerId) => {
  const event = await Event.create({
    ...data,
    organizerId,
    availableTickets: data.totalTickets
  });

  return event;
};

exports.getAllEvents = async () => {
  return Event.find({ status: "active" }).sort({ dateTime: 1 });
};

exports.getEventById = async (id) => {
  return Event.findById(id);
};

exports.updateEvent = async (eventId, data, user) => {
  let event;

  if (user.roles.includes("admin")) {
    event = await Event.findById(eventId);
  } else {
    event = await Event.findOne({
      _id: eventId,
      organizerId: user.userId
    });
    const io = getIO();

io.to(`event_${event._id}`).emit("EVENT_UPDATED", {
  event
});

  }

  if (!event) throw new Error("Event not found or unauthorized");

  Object.assign(event, data);
  await event.save();

  return event;
};


exports.deleteEvent = async (eventId, user) => {
  let event;

  if (user.roles.includes("admin")) {
    event = await Event.findById(eventId);
  } else {
    event = await Event.findOne({
      _id: eventId,
      organizerId: user.userId
    });
  }

  if (!event) throw new Error("Event not found or unauthorized");

  event.status = "cancelled";
  await event.save();
  io.to(`event_${event._id}`).emit("EVENT_CANCELLED", {
  eventId: event._id
});

};

