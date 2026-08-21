const env = require("../config/environment");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error("Unhandled error: %s", err.stack || err.message);

  const statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";

  if (statusCode === 500 && env.NODE_ENV === "production") {
    message = "An unexpected error occurred on the server.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: err.code || "INTERNAL_ERROR",
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = {
  errorHandler,
};
