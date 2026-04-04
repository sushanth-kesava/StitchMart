const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");

function calculateExpiryDate(expiresInSeconds) {
  if (!expiresInSeconds || Number.isNaN(Number(expiresInSeconds))) {
    return null;
  }

  const now = Date.now();
  return new Date(now + Number(expiresInSeconds) * 1000);
}

async function loginWithGoogle(req, res, next) {
  try {
    const { googleAccessToken, role = "customer", tokenType = "Bearer", scope = null, expiresIn = null } = req.body;

    if (!googleAccessToken) {
      return res.status(400).json({
        success: false,
        message: "googleAccessToken is required",
      });
    }

    const { data: googleProfile } = await axios.get(env.googleUserInfoUrl, {
      headers: {
        Authorization: `Bearer ${googleAccessToken}`,
      },
      timeout: 8000,
    });

    if (!googleProfile || !googleProfile.email || !googleProfile.sub) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google OAuth token",
      });
    }

    const userPayload = {
      googleId: googleProfile.sub,
      email: googleProfile.email,
      displayName: googleProfile.name || googleProfile.email.split("@")[0],
      photoURL: googleProfile.picture || null,
      role: role === "admin" ? "admin" : "customer",
      authProvider: "google",
      oauth: {
        provider: "google",
        providerUserId: googleProfile.sub,
        accessToken: googleAccessToken,
        tokenType,
        scope,
        expiresAt: calculateExpiryDate(expiresIn),
        lastLoginAt: new Date(),
      },
    };

    const user = await User.findOneAndUpdate(
      { email: userPayload.email },
      { $set: userPayload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const jwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const jwtOptions = env.jwtExpiresIn ? { expiresIn: env.jwtExpiresIn } : undefined;
    const appToken = jwt.sign(jwtPayload, env.jwtSecret, jwtOptions);

    return res.status(200).json({
      success: true,
      message: "Authenticated successfully",
      token: appToken,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.status(401).json({
        success: false,
        message: "Google token verification failed",
      });
    }

    return next(error);
  }
}

module.exports = {
  loginWithGoogle,
};
