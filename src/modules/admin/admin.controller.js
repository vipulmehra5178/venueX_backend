const adminService = require("./admin.service");

exports.getPendingOrganizers = async (req, res) => {
  try {
    const users = await adminService.getPendingOrganizers();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};
