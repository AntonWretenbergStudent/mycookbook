import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* const response = await fetch(`http://localhost:3000/api/recipe`, {
  method: "POST",
  body: JSON.stringify({
    title,
    capion
  }),
  headers: { Authorization: `Bearer ${token}`},
}) */

const protectRoute = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer", "");

    if (!token)
      return res
        .status(401)
        .json({ message: "No authentication token, access denied" });

    // verify token
    const decoded = jwt.verify(token, process.env.JWT.SECRET);

    // find user
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) return res.status(401).json({ message: "Token is not valid" });

    req.user = user;
    next();
  } catch (error) {
    console.log("Authorization error", error);
    res.status(401).json({ message: "Token is not valid" })
  }
};

export default protectRoute