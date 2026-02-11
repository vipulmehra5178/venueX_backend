const User = require("../../models/user.model");
const AuditLog = require("../../models/auditLog.model");

exports.getPendingOrganizers = async () => {
  const logs = await AuditLog.find({
    action: "REQUEST_ORGANIZER_ROLE",
  });

  const userIds = logs.map((l) => l.userId);
return User.find({
  _id: { $in: userIds },
  roles: { $ne: "organizer" }
})
.select("name email roles createdAt");

};
