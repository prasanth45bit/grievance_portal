const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      });
    }

    const hasRole = allowedRoles.includes(req.user.role);
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: "You do not have access permissions for this action",
        error: "ACCESS_DENIED",
      });
    }

    next();
  };
};

module.exports = {
  requireRole,
};
