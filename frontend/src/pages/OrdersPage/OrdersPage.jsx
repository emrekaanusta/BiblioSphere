import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./OrdersPage.css";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

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

    const handleCancel = async (orderId) => {
        const res = await fetch(`http://localhost:8080/api/orders/${orderId}/cancel`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
            setOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, status: "CANCELLED" } : o)
            );
            alert("Order cancelled and stock restored.");
        } else {
            const msg = await res.text();
            alert(msg || "Could not cancel order.");
        }
    };

    const handleRefundRequest = async (orderId) => {
        const res = await fetch(`http://localhost:8080/api/orders/${orderId}/refund`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
            setOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, status: "REFUND_PENDING" } : o)
            );
            alert("Refund requested. Awaiting approval.");
        } else {
            const msg = await res.text();
            alert(msg || "Could not request refund.");
        }
    };

    const isWithin30Days = (createdAt) => {
        const orderDate = new Date(createdAt);
        const now = new Date();
        const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
        return diffDays <= 30;
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'PROCESSED': return 'status-pending';
            case 'TRANSFER': return 'status-transfer';
            case 'DELIVERED': return 'status-completed';
            case 'REFUND_PENDING': return 'status-warning';
            case 'REFUNDED': return 'status-refunded';
            case 'CANCELLED': return 'status-cancelled';
            default: return 'status-pending';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PROCESSED': return 'Processing';
            case 'TRANSFER': return 'In Transit';
            case 'DELIVERED': return 'Delivered';
            case 'REFUND_PENDING': return 'Refund Pending';
            case 'REFUNDED': return 'Refunded';
            case 'CANCELLED': return 'Cancelled';
            default: return 'Processing';
        }
    };

    if (loading) return <div className="orders-container flex-center"><p>Loading your orders…</p></div>;
    if (error) return <div className="orders-container flex-center"><p className="error-message">{error}</p><Link to="/login" className="btn-link">Go to Login</Link></div>;
    if (orders.length === 0) return <div className="orders-container flex-center"><p>You haven't placed any orders yet.</p><Link to="/" className="btn-link">Continue Shopping</Link></div>;

    return (
        <div className="orders-container">
            <h2>Your Orders</h2>
            {orders.map((order) => (
                <div key={order.id} className="order-card">
                    <div className="order-header">
                        <div><span className="order-id">Order #{order.id}</span></div>
                        <div className="order-meta">
                            <div className="order-status">
                                <span className={getStatusClass(order.status)}>{getStatusText(order.status)}</span>
                            </div>
                            <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="order-body">
                        <table className="order-items-table">
                            <thead>
                            <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
                            </thead>
                            <tbody>
                            {order.items.map((it) => (
                                <tr key={it.productId}>
                                    <td>
                                        <Link to={`/books/${it.productId}`} className="book-link">
                                            {it.title || "Unknown Book"}
                                        </Link>
                                    </td>
                                    <td>{it.quantity}</td>
                                    <td>${(it.price * it.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <div className="order-summary-line"><span>Shipping:</span><span>{order.shippingMethod}</span></div>
                        <div className="order-summary-line total"><span>Total:</span><span>${order.total.toFixed(2)}</span></div>
                        <div className="order-actions">
                            <button className="view-receipt-btn" onClick={() => navigate(`/receipt/${order.id}`)}>View Receipt</button>
                            {order.status === "PROCESSED" && (
                                <button className="cancel-order-btn" onClick={() => handleCancel(order.id)}>Cancel Order</button>
                            )}
                            {order.status === "DELIVERED" && isWithin30Days(order.createdAt) && (
                                <button className="refund-order-btn" onClick={() => handleRefundRequest(order.id)}>Request Refund</button>
                            )}
                            {order.status === "REFUND_PENDING" && (
                                <p className="refund-status-msg">Refund request is being reviewed.</p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Orders;
