const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

const verifyToken = (req, res, next) => {
  try {
    //Lấy token từ header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        errCode: 1,
        message: "Missing token - no Authorization header",
      });
    }

    // Lấy token từ header có format "Bearer <token>"
    const parts = authHeader.split(" ");
    
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        errCode: 1,
        message: "Invalid token format. Expected 'Bearer <token>'",
      });
    }

    const token = parts[1];

    // verify token và giải mã payload
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        errCode: 1,
        message: "Token expired",
        expiredAt: error.expiredAt,
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        errCode: 1,
        message: "Invalid token",
      });
    }

    // Lỗi không xác định
    return res.status(401).json({
      errCode: 1,
      message: error.message || "Authentication failed",
    });
  }
};

module.exports = verifyToken;
