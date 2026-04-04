const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:9002",
  googleUserInfoUrl: process.env.GOOGLE_USERINFO_URL || "https://www.googleapis.com/oauth2/v3/userinfo",
};

const requiredVars = ["MONGODB_URI", "JWT_SECRET"];

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = env;
