const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const env = require("./src/config/environment");
const logger = require("./src/utils/logger");

// Import Middlewares
const { errorHandler } = require("./src/middleware/errorMiddleware");

// Import Routes
const authRoutes = require("./src/routes/authRoutes");
const citizenRoutes = require("./src/routes/citizenRoutes");
const complaintRoutes = require("./src/routes/complaintRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const officerRoutes = require("./src/routes/officerRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const feedbackRoutes = require("./src/routes/feedbackRoutes");

const app = express();

// Security and utility middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows static uploads serving across origins
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Morgan logger to winston bridge
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Serve uploads directory as static
const uploadDirectory = path.join(__dirname, env.UPLOAD_DIR);
app.use("/uploads", express.static(uploadDirectory));

// API Routes mounting
app.use("/api/auth", authRoutes);
app.use("/api/citizens", citizenRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/officer", officerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", feedbackRoutes); // mounts POST /api/complaints/:id/feedback

// Welcome route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to AI-Based Public Grievance Redressal Portal API Engine.",
    version: "1.0.0",
  });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Requested route ${req.originalUrl} not found`,
    error: "ROUTE_NOT_FOUND",
  });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
