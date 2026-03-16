import React, { useEffect, useState } from "react";
import "./User.css";

export default function User() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("user"));             //converts saved string back to obj
    setUser(saved);                                                   //updates state
  }, []);

  if (!user) return null;

  return (
    <div className="app-shell user-container">
      <div className="user-card card">
        <h2>User Profile</h2>
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
        <button>Logout</button>
      </div>
    </div>
  );
}
