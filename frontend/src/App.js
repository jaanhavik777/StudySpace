import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Sessions from "./components/Sessions";
import SessionDetail from "./components/SessionDetail";
import Chatroom from "./components/Chatroom";
import Login from "./components/Login";
import ResourceHub from "./components/ResourceHub";
import Settings from "./components/Settings";
import Pomodoro from "./components/Pomodoro";
import Navbar from "./components/Navbar";

function App() {
  const isLoggedIn = !!localStorage.getItem("token");       //looks for token

  return (
    <BrowserRouter>                                         {/*wrapps up the app*/}
      {/* Show navbar only if user is logged in ; cant access other pages */}
      {isLoggedIn && <Navbar />}

      <Routes>
        
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/home" /> : <Login />}
        />

        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/home" /> : <Login />}
        />

        <Route
          path="/home"
          element={isLoggedIn ? <Home /> : <Navigate to="/login" />}
        />

        <Route
          path="/sessions"
          element={isLoggedIn ? <Sessions /> : <Navigate to="/login" />}
        />

        <Route
          path="/sessions/:id"
          element={isLoggedIn ? <SessionDetail /> : <Navigate to="/login" />}
        />

        <Route
          path="/chat"
          element={isLoggedIn ? <Chatroom /> : <Navigate to="/login" />}
        />

        <Route
          path="/resources"
          element={isLoggedIn ? <ResourceHub /> : <Navigate to="/login" />}
        />

        <Route
          path="/settings"
          element={isLoggedIn ? <Settings /> : <Navigate to="/login" />}
        />

        <Route
          path="/pomodoro"
          element={isLoggedIn ? <Pomodoro /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
