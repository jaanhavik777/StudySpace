const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  focusTime: { type: Number, default: 25 },
  shortBreak: { type: Number, default: 5 },
  longBreak: { type: Number, default: 15 },
  cyclesBeforeLong: { type: Number, default: 4 },
});

const Settings = mongoose.model("Settings", SettingsSchema);              //turns schema into usable db model

router.get("/", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Error loading settings" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { focusTime, shortBreak, longBreak, cyclesBeforeLong } = req.body;
    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings({ focusTime, shortBreak, longBreak, cyclesBeforeLong });
    } else {
      settings.focusTime = focusTime;
      settings.shortBreak = shortBreak;
      settings.longBreak = longBreak;
      settings.cyclesBeforeLong = cyclesBeforeLong;
    }

    await settings.save();
    res.json({ message: "Settings updated successfully", settings });
  } catch (err) {
    res.status(500).json({ message: "Error saving settings" });
  }
});

module.exports = router;
