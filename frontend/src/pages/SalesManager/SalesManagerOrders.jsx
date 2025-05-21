import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const SalesManagerOrders = () => {
    const isSales = localStorage.getItem("isSales") === "true";
    const token = localStorage.getItem("token");

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        if (!isSales) return;

        fetch("http://localhost:8080/api/orders", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch orders");
                return res.json();
            })
            .then(setOrders)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [isSales, token]);

    const downloadInvoice = (orderId) => {
        // Placeholder implementation
        alert(`Invoice for Order ${orderId} would be downloaded here.`);
    };

    const filteredOrders = orders.filter(order => {
        const orderTime = new Date(order.createdAt).getTime();
        const startTime = startDate ? new Date(startDate).getTime() : 0;
        const endTime   = endDate ? new Date(endDate).getTime() : Infinity;

        return orderTime >= startTime && orderTime <= endTime;
    });


    if (!isSales) return <Navigate to="/login" replace />;
    if (loading) return <p style={{ textAlign: "center" }}>Loading orders…</p>;
    if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

    return (
        <div style={{ padding: "2rem" }}>
            <h2 style={{ textAlign: "center" }}>All Orders</h2>
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ marginRight: "1rem" }}
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>

            {filteredOrders.length === 0 ? (
                <p style={{ textAlign: "center" }}>No orders found in selected range.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>User</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Invoice</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredOrders.map(order => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.userEmail}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>${order.total.toFixed(2)}</td>
                            <td>{order.status}</td>
                            <td>
                                <button onClick={() => downloadInvoice(order.id)}>
                                    Download
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default SalesManagerOrders;