const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET || "supersecret";           //supersecret if there is no env variable

module.exports = function (req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Unauthorized" });
  const token = header.split(" ")[1];                                 //extract token
  try {
    const data = jwt.verify(token, secret);               //verifies token
    req.user = data; // { id, email, name }
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
