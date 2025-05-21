import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./OrdersPage.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  /* ---------- fetch my orders once ---------- */
  useEffect(() => {
    if (!token) {
      setError("You must be logged in to view your orders.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:8080/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then(setOrders)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  /* ---------- cancel order ---------- */
  const handleCancel = async (orderId) => {
    const res = await fetch(
      `http://localhost:8080/api/orders/${orderId}/cancel`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.ok) {
      // update UI list
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId ? { ...o, status: "CANCELLED" } : o
        )
      );
      alert("Order cancelled and stock restored.");
    } else {
      const msg = await res.text();
      alert(msg || "Could not cancel order.");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
        case 'PROCESSED':
            return 'status-pending';
        case 'TRANSFER':
            return 'status-transfer';
        case 'DELIVERED':
            return 'status-completed';
        case 'CANCELLED':
            return 'status-cancelled';
        default:
            return 'status-pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
        case 'PROCESSED':
            return 'Processing';
        case 'TRANSFER':
            return 'In Transit';
        case 'DELIVERED':
            return 'Delivered';
        case 'CANCELLED':
            return 'Cancelled';
        default:
            return 'Processing';
    }
  };

  // Possible order statuses
  const ORDER_STATUSES = [
    { value: 'PROCESSED', label: 'Processing' },
    { value: 'TRANSFER', label: 'In Transit' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  // Track status selection for each order
  const [statusSelections, setStatusSelections] = useState({});

  const handleStatusChange = (orderId, newStatus) => {
    setStatusSelections(prev => ({ ...prev, [orderId]: newStatus }));
  };

  const handleUpdateStatus = async (orderId) => {
    const newStatus = statusSelections[orderId];
    if (!newStatus) return;
    try {
      const res = await fetch(`http://localhost:8080/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        alert('Order status updated.');
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      alert('Error updating status.');
    }
  };

  /* ---------- render ---------- */

  if (loading)
    return (
      <div className="orders-container flex-center">
        <p>Loading your orders…</p>
      </div>
    );

  if (error)
    return (
      <div className="orders-container flex-center">
        <p className="error-message">{error}</p>
        <Link to="/login" className="btn-link">Go to Login</Link>
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="orders-container flex-center">
        <p>You haven't placed any orders yet.</p>
        <Link to="/" className="btn-link">Continue Shopping</Link>
      </div>
    );

  return (
    <div className="orders-container">
      <h2>Your Orders</h2>

      {orders.map((order) => (
        <div key={order.id} className="order-card">

          {/* ---------- header ---------- */}
          <div className="order-header">
            <div>
              <span className="order-id">Order #{order.id}</span>
            </div>
            <div className="order-meta">
              <div className="order-status">
                <span className={getStatusClass(order.status)}>
                  {getStatusText(order.status)}
                </span>
              </div>
              <span className="order-date">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* ---------- body ---------- */}
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

            {/* ---------- actions ---------- */}
            <div className="order-actions">
              <button
                className="view-receipt-btn"
                onClick={() => navigate(`/receipt/${order.id}`)}
              >
                View Receipt
              </button>

              {order.status === "PROCESSED" && (
                <button
                  className="cancel-order-btn"
                  onClick={() => handleCancel(order.id)}
                >
                  Cancel Order
                </button>
              )}

              {/* Admin status update controls (show to all for demo) */}
              <div style={{ marginTop: 12 }}>
                <select
                  value={statusSelections[order.id] || order.status}
                  onChange={e => handleStatusChange(order.id, e.target.value)}
                  style={{ marginRight: 8 }}
                >
                  {ORDER_STATUSES.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleUpdateStatus(order.id)}
                  disabled={(statusSelections[order.id] || order.status) === order.status}
                  style={{ padding: '4px 12px' }}
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;
