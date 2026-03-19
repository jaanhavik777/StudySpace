import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Settings.css";

export default function Settings() {
  const [focusTime, setFocusTime] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);
  const [cyclesBeforeLong, setCyclesBeforeLong] = useState(3);
  const [message, setMessage] = useState("");

  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [editing, setEditing] = useState(false);

  useEffect(() => {                                                     //loads initial data & pre fills fields
    const saved = JSON.parse(localStorage.getItem("user"));
    if (saved) setUser(saved);

    axios.get("https://studyspace-q5gn.onrender.com/api/settings").then((res) => {
      if (res.data && res.data.focusTime) {
        setFocusTime(res.data.focusTime);
        setShortBreak(res.data.shortBreak);
        setLongBreak(res.data.longBreak);
        setCyclesBeforeLong(res.data.cyclesBeforeLong);
      }
    });
  }, []);

  const savePomodoro = async () => {                                  //save the settings to server
    try {
      await axios.post("https://studyspace-q5gn.onrender.com/api/settings", {
        focusTime,
        shortBreak,
        longBreak,
        cyclesBeforeLong,
      });
      setMessage("Settings saved!");
      setTimeout(() => setMessage(""), 2000);
    } catch {
      setMessage("Save failed");
    }
  };

  const updateUser = async () => {                                        //updates user profile
    try {
      const res = await axios.put("https://studyspace-q5gn.onrender.com/api/user/update", user);
      // FIX: preserve the existing _id when writing back to localStorage.
      // The update endpoint may return { name, email } without _id, which
      // would silently wipe the ID and break DMs until the user re-logs in.
      const existing = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...existing, ...res.data.user }));
      setEditing(false);
      setMessage("User updated!");
      setTimeout(() => setMessage(""), 2000);
    } catch {
      setMessage("Update failed");
    }
  };

  return (
    <div className="app-shell">
      <h2 className="section-title">Settings</h2>

      <div className="card">
        <h3>Pomodoro Settings</h3>

        <label>Focus Time</label>
        <input
          type="number"
          value={focusTime}
          onChange={(e) => setFocusTime(Number(e.target.value))}
        />

        <label>Short Break</label>
        <input
          type="number"
          value={shortBreak}
          onChange={(e) => setShortBreak(Number(e.target.value))}
        />

        <label>Long Break</label>
        <input
          type="number"
          value={longBreak}
          onChange={(e) => setLongBreak(Number(e.target.value))}
        />

        <label>Cycles Before Long Break</label>
        <input
          type="number"
          value={cyclesBeforeLong}
          onChange={(e) => setCyclesBeforeLong(Number(e.target.value))}                   //converts ip text to no
        />

        <button className="btn" onClick={savePomodoro}>Save</button>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3>User Info</h3>

        <label>Name</label>
        <input
          disabled={!editing}
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />

        <label>Email</label>
        <input disabled value={user.email} />

        <label>Password</label>
        <input
          type="password"
          disabled={!editing}                                   //cant edit userpassword
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
        />

        {!editing ? (
          <button className="btn" onClick={() => setEditing(true)}>Edit</button>
        ) : (
          <button className="btn" onClick={updateUser}>Update</button>
        )}
      </div>

      {message && <p style={{ marginTop: 20 }}>{message}</p>}
    </div>
  );
}