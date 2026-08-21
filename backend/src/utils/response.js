const sendSuccess = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, message, errorType = "BAD_REQUEST", statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: errorType,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
