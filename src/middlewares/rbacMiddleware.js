const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // check req.user có tồn tại không
      if (!req.user) {
        return res.status(401).json({
          errCode: 1,
          message: "User not authenticated. Run verifyToken middleware first.",
        });
      }

      // lấy role
      const userRole = req.user.role;
      
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          errCode: 1,
          message: `Forbidden. Required roles: ${allowedRoles.join(", ")}, but user role is: ${userRole}`,
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({
        errCode: 1,
        message: error.message || "Role checking failed",
      });
    }
  };
};

module.exports = requireRole;
