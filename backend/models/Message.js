const mongoose = require("mongoose");

const AttachmentSchema = new mongoose.Schema({
  name: String,
  url: String,     
  mime: String
}, { _id: false });

const ReactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  emoji: String
}, { _id: false });

const MessageSchema = new mongoose.Schema({
  type: { type: String, enum: ["dm", "session"], required: true },
  room: { type: String, required: true }, 
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  session: { type: mongoose.Schema.Types.ObjectId, ref: "Session" }, 
  text: { type: String, default: "" },
  attachments: [AttachmentSchema],
  edited: { type: Boolean, default: false },
  reactions: [ReactionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", MessageSchema);
