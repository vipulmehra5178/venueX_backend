const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    action: String,
    performedBy: mongoose.Schema.Types.ObjectId,
    metadata: Object
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
