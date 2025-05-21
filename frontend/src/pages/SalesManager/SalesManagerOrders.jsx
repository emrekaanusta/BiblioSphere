// Refund logic with email notification (SalesManagerOrders.jsx)
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { Button } from "@mui/material";

const SalesManagerOrders = () => {
    const isSales = localStorage.getItem("isSales") === "true";
    const token = localStorage.getItem("token");

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/orders/refunds/pending", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to fetch pending refunds");
            const data = await response.json();
            setOrders(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isSales) return;
        fetchOrders();
    }, [isSales, token]);

    const sendRefundEmail = (order, action) => {
        const email = order?.shippingInfo?.email || order.userEmail || "";
        const name = order?.shippingInfo
            ? `${order.shippingInfo.firstName || ""} ${order.shippingInfo.lastName || ""}`.trim()
            : order.userEmail;

        const templateParams = {
            to_email: email,
            order_date: new Date(order.createdAt).toLocaleDateString(),
            refund_status: action === "accept" ? "APPROVED" : "REJECTED",
            name,
            order_id: order.id,
        };

        if (!email || !name || !order.id) {
            console.warn("Missing email parameters:", templateParams);
            return;
        }

        emailjs.send(
            "service_sp2mkzq",
            "template_ipwyftj",
            templateParams,
            "YHWWSBWcWWeVfPUUd"
        ).then(() => {
            console.log(`Refund ${action} email sent to ${templateParams.to_email}`);
        }).catch((err) => {
            console.error("Failed to send refund status email", err);
        });
    };

    const handleRefundDecision = async (orderId, action) => {
        const confirmed = window.confirm(`Are you sure you want to ${action} this refund request?`);
        if (!confirmed) return;

        try {
            const res = await fetch(`http://localhost:8080/api/orders/refunds/${orderId}?action=${action}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error("Failed to update refund status");
            const updated = await res.json();
            sendRefundEmail(updated, action);
            setOrders(prev => prev.filter(o => o.id !== orderId));
        } catch (err) {
            alert(err.message);
        }
    };

    if (!isSales) return <Navigate to="/login" replace />;
    if (loading) return <p style={{ textAlign: "center" }}>Loading refund requests…</p>;
    if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

    return (
        <div style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
            <h2>Sales Manager - Refund Requests</h2>

            {orders.length === 0 ? (
                <p style={{ textAlign: "center" }}>No refund requests pending.</p>
            ) : (
                orders.map(order => (
                    <div key={order.id} style={{ background: "#f7f7f7", padding: 20, borderRadius: 10, marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div>
                                <strong>Order ID:</strong> {order.id}<br />
                                <strong>User:</strong> {order.userEmail}<br />
                                <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}<br />
                                <strong>Status:</strong> {order.status}
                            </div>
                            <div>
                                <Button
                                    variant="contained"
                                    color="success"
                                    style={{ marginRight: 8 }}
                                    onClick={() => handleRefundDecision(order.id, "accept")}
                                >
                                    Accept
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleRefundDecision(order.id, "reject")}
                                >
                                    Reject
                                </Button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default SalesManagerOrders;