import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ResourceHub.css";

export default function ResourceHub() {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    link: "",
    uploadedBy: "",
    subject: "",
  });

  const [filterSubject, setFilterSubject] = useState("All");

  // Fetch all resources and saves them into resource state
  const fetchResources = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/resources");
      setResources(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  useEffect(() => {                   //to load data when page is reloaded
    fetchResources();
  }, []);

  //Add new resource  after getting user token
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      await axios.post("http://localhost:3001/api/resources", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setForm({
        title: "",                          //clears all input boxes
        description: "",
        link: "",
        uploadedBy: "",
        subject: "",
      });

      fetchResources();
    } catch (err) {
      console.error("Add failed", err);
    }
  };

  //Delete resource after getting user token
  const deleteResource = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:3001/api/resources/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchResources();                   //refreshes list
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  //Build list for unique subjects
  const subjects = Array.from(
    new Set(
      resources
        .map((r) => (r.subject || "").trim())
        .filter((s) => s.length > 0)
    )
  );

  // Apply filter
  const filtered =
    filterSubject === "All"
      ? resources
      : resources.filter(
          (r) => (r.subject || "").trim() === filterSubject           //else show matches subj resources
        );

  return (
    <div className="app-shell">
      <h2 className="section-title">Resource Hub</h2>

      <form
        className="card"
        onSubmit={handleSubmit}
        style={{ marginBottom: 20 }}
      >
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          required
        />

        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <input
          placeholder="Resource Link"
          value={form.link}
          onChange={(e) =>
            setForm({ ...form, link: e.target.value })
          }
          required
        />

        <input
          placeholder="Subject"
          value={form.subject}
          onChange={(e) =>
            setForm({ ...form, subject: e.target.value })
          }
        />

        <input
          placeholder="Uploaded By"
          value={form.uploadedBy}
          onChange={(e) =>
            setForm({ ...form, uploadedBy: e.target.value })
          }
        />

        <button className="btn" type="submit">
          Add Resource
        </button>
      </form>

      <div className="card" style={{ marginBottom: 20 }}>
        <label>Filter by Subject:</label>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          style={{ padding: 6, marginTop: 6 }}
        >
          <option value="All">All</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="resource-grid">
        {filtered.map((res) => (
          <div key={res._id} className="card resource-card">
            <h3>{res.title}</h3>
            <p>{res.description}</p>

            {res.subject && (
              <p style={{ opacity: 0.8 }}>
                <b>Subject:</b> {res.subject}
              </p>
            )}

            <a
              href={res.link}
              target="_blank"
              rel="noreferrer"
              className="btn"
              style={{ marginTop: 8 }}
            >
              Open
            </a>

            <p style={{ marginTop: 6, opacity: 0.7 }}>
              Uploaded by: {res.uploadedBy}
            </p>

            <button
              className="btn"
              style={{ marginTop: 10 }}
              onClick={() => deleteResource(res._id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
