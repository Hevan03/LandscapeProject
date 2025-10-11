// utils/jwt.js
import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, serviceNum: user.serviceNum, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" } // 1 day
  );
};
