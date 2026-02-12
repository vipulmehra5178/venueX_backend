const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
const AuditLog = require("../../models/auditLog.model");

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY";

const generateToken = (user) =>
  jwt.sign(
    {
      userId: user._id,
      roles: user.roles,
      name: user.name,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

exports.register = async ({
  name,
  email,
  password,
  city,
  phone,
  authProvider = "local",
}) => {
  const exists = await User.findOne({ email });
  if (exists) {
    throw new Error("Email already registered");
  }

  let hashedPassword;
  if (authProvider === "local") {
    hashedPassword = await bcrypt.hash(password, 12);
  }

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    profile: { city, phone },
    roles: ["attendee"],
    authProvider,
  });

  return {
    token: generateToken(user),
    user,
  };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user || user.authProvider !== "local") {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  return {
    token: generateToken(user),
    user,
  };
};

exports.requestOrganizer = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (user.organizerRequestStatus === "pending") {
    throw new Error("Request already submitted");
  }

  if (user.roles.includes("organizer")) {
    throw new Error("User is already an organizer");
  }

  user.organizerRequestStatus = "pending";
  await user.save();

  await AuditLog.create({
    userId,
    action: "REQUEST_ORGANIZER_ROLE",
  });

  return user;
};

exports.approveOrganizer = async (userId, adminId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (!user.roles.includes("organizer")) {
    user.roles.push("organizer");
  }

  user.organizerRequestStatus = "approved";
  await user.save();

  await AuditLog.create({
    userId,
    action: "APPROVE_ORGANIZER_ROLE",
    performedBy: adminId,
  });

  return user;
};

exports.grantAdmin = async (userId, adminId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (!user.roles.includes("admin")) {
    user.roles.push("admin");
    await user.save();
  }

  await AuditLog.create({
    userId,
    action: "GRANT_ADMIN_ROLE",
    performedBy: adminId,
  });

  return user;
};
