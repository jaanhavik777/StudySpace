import React, { useState } from "react";
import axios from "axios";
import "./Login.css";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleLogin() {
    if (!email || !password) return setMsg("Please fill all fields");

    try {
      const res = await axios.post("https://studyspace-q5gn.onrender.com/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.location.href = "/home";
    } catch (e) {
      setMsg("Invalid login");
    }
  }

  async function handleRegister() {
    if (!name || !email || !password) return setMsg("Please fill all fields");

    try {
      const res = await axios.post("https://studyspace-q5gn.onrender.com/api/auth/register", {
        name,
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.location.href = "/home";
    } catch (e) {
      console.log(e);
      setMsg("Registration failed");
    }
  }

  return (
    <div className="login-shell app-shell">
      <div className="login-card">
        <h2>{mode === "login" ? "Login" : "Sign Up"}</h2>

        {msg && <p className="err">{msg}</p>}

        {mode === "register" && (
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {mode === "login" ? (
          <button onClick={handleLogin}>Login</button>
        ) : (
          <button onClick={handleRegister}>Sign Up</button>
        )}

        <p className="toggle">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <span onClick={() => setMode("register")}>Sign up</span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span onClick={() => setMode("login")}>Login</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
