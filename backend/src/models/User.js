/* eslint-disable @typescript-eslint/no-require-imports */
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, index: true, sparse: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    photoURL: { type: String, default: null },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    authProvider: { type: String, enum: ["google", "credentials"], default: "google" },
    passwordHash: { type: String, default: null },
    oauth: {
      provider: { type: String, default: "google" },
      providerUserId: { type: String, default: null },
      accessToken: { type: String, default: null },
      tokenType: { type: String, default: null },
      scope: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      lastLoginAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
