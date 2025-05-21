import React, { useEffect, useState } from "react";

const ProductManagerOrderControl = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");

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
            setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        } else {
            alert("Failed to update status");
        }
    };

    if (loading) return <p style={{ textAlign: "center" }}>Loading orders…</p>;
    if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
    if (orders.length === 0) return <p style={{ textAlign: "center" }}>No orders found.</p>;

    return (
        <div style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
            <h2 style={{ textAlign: "center" }}>All Orders</h2>
            {orders.map(order => (
                <div key={order.id} style={{ borderBottom: "1px solid #ccc", padding: "1rem 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <strong>Order #{order.id}</strong><br />
                            <span>Status: {order.status}</span><br />
                            <span>Total: ${order.total.toFixed(2)}</span><br />
                            <small>{new Date(order.createdAt).toLocaleString()}</small>
                        </div>
                        <div>
                            <select
                                value={order.status}
                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                style={{ padding: "0.5rem", borderRadius: "4px" }}
                            >
                                <option value="PROCESSED">Processed</option>
                                <option value="TRANSFER">Transfer</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductManagerOrderControl;