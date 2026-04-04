const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const env = require("./config/env");
const { connectDb } = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const { notFound, errorHandler } = require("./middleware/error.middleware");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDb(env.mongoUri);
    app.listen(env.port, () => {
      console.log(`Backend listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  }
}

startServer();
