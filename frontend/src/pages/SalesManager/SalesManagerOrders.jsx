import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import jsPDF from "jspdf";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button
} from "@mui/material";
import axios from "axios";

const loadImageAsBase64 = (url) =>
    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error("Image fetch failed");
            return res.blob();
        })
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => reject("Failed to read image as base64");
            reader.readAsDataURL(blob);
        }));

const RevenueChart = ({ orders }) => {
    const sortedOrders = [...orders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    let cumulative = 0;
    const data = sortedOrders.map(order => {
        cumulative += order.total || 0;
        return {
            date: new Date(order.createdAt).toLocaleDateString(),
            cumulativeRevenue: cumulative.toFixed(2),
        };
    });

    return (
        <div style={{ marginBottom: "3rem" }}>
            <h3 style={{ textAlign: "center" }}>Cumulative Revenue Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="cumulativeRevenue" stroke="#007bff" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const SalesManagerOrders = () => {
    const isSales = localStorage.getItem("isSales") === "true";
    const token = localStorage.getItem("token");

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [refundMessage, setRefundMessage] = useState('');
    const [openRefundDialog, setOpenRefundDialog] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const fetchOrders = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/orders/all", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to fetch orders");
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

    const filteredOrders = orders.filter(order => {
        if (!startDate && !endDate) return true;

        const created = new Date(order.createdAt);
        const start = startDate ? new Date(startDate + "T00:00:00") : new Date("0000-01-01");
        const end = endDate ? new Date(endDate + "T23:59:59") : new Date("9999-12-31");

        return created >= start && created <= end;
    });

    const downloadInvoice = async (order) => {
        const doc = new jsPDF();

        try {
            const logoBase64 = await loadImageAsBase64(
                "https://res.cloudinary.com/xxx/image/upload/w_150,f_auto/logo.png"
            );
            doc.addImage(logoBase64, "PNG", 150, 10, 40, 20);
        } catch (err) {
            console.warn("⚠️ Logo yüklenemedi.");
        }

        doc.setFontSize(18);
        doc.text("BiblioSphere Invoice", 14, 22);

        doc.setFontSize(12);
        doc.text(`Order ID: ${order.id}`, 14, 35);
        doc.text(`Email: ${order.userEmail}`, 14, 42);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 49);

        let currentY = 60;

        doc.setFontSize(14);
        doc.text("Products:", 14, currentY);
        currentY += 5;

        for (let item of order.items || []) {
            const { title: productName, quantity, price, image } = item;

            if (currentY > 270) {
                doc.addPage();
                currentY = 20;
            }

            try {
                const optimizedImageUrl = image.replace("/upload/", "/upload/w_100,h_100,c_fill,f_auto/");
                const imageBase64 = await loadImageAsBase64(optimizedImageUrl);
                doc.addImage(imageBase64, "JPEG", 14, currentY, 25, 25);
            } catch (err) {
                console.warn(`⚠️ Görsel yüklenemedi: ${image}`);
            }

            doc.setFontSize(11);
            doc.text(`Product: ${productName}`, 42, currentY + 5);
            doc.text(`Qty: ${quantity}`, 42, currentY + 11);
            doc.text(`Price: $${price.toFixed(2)}`, 42, currentY + 17);
            doc.text(`Total: $${(quantity * price).toFixed(2)}`, 42, currentY + 23);

            currentY += 35;
        }

        doc.setFontSize(13);
        doc.text(`Total Amount: $${order.total?.toFixed(2) ?? "N/A"}`, 14, currentY + 10);

        doc.save(`invoice-${order.id}.pdf`);
    };

    const handleRefundDecision = async (orderId, action) => {
        const confirmed = window.confirm(`Are you sure you want to ${action} the refund?`);
        if (!confirmed) return;

        try {
            const res = await fetch(`http://localhost:8080/api/orders/${orderId}/refund/${action}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error("Failed to update refund status");

            const updated = await res.json();
            setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleRefundResponse = async (orderId, isAccepted, message) => {
        try {
            await axios.post(`http://localhost:8080/api/sales-manager/refund/${orderId}/status`, {
                isAccepted,
                message
            });
            setSnackbar({
                open: true,
                message: 'Refund response sent successfully',
                severity: 'success'
            });
            fetchOrders(); // Refresh the orders list
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error sending refund response',
                severity: 'error'
            });
        }
    };

    if (!isSales) return <Navigate to="/login" replace />;
    if (loading) return <p style={{ textAlign: "center" }}>Loading orders…</p>;
    if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

    return (
        <div style={{ padding: "2rem", maxWidth: "1000px", margin: "auto" }}>
            <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>All Orders</h2>

            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                        marginRight: "1rem",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        fontSize: "1rem"
                    }}
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        fontSize: "1rem"
                    }}
                />
            </div>

            {filteredOrders.length > 0 && <RevenueChart orders={filteredOrders} />}

            {filteredOrders.length === 0 ? (
                <p style={{ textAlign: "center" }}>No orders found in selected range.</p>
            ) : (
                filteredOrders.map(order => (
                    <div
                        key={order.id}
                        style={{
                            background: "#f9f9f9",
                            padding: "1rem",
                            marginBottom: "1rem",
                            borderRadius: "10px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                            <div style={{ flex: "1 1 60%" }}>
                                <h4 style={{ margin: 0 }}>Order ID: {order.id}</h4>
                                <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", color: "#555" }}>
                                    {order.userEmail}
                                </p>
                                <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", color: "#777" }}>
                                    {new Date(order.createdAt).toLocaleDateString()} — ${order.total?.toFixed(2) ?? "N/A"}
                                </p>
                            </div>
                            <div style={{ flex: "1 1 35%", textAlign: "right" }}>
                                <p>Status: <strong>{order.status}</strong></p>
                                <p>Refund: {order.refundStatus || "N/A"}</p>
                                <div style={{ marginTop: "0.5rem" }}>
                                    {order.refundStatus === "PENDING" && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setOpenRefundDialog(true);
                                                }}
                                                style={buttonStyle("#007bff")}
                                            >
                                                Respond
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => downloadInvoice(order)}
                                        style={buttonStyle("#007bff")}
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}

            <Dialog open={openRefundDialog} onClose={() => setOpenRefundDialog(false)}>
                <DialogTitle>Respond to Refund Request</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Message to Customer"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={refundMessage}
                        onChange={(e) => setRefundMessage(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRefundDialog(false)}>Cancel</Button>
                    <Button 
                        onClick={() => {
                            handleRefundResponse(selectedOrder?.id, true, refundMessage);
                            setOpenRefundDialog(false);
                            setRefundMessage('');
                        }} 
                        color="primary"
                    >
                        Accept Refund
                    </Button>
                    <Button 
                        onClick={() => {
                            handleRefundResponse(selectedOrder?.id, false, refundMessage);
                            setOpenRefundDialog(false);
                            setRefundMessage('');
                        }} 
                        color="error"
                    >
                        Reject Refund
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

const buttonStyle = (bg) => ({
    backgroundColor: bg,
    color: "white",
    padding: "0.4rem 0.75rem",
    margin: "0.25rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem"
});

export default SalesManagerOrders;