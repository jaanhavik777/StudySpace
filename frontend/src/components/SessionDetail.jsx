import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./SessionDetail.css";

const API = process.env.REACT_APP_API || "https://studyspace-q5gn.onrender.com"
export default function SessionDetail() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("token");

    axios
      .get(`${API}/api/sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSession(res.data))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="app-shell">Loading session...</div>;

  if (!session)
    return (
      <div className="app-shell">
        <h2>Session not found</h2>
        <Link to="/sessions">Back to sessions</Link>
      </div>
    );

  return (
    <div className="app-shell">
      <div className="card">
        <h1>{session.title}</h1>

        {session.description && <p>{session.description}</p>}

        {session.link && (
          <p>
            <strong>Link: </strong>
            <a href={session.link} target="_blank" rel="noreferrer">
              {session.link}
            </a>
          </p>
        )}

        <div style={{ marginTop: 16 }}>
          <Link to="/sessions" className="btn">
            Back to sessions
          </Link>
        </div>
      </div>
    </div>
  );
}
