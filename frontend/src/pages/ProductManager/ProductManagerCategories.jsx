// frontend/src/pages/ProductManager/ProductManagerCategoryControl.jsx
import React, { useState, useEffect } from "react";

const API = "http://localhost:8080/api/categories";
const authHeader = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
});

export default function ProductManagerCategoryControl() {
  const [categories, setCategories] = useState([]);   // [{id,name}, …]
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState(null);

  /* ────────── Fetch categories on mount ────────── */
  useEffect(() => {
    fetch(API)
      .then(r => (r.ok ? r.json() : Promise.reject(r)))
      .then(data => setCategories(data))              // keep id + name
      .catch(() => setError("Failed to load categories"));
  }, []);

  /* ────────── Add a category ────────── */
  const handleAdd = async e => {
    e.preventDefault();
    const name = newCategory.trim();
    if (!name)        return setError("Name cannot be empty");
    if (categories.some(c => c.name === name))
                     return setError("Category already exists");
    setError(null);

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ name })
      });
      if (!res.ok) throw res;
      const created = await res.json();               // {id,name}
      setCategories(prev => [...prev, created]);
      setNewCategory("");
    } catch {
      setError("Failed to add category");
    }
  };

  /* ────────── Delete a category ────────── */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
          headers: {
    "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
    "Content-Type": "application/json"
  }
      });
      if (!res.ok) throw res;
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch {
      setError("Failed to delete category");
    }
  };

  /* ────────── UI ────────── */
  return (
    <div style={{ padding: "2rem", maxWidth: 600, margin: "auto" }}>
      <h2 style={{ textAlign: "center" }}>All Categories</h2>

      <form onSubmit={handleAdd}
            style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <input
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          placeholder="New category name"
          style={{ padding: ".5rem", width: "60%", marginRight: ".5rem" }}
        />
        <button style={{ padding: ".5rem 1rem", cursor: "pointer" }}>
          Add Category
        </button>
      </form>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {categories.map(c => (
          <li key={c.id}
              style={{ display:"flex", justifyContent:"space-between",
                       padding: ".5rem 0", borderBottom: "1px solid #ddd" }}>
            <span>{c.name}</span>
            <button
              onClick={() => handleDelete(c.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "#c00",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
