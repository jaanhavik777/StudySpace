import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { createSocket } from "../socket";
import "./Chatroom.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001";

function dmRoom(a, b) {
  const [x, y] = [a.toString(), b.toString()].sort();
  return `dm:${x}:${y}`;
}

export default function PrivateChat({ otherUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const socketRef = useRef(null);
  const me = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const EMOJIS = ["👍", "❤️", "😂", "🎉", "🔥", "😮", "😢", "🙏"];

  useEffect(() => {
    const s = createSocket(token);
    socketRef.current = s;
    const room = dmRoom(me.email || me._id || me.id, otherUser.email || otherUser._id || otherUser.id);
    s.connect();
    // register this socket as user room
    if (me && me.email) s.emit("register", { email: me.email });
    s.emit("joinRoom", { roomId: room });

    // load history
    axios
      .get(`${API_BASE}/api/messages/dm/${otherUser._id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setMessages(res.data || []))
      .catch(() => setMessages([]));

    s.on("message", (m) => {
      if (m.room === room) setMessages((prev) => [...prev, m]);
    });

    s.on("messageEdited", (m) => {
      if (m.room === room) setMessages((prev) => prev.map((x) => (x._id === m._id ? m : x)));
    });

    s.on("messageReacted", (m) => {
      if (m.room === room) setMessages((prev) => prev.map((x) => (x._id === m._id ? m : x)));
    });

    s.on("typing", ({ user, isTyping, roomId }) => {
      if (roomId === room && user !== (me.email || me._id)) {
        setTyping(isTyping);
      }
    });

    return () => {
      try {
        s.emit("leaveRoom", { roomId: room });
      } catch (e) {}
      try {
        s.disconnect();
      } catch (e) {}
    };
  }, [otherUser._id]);

  const typingTimeout = useRef(null);
  const sendTyping = (isTyping) => {
    const s = socketRef.current;
    const room = dmRoom(me.email || me._id, otherUser.email || otherUser._id);
    if (!s || !s.connected) return;
    s.emit("typing", { roomId: room, user: me.email || me._id, isTyping });
  };

  const onTextChange = (e) => {
    setText(e.target.value);
    sendTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      sendTyping(false);
      typingTimeout.current = null;
    }, 900);
  };

  const send = async (maybeEmoji) => {
    const bodyText = maybeEmoji ? maybeEmoji : text;
    if (!bodyText || !bodyText.trim()) return;
    try {
      await axios.post(
        `${API_BASE}/api/messages/dm/${otherUser._id}`,
        { text: bodyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setText("");
      sendTyping(false);
    } catch (e) {
      console.error(e);
    }
  };

  const editMessage = async (msgId, newText) => {
    try {
      await axios.put(`${API_BASE}/api/messages/edit/${msgId}`, { text: newText }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
      console.error(e);
    }
  };

  const reactToMessage = async (msgId, emoji) => {
    try {
      await axios.post(`${API_BASE}/api/messages/react/${msgId}`, { emoji }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="app-shell chatroom-container" style={{ maxWidth: 900 }}>
      <div className="chatroom-shell" style={{ gridTemplateColumns: "1fr" }}>
        <div className="right">
          <h3>Chat with {otherUser.name || otherUser.email}</h3>

          <div className="chat-window">
            {messages.map((m) => (
              <div key={m._id || m.createdAt} className={`msg ${ (m.from && (m.from.email === me.email || m.from._id === (me._id || me.id))) ? "me" : ""}`}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{m.from?.name} {m.edited ? "(edited)" : ""}</div>
                <div>{m.text}</div>

                {m.attachments && m.attachments.map((a, i) =>
                  <div key={i}>
                    {a.mime && a.mime.startsWith("image/") ? <img src={a.url} alt={a.name} style={{ maxWidth: 200 }} /> :
                      <a href={a.url} target="_blank" rel="noreferrer">{a.name || "attachment"}</a>}
                  </div>
                )}

                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {m.reactions && m.reactions.map((r, idx) => <span key={idx} style={{ marginRight: 6 }}>{r.emoji}</span>)}
                  <button onClick={() => reactToMessage(m._id, "👍")}>👍</button>
                  <button onClick={() => setShowEmojiMenu((s) => !s)}>😀</button>
                  {showEmojiMenu && (
                    <span style={{ marginLeft: 8 }}>
                      {EMOJIS.map((e) => <button key={e} onClick={() => { reactToMessage(m._id, e); setShowEmojiMenu(false); }}>{e}</button>)}
                    </span>
                  )}
                  { (m.from && (m.from.email === me.email || m.from._id === (me._id || me.id))) && <button onClick={() => {
                    const newText = prompt("Edit message", m.text);
                    if (newText !== null) editMessage(m._id, newText);
                  }}>Edit</button>}
                </div>
              </div>
            ))}
          </div>

          <div style={{ minHeight: 20, marginTop: 6 }}>
            {typing ? <small style={{ opacity: 0.85 }}>Typing...</small> : null}
          </div>

          <div className="input-row">
            <input value={text} onChange={onTextChange} placeholder="Type a message..." />
            <button onClick={() => send()}>Send</button>
            <button onClick={() => setShowEmojiMenu((s) => !s)}>😀</button>
            {showEmojiMenu && (
              <div style={{ position: "absolute", background: "#fff", padding: 8, borderRadius: 8 }}>
                {EMOJIS.map((e) => <button key={e} onClick={() => { send(e); setShowEmojiMenu(false); }}>{e}</button>)}
              </div>
            )}
            <button onClick={onClose} style={{ marginLeft: 8 }}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
