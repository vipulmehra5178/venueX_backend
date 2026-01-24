const eventService = require("./event.service");

exports.createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(
      req.body,
      req.user.userId
    );

    res.status(201).json({
      message: "Event created successfully",
      event
    });
  } catch (err) {
    next(err);
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const events = await eventService.getAllEvents();
    res.json(events);
  } catch (err) {
    next(err);
  }
};

exports.getEvent = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.json(event);
  } catch (err) {
    next(err);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(
      req.params.id,
      req.body,
      req.user
    );

    res.json({
      message: "Event updated",
      event
    });
  } catch (err) {
    next(err);
  }
};


exports.deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEvent(
      req.params.id,
      req.user
    );

    res.json({ message: "Event cancelled" });
  } catch (err) {
    next(err);
  }
};

