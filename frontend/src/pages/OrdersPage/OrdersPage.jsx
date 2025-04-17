import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./OrdersPage.css"; // create minimal styles or reuse your utility classes

/**
 * Orders.jsx – lists the signed‑in user's past orders.
 *
 * Expected back‑end contract (adjust if different):
 *   GET  /api/orders
 *   Headers:  Authorization: Bearer <jwt>
 *   Response: [
 *     {
 *       id: string,
 *       createdAt: string (ISO date),
 *       total: number,
 *       shippingMethod: string,
 *       items: [{ productId, title, quantity, price }]
 *     }, ...
 *   ]
 */

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to view your orders.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:8080/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then((data) => setOrders(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="orders-container flex-center">
        <p>Loading your orders…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container flex-center">
        <p className="error-message">{error}</p>
        <Link to="/login" className="btn-link">Go to Login</Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container flex-center">
        <p>You haven't placed any orders yet.</p>
        <Link to="/" className="btn-link">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h2>Your Orders</h2>
      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <div className="order-header">
            <span className="order-id">Order #{order.id}</span>
            <span className="order-date">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="order-body">
            <table className="order-items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.productId}>
                    <td>{it.title}</td>
                    <td>{it.quantity}</td>
                    <td>${(it.price * it.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="order-summary-line">
              <span>Shipping:</span>
              <span>{order.shippingMethod}</span>
            </div>
            <div className="order-summary-line total">
              <span>Total:</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;

/**
 * Quick CSS ideas (Orders.css):
 *
 * .orders-container { padding: 2rem; max-width: 800px; margin: 0 auto; }
 * .order-card { border: 1px solid #ddd; border-radius: 12px; margin-bottom: 2rem; padding: 1.5rem; }
 * .order-header { display: flex; justify-content: space-between; margin-bottom: 1rem; font-weight: 600; }
 * .order-items-table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
 * .order-items-table th, .order-items-table td { padding: 0.5rem; border-bottom: 1px solid #eee; text-align: left; }
 * .order-summary-line { display: flex; justify-content: space-between; margin-top: 0.25rem; }
 * .total { font-weight: 700; }
 * .flex-center { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 40vh; }
 * .btn-link { color: #1d4ed8; margin-top: 1rem; }
 */
