// utils/jwt.js
import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  const id = user.id ?? user._id ?? user.userId ?? user.sub;
  const serviceNum = user.serviceNum ?? user.service_number ?? null;
  const role = user.role ?? null;
  return jwt.sign({ id, serviceNum, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};
