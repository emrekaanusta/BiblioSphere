import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ProductManagerOrderControl = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const token                  = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:8080/api/orders/all", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then(setOrders)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const updateStatus = async (orderId, newStatus) => {
    const res = await fetch(`http://localhost:8080/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders(prev =>
        prev.map(o => (o._id === orderId ? updated : o))
      );
    } else {
      alert("Failed to update status");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading orders…</p>;
  if (error)   return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  if (orders.length === 0) return <p style={{ textAlign: "center" }}>No orders found.</p>;

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>All Orders</h2>

      {orders.map(order => {
        // ——— Extract only the email from order.userEmail ———
        const raw = order.userEmail || "";
        const match = raw.match(/email=([^,]+)/i);
        const customerEmail = match ? match[1] : raw;

        return (
          <div
            key={order._id}
            style={{
              background: "#fff",
              borderRadius: "8px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
              marginBottom: "1.5rem",
              overflow: "hidden"
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                background: "#f5f5f5",
                padding: "1rem 1.5rem",
                alignItems: "center"
              }}
            >
              <div>
                <strong>Order # {order.id || order._id}</strong><br />
                <small>
                  Date: {new Date(order.createdAt).toLocaleString()}
                </small>
              </div>
              <div>
                <label htmlFor={`status-${order._id}`} style={{ marginRight: 8 }}>
                  Status:
                </label>
                <select
                  id={`status-${order._id}`}
                  value={order.status}
                  onChange={e => updateStatus(order._id, e.target.value)}
                  style={{ padding: "0.5rem", borderRadius: "4px" }}
                >
                  <option value="PROCESSED">Processed</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Customer Email / Shipping / Totals */}
            <div style={{ display: "flex", padding: "1rem 1.5rem", gap: "2rem" }}>
              <div style={{ flex: 1 }}>
                <h4>Customer Email</h4>
                <p>{customerEmail}</p>
              </div>
              <div style={{ flex: 1 }}>
                <h4>Shipping</h4>
                {order.shippingInfo ? (
                  <>
                    <p>{order.shippingInfo.address}</p>
                    <p>
                      {order.shippingInfo.city}, {order.shippingInfo.zipCode}
                    </p>
                  </>
                ) : (
                  <p>—</p>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h4>Totals</h4>
                <p>Subtotal: ${order.subtotal?.toFixed(2) ?? "0.00"}</p>
                <p>Shipping: ${order.shippingCost?.toFixed(2) ?? "0.00"}</p>
                <p><strong>Total: ${order.total?.toFixed(2) ?? "0.00"}</strong></p>
              </div>
            </div>

            {/* Line Items with Book Thumbnails */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#fafafa" }}>
                <tr>
                  <th style={{ textAlign: "left", padding: "0.75rem" }}>Book</th>
                  <th style={{ textAlign: "center", padding: "0.75rem" }}>Qty</th>
                  <th style={{ textAlign: "right", padding: "0.75rem" }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} style={{ borderTop: "1px solid #eee" }}>
                    <td style={{ display: "flex", alignItems: "center", padding: "0.75rem" }}>
                      <img
                        src={item.image || "https://via.placeholder.com/60x90?text=No+Image"}
                        alt={item.title}
                        style={{ width: 60, height: 90, objectFit: "cover", marginRight: 12 }}
                      />
                      <Link
                        to={`/books/${item.productId}`}
                        style={{ textDecoration: "none", color: "#333" }}
                      >
                        {item.title}
                      </Link>
                    </td>
                    <td style={{ textAlign: "center", padding: "0.75rem" }}>
                      {item.quantity}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.75rem" }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default ProductManagerOrderControl;
