const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    googleId: {
      type: String,
    },

    roles: {
      type: [String],
      enum: ["attendee", "organizer", "admin"],
      default: ["attendee"],
    },

    profile: {
      city: String,
      phone: String,
    },


    organizerRequestStatus: {
      type: String,
      enum: ["none", "pending", "approved"],
      default: "none",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
