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
    console.error("Registration Error:", err.message);

    if (err.message === "Email already registered") {
      return res.status(409).json({ message: err.message });
    }

    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    return res.json({
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
    return res.status(400).json({ message: err.message });
  }
};

exports.requestOrganizer = async (req, res) => {
  try {
    const userId = req.user.userId;

    await authService.requestOrganizer(userId);

    return res.json({
      success: true,
      message: "Organizer request submitted successfully",
    });
  } catch (err) {
    console.error("Organizer Request Error:", err.message);
    return res.status(400).json({ message: err.message });
  }
};

exports.approveOrganizer = async (req, res) => {
  try {
    const { userId } = req.body;
    const adminId = req.user.userId;

    await authService.approveOrganizer(userId, adminId);

    return res.json({
      success: true,
      message: "Organizer role approved",
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.grantAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    const adminId = req.user.userId;

    await authService.grantAdmin(userId, adminId);

    return res.json({
      success: true,
      message: "Admin role granted",
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
