const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find({}, { passwordHash: 0, __v: 0 });     //removes sensitive fields from output
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: "err" });
  }
});

module.exports = router;
