import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="app-shell home-container">
      <h1 className="home-title">Welcome Back to StudySpace</h1>
      <div className="home-subtitle p">
      <p>A Virtual Study Group Platform</p>
      </div>

      <div className="home-cards">
        <Link to="/pomodoro" className="home-card">
          <h3>Pomodoro</h3>
          <p>Stay focused with structured study cycles</p>
        </Link>

        <Link to="/sessions" className="home-card">
          <h3>Study Sessions</h3>
          <p>Study together</p>
        </Link>

        <Link to="/resources" className="home-card">
          <h3>Resources</h3>
          <p>Your study materials</p>
        </Link>

        <Link to="/chat" className="home-card">
          <h3>Chatroom</h3>
          <p>Connect with peers</p>
        </Link>

        <Link to="/settings" className="home-card">
          <h3>Settings</h3>
          <p>Customize your settings</p>
        </Link>
      </div>
    </div>
  );
}
