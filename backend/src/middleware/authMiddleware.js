const jwt = require("jsonwebtoken");
const env = require("../config/environment");

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization credentials not provided",
      error: "UNAUTHORIZED",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT.SECRET);
    req.user = decoded; // Attach payload containing userId, role, departmentId, districtId
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authorization token",
      error: "TOKEN_EXPIRED",
    });
  }
};

module.exports = {
  requireAuth,
};
