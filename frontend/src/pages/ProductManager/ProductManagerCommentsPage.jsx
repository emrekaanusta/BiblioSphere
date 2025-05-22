// frontend/src/pages/ProductManager/ProductManagerCommentsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import './ProductManagerCommentsPage.css';

const BACKEND = 'http://localhost:8080';

export default function ProductManagerCommentsPage() {
  const isPM = localStorage.getItem('isPM') === 'true';
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isPM) {
      setLoading(false);
      return;
    }
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    axios
      .get(`${BACKEND}/api/ratings`, { headers })
      .then(res => setRatings(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [isPM]);

  if (!isPM && !loading) {
    return <Navigate to="/login" replace />;
  }
  if (loading) {
    return <div className="pm-loading">Loading…</div>;
  }
  if (error) {
    return <div className="pm-error">Error loading ratings.</div>;
  }

  const toggleVisibility = (id, vis) => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    axios
      .patch(`${BACKEND}/api/ratings/${id}`, { visible: !vis }, { headers })
      .then(res => {
        setRatings(rs => rs.map(r => (r.id === id ? res.data : r)));
      })
      .catch((err) => {
  console.error('PATCH error:', err);
  alert('Failed to update');
});
  };

  return (
    <div className="pm-container">
      <h1>Product Manager — Ratings</h1>
      <table className="pm-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Username</th>
            <th>Email</th>
            <th>Comment</th>
            <th>Visible</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
  {ratings.map(r => {
    const userMatch = /User\(.*?email=(.*?),.*?name=(.*?),/.exec(r.userId) || [];
    const email = userMatch[1] || '—';
    const username = userMatch[2] || '—';

    return (
      <tr key={r.id} className={!r.visible ? 'pm-hidden' : ''}>
        <td>{r.id}</td>
        <td>{r.productId}</td>
        <td>{username}</td>
        <td>{email}</td>
        <td>{r.comment}</td>
        <td>{r.visible ? 'Yes' : 'No'}</td>
        <td>
          <button
            className={`pm-btn ${r.visible ? 'hide' : 'show'}`}
            onClick={() => toggleVisibility(r.id, r.visible)}
          >
            {r.visible ? 'Hide' : 'Show'}
          </button>
        </td>
      </tr>
    );
  })}
</tbody>

      </table>
    </div>
  );
}
