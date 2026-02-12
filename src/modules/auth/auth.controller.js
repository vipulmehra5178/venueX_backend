const authService = require("./auth.service");

exports.register = async (req, res) => {
  try {
    const result = await authService.register(req.body);

    return res.status(201).json({
      success: true,
      token: result.token,
      user: {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        roles: result.user.roles,
      },
    });
  } catch (err) {
    console.error("Registration Error:", err);

    if (err.message === "Email already registered") {
      return res.status(409).json({ message: err.message });
    }

    return res.status(500).json({ message: "An unexpected error occurred" });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    res.json({
      success: true,
      token: result.token,
      user: {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        roles: result.user.roles,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.requestOrganizer = async (req, res) => {
  try {
    const user = await authService.requestOrganizer(req.user.userId);

    res.json({
      success: true,
      message: "Organizer request submitted",
      status: user.organizerRequestStatus,
    });
  } catch (err) {
    console.error("Request Organizer Error:", err);
    res.status(400).json({ message: err.message });
  }
};

exports.approveOrganizer = async (req, res) => {
  try {
    await authService.approveOrganizer(req.body.userId, req.user.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.grantAdmin = async (req, res) => {
  try {
    await authService.grantAdmin(req.body.userId, req.user.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
