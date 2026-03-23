const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require('cookie-parser');
const { errorHandler, notFound } = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes")

const app = express();

// Security headers
app.use(helmet());

// Allow frontend to connect
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(cookieParser())

// Rate limiting — all routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// Stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
});

app.use(limiter);

// Parse JSON request bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Log every request in terminal
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/profile",authLimiter,profileRoutes)

app.use(notFound);
app.use(errorHandler);



module.exports = app;
