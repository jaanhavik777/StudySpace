import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Pomodoro.css";
import { useLocation } from "react-router-dom";

export default function Pomodoro() {
  const [time, setTime] = useState(25 * 60);            
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState("focus");
  const [cycleCount, setCycleCount] = useState(0);

  const [stats, setStats] = useState({                
    totalSessions: 0,                                     //user statistics
    totalStudyTime: 0,
    tasksDone: 0,
    todos: [],
    notes: "",
  });

  const [settings, setSettings] = useState({                  //pomodoro statistics
    focusTime: 25,    
    shortBreak: 5,
    longBreak: 15,
    cyclesBeforeLong: 3,
  });

  const [newTodo, setNewTodo] = useState("");
  const [elapsed, setElapsed] = useState(0);                    //tracks sec spend in current session

  useEffect(() => {
    document.body.classList.add("pomodoro-active");                       //when component mounts it is adds the class to the body
    return () => document.body.classList.remove("pomodoro-active");         //when unmounts it removes the class
  }, []);

  useEffect(() => {
    axios.get("http://localhost:3001/api/settings").then((res) => {               ///fetch the initial settings from backend
      if (res.data && res.data.focusTime) setSettings(res.data);
    });
  }, []);

const location = useLocation();                                                       // Re-fetch settings when url changes
useEffect(() => {
  axios.get("http://localhost:3001/api/settings").then((res) => {
    if (res.data && res.data.focusTime) setSettings(res.data);
  });
}, [location.pathname]);

useEffect(() => {
  if (mode === "focus") setTime(settings.focusTime * 60);                         // Update timer when settings change
  else if (mode === "short") setTime(settings.shortBreak * 60);
  else setTime(settings.longBreak * 60);
}, [settings]);


  useEffect(() => {
    axios.get("http://localhost:3001/api/pomodoro/guest").then((res) => {                           //loads user & pomodoro stats from the backend
      if (res.data && !res.data.message) {
        // ensure defaults
        setStats({
          totalSessions: res.data.totalSessions || 0,
          totalStudyTime: res.data.totalStudyTime || 0,
          tasksDone: res.data.tasksDone || 0,
          todos: res.data.todos || [],
          notes: res.data.notes || "",
        });
      }
    });
  }, []);

  const persistStats = async (override = {}) => {                                     //save stats to backend
    try {
      const payload = {                                                               //payload -> data u send to the server
        user: "guest",
        ...stats,
        ...override,
      };

      payload.totalSessions = Number(payload.totalSessions || 0);                             //ensures numbers are not updated/ set as nan
      payload.totalStudyTime = Number(payload.totalStudyTime || 0);
      payload.tasksDone = Number(payload.tasksDone || 0);

      await axios.post("http://localhost:3001/api/pomodoro/update", payload);
    } catch (e) {
      console.error("Failed to persist pomodoro stats:", e);
    }
  };

  const handleSessionEnd = useCallback(() => {                                        //handlees end of session
    const minutesPassed = Math.floor(elapsed / 60);
    setStats((prev) => {
      const next = {                                                                        //if timer -> 0, adds to study time
        ...prev,
        totalSessions: prev.totalSessions + 1,
        totalStudyTime:
          mode === "focus" ? prev.totalStudyTime + minutesPassed : prev.totalStudyTime,
      };
      // persist
      persistStats(next);
      return next;
    });
    setElapsed(0);                                                                          //pomodoro cycle
    if (mode === "focus") {
      const newCycle = cycleCount + 1;
      setCycleCount(newCycle);

      if (newCycle % settings.cyclesBeforeLong === 0) {
        setMode("long");
        setTime(settings.longBreak * 60);

      } else {
        setMode("short");
        setTime(settings.shortBreak * 60);
      }

    } else {
      setMode("focus");
      setTime(settings.focusTime * 60);
    }
  }, [elapsed, mode, settings, cycleCount]);

  useEffect(() => {                                                                   //timer logic
    let timer;
    if (running && time > 0) {
      timer = setInterval(() => {
        setTime((t) => t - 1);
        setElapsed((e) => e + 1);
      }, 1000);
    } else if (time === 0) {
      setRunning(false);
      handleSessionEnd();
    }
    return () => clearInterval(timer);
  }, [running, time, handleSessionEnd]);

  const saveData = async () => {                                                              //button to save progress
    const minutesPassed = Math.floor(elapsed / 60);
    const updatedStats = {
      ...stats,
      totalSessions: stats.totalSessions + 1,
      totalStudyTime: stats.totalStudyTime + minutesPassed,
    };
    setStats(updatedStats);
    setElapsed(0);
    await axios.post("http://localhost:3001/api/pomodoro/update", {
      user: "guest",
      ...updatedStats,
    });
  };

  const formatTime = (t) =>
    `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(                  //timer format (converts sec to mins:sec)
      2,
      "0"
    )}`;

  const addTodo = () => {                                                                         //add task
    if (!newTodo.trim()) return;
    const newItem = { text: newTodo.trim(), done: false };
    const updatedTodos = [...stats.todos, newItem];
    
    const next = { ...stats, todos: updatedTodos };                                                   // tasksDone unchanged
    setStats(next);
    setNewTodo("");
    persistStats(next);
  };

  const toggleTodo = (index) => {                                                             //toggles todo
    const updated = stats.todos.map((t, i) =>
      i === index ? { ...t, done: !t.done } : t
    );


    const newTasksDone = updated.reduce((acc, t) => acc + (t.done ? 1 : 0), 0);                           //tasksDone changed

    const next = { ...stats, todos: updated, tasksDone: newTasksDone };                           
    setStats(next);
    persistStats(next);
  };
const deleteTodo = async (index) => {                                                   //delete toto
  const updatedTodos = [...stats.todos];
  updatedTodos.splice(index, 1);

  const updatedStats = {
    ...stats,
    todos: updatedTodos,
    tasksDone: stats.tasksDone + 1,
  };

  setStats(updatedStats);

  await axios.post("http://localhost:3001/api/pomodoro/update", {                         //update stats
    user: "guest",
    ...updatedStats,
  });
};


  return (
    <div className="pomodoro-page">
      <h1 className="pomodoro-title">
        {mode === "focus" ? "Focus Time" : mode === "short" ? "Short Break" : "Long Break"}
      </h1>

      <div className="pomodoro-layout">
        <div className="glass-card stats">
          <h2>Study Statistics</h2>
          <p>Total Sessions: {stats.totalSessions}</p>
          <p>Study Time: {stats.totalStudyTime}m</p>
          <p>Tasks Done: {stats.tasksDone}</p>
        </div>

        <div className="glass-card timer">
          <h2>{formatTime(time)}</h2>
          <div className="buttons">
            <button onClick={() => setRunning(!running)}>
              {running ? "Pause" : "Start"}
            </button>
            <button
              onClick={() => {
                setRunning(false);
                setElapsed(0);
                if (mode === "focus") setTime(settings.focusTime * 60);
                else if (mode === "short") setTime(settings.shortBreak * 60);
                else setTime(settings.longBreak * 60);
              }}
            >
              Reset
            </button>
            <button onClick={saveData}>Save</button>
          </div>
        </div>

        <div className="right-cards">
          <div className="glass-card todo">
            <h3>To-Do List</h3>
            <div className="todo-input">
              <input
                type="text"
                placeholder="Add a new task..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTodo()}
              />
              <button onClick={addTodo}>+</button>
            </div>

            <div className="todo-list">
              {stats.todos.length === 0 ? (
                <p>No tasks yet</p>
              ) : (
                stats.todos.map((todo, i) => (
                  <div key={i} className="todo-item">
                    <span
                      onClick={() => toggleTodo(i)}
                      style={{
                        textDecoration: todo.done ? "line-through" : "none",
                        opacity: todo.done ? 0.6 : 1,
                        cursor: "pointer",
                      }}
                    >
                      {todo.text}
                    </span>
                    <button onClick={() => deleteTodo(i)}>✕</button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card quick-note">
            <h3>Quick Note</h3>
            <textarea
              value={stats.notes}
              onChange={(e) => {
                const next = { ...stats, notes: e.target.value };
                setStats(next);
                persistStats(next);
              }}
              placeholder="Write notes..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
