
export function getMyId() {
  const raw = JSON.parse(localStorage.getItem("user") || "{}");

  // Prefer the stored object if it happens to have an id
  if (raw._id) return String(raw._id);
  if (raw.id)  return String(raw.id);

  // Fall back to decoding the JWT — it always has `id`
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.id)  return String(payload.id);
      if (payload._id) return String(payload._id);
    } catch {}
  }

  return "";
}