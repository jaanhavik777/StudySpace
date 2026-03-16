const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Message = require("../models/Message");

// helper to build consistent dm room name
function dmRoom(a, b) {
  const [x, y] = [a.toString(), b.toString()].sort();
  return `dm:${x}:${y}`;
}

// GET DM history
router.get("/dm/:otherId", auth, async (req, res) => {
  const me = req.user.id;
  const other = req.params.otherId;
  const room = dmRoom(me, other);
  try {
    const msgs = await Message.find({ room }).sort({ createdAt: 1 }).populate("from", "name email");
    res.json(msgs);
  } catch (e) {
    res.status(500).json({ message: "err" });
  }
});

// POST DM (persist + emit)
router.post("/dm/:otherId", auth, async (req, res) => {
  const me = req.user.id;
  const other = req.params.otherId;
  const text = req.body.text || "";
  const attachments = req.body.attachments || []; // optional array [{name, url, mime}]
  if (!text && (!attachments || attachments.length === 0)) return res.status(400).json({ message: "Empty" });
  const room = dmRoom(me, other);
  try {
    const m = await Message.create({ type: "dm", room, from: me, toUser: other, text, attachments });
    const full = await m.populate("from", "name email").execPopulate?.() || (await Message.findById(m._id).populate("from", "name email"));
    // emit to room via io
    const io = req.app.get("io");
    if (io) io.to(room).emit("message", full);
    res.json(full);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "err" });
  }
});

// GET session messages
router.get("/session/:sessionId", auth, async (req, res) => {
  const sessionId = req.params.sessionId;
  try {
    const msgs = await Message.find({ room: `session:${sessionId}` }).sort({ createdAt: 1 }).populate("from", "name email");
    res.json(msgs);
  } catch (e) {
    res.status(500).json({ message: "err" });
  }
});

// POST session message (persist + emit)
router.post("/session/:sessionId", auth, async (req, res) => {
  const sessionId = req.params.sessionId;
  const text = req.body.text || "";
  const attachments = req.body.attachments || [];
  if (!text && (!attachments || attachments.length === 0)) return res.status(400).json({ message: "Empty" });
  try {
    const room = `session:${sessionId}`;
    const m = await Message.create({ type: "session", room, from: req.user.id, session: sessionId, text, attachments });
    const full = await m.populate("from", "name email").execPopulate?.() || (await Message.findById(m._id).populate("from", "name email"));
    const io = req.app.get("io");
    if (io) io.to(room).emit("message", full);
    res.json(full);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "err" });
  }
});

// edit message
router.put("/edit/:msgId", auth, async (req, res) => {
  const msgId = req.params.msgId;
  const text = req.body.text;
  try {
    const m = await Message.findById(msgId);
    if (!m) return res.status(404).json({ message: "Not found" });
    if (m.from.toString() !== req.user.id) return res.status(403).json({ message: "Forbidden" });
    m.text = text;
    m.edited = true;
    await m.save();
    const full = await m.populate("from", "name email").execPopulate?.() || (await Message.findById(m._id).populate("from", "name email"));
    const io = req.app.get("io");
    if (io) io.to(m.room).emit("messageEdited", full);
    res.json(full);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "err" });
  }
});

// react to message
router.post("/react/:msgId", auth, async (req, res) => {
  const msgId = req.params.msgId;
  const emoji = req.body.emoji;
  try {
    const m = await Message.findById(msgId);
    if (!m) return res.status(404).json({ message: "Not found" });
    // remove any existing reaction by this user for the same emoji (toggle behavior)
    m.reactions = m.reactions || [];
    const existingIndex = m.reactions.findIndex(r => r.user.toString() === req.user.id && r.emoji === emoji);
    if (existingIndex >= 0) {
      m.reactions.splice(existingIndex, 1); // toggle off
    } else {
      m.reactions.push({ user: req.user.id, emoji });
    }
    await m.save();
    const full = await m.populate("from", "name email").execPopulate?.() || (await Message.findById(m._id).populate("from", "name email"));
    const io = req.app.get("io");
    if (io) io.to(m.room).emit("messageReacted", full);
    res.json(full);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "err" });
  }
});

module.exports = router;
