const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Driver = require("../models/Driver");
const Student = require("../models/Student");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user;
      switch (decoded.role) {
        case "admin":
          user = await Admin.findById(decoded.id).select("-password");
          break;
        case "driver":
          user = await Driver.findById(decoded.id).select("-password");
          if (user && !user.is_active) {
            return res
              .status(403)
              .json({
                message:
                  "Your account has been deactivated. Please contact admin.",
              });
          }
          break;
        case "student":
          user = await Student.findById(decoded.id).select("-password");
          break;
        default:
          return res.status(401).json({ message: "Invalid token role" });
      }

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      req.userRole = decoded.role;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res
        .status(403)
        .json({
          message: `Role '${req.userRole}' is not authorized to access this route`,
        });
    }
    next();
  };
};

module.exports = { protect, authorize };
