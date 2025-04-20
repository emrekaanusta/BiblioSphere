import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // add useNavigate
import "./OrdersPage.css";

import RatingForm from "../../components/RatingForm";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // add this

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
      {orders.map((order, index) => (
        <div key={order.id || index} className="order-card">
        <div className="order-header">
          <div>
            <span className="order-id">Order #{order.id}</span>
          </div>
          <div className="order-meta">
            <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
            <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
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
  <React.Fragment key={it.productId}>
    <tr>
      <td>{it.title}</td>
      <td>{it.quantity}</td>
      <td>${(it.price * it.quantity).toFixed(2)}</td>
    </tr>

  </React.Fragment>
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

            <button
              className="view-receipt-btn"
              onClick={() => navigate(`/receipt/${order.id}`)}
            >
              View Receipt
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;
